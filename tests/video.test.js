// /video/*: byte ranges in the Worker. Safari on iPhone plays a video only from
// a server that answers Range with 206; static assets answer it with the whole
// file (200), so worker-lib.js cuts the range out. Run with `npm test`.

import { test } from "node:test";
import assert from "node:assert/strict";

import worker from "../worker.js";
import { parseRange } from "../worker-lib.js";

const ORIGIN = "https://talentradar.eu";
const FILE = new Uint8Array(1000).map((_, i) => i % 251);

/** Static assets as they behave today: Range ignored, the whole file, 200. Chunks of 64 bytes. */
function assets({ native206 = false, length = true } = {}) {
  const seen = [];
  return {
    seen,
    async fetch(req) {
      const url = new URL(req.url);
      seen.push({ path: url.pathname, range: req.headers.get("Range") });
      if (!url.pathname.endsWith(".mp4") && !url.pathname.endsWith(".vtt")) return new Response("not found", { status: 404 });
      if (native206 && req.headers.get("Range")) {
        return new Response(FILE.slice(0, 2), { status: 206, headers: { "Content-Range": `bytes 0-1/${FILE.length}`, "Content-Length": "2", "Content-Type": "video/mp4" } });
      }
      let i = 0;
      const body = new ReadableStream({
        pull(c) {
          if (i >= FILE.length) return c.close();
          c.enqueue(FILE.slice(i, i + 64));
          i += 64;
        },
      });
      const headers = { "Content-Type": "video/mp4", ETag: '"v1"' };
      if (length) headers["Content-Length"] = String(FILE.length);
      return new Response(body, { status: 200, headers });
    },
  };
}

const get = (path, headers = {}, env = { ASSETS: assets() }, method = "GET") => worker.fetch(new Request(`${ORIGIN}${path}`, { method, headers }), env, {});
const bytes = async (res) => new Uint8Array(await res.arrayBuffer());

test("bytes=a-b answers 206 with Content-Range and exactly those bytes", async () => {
  const res = await get("/video/hero-v1.mp4", { Range: "bytes=100-299" });
  assert.equal(res.status, 206);
  assert.equal(res.headers.get("Content-Range"), "bytes 100-299/1000");
  assert.equal(res.headers.get("Content-Length"), "200");
  assert.equal(res.headers.get("Accept-Ranges"), "bytes");
  assert.equal(res.headers.get("Content-Type"), "video/mp4");
  assert.deepEqual(await bytes(res), FILE.slice(100, 300));
});

test("Safari's first probe bytes=0-1 gets two bytes", async () => {
  const res = await get("/video/hero-v1.mp4", { Range: "bytes=0-1" });
  assert.equal(res.status, 206);
  assert.equal(res.headers.get("Content-Range"), "bytes 0-1/1000");
  assert.deepEqual(await bytes(res), FILE.slice(0, 2));
});

test("bytes=-N is the last N bytes", async () => {
  const res = await get("/video/hero-v1.mp4", { Range: "bytes=-100" });
  assert.equal(res.status, 206);
  assert.equal(res.headers.get("Content-Range"), "bytes 900-999/1000");
  assert.deepEqual(await bytes(res), FILE.slice(900));
});

test("bytes=a- runs to the end, and an end past the file is cut to it", async () => {
  const open = await get("/video/hero-v1.mp4", { Range: "bytes=990-" });
  assert.equal(open.headers.get("Content-Range"), "bytes 990-999/1000");
  assert.deepEqual(await bytes(open), FILE.slice(990));
  const past = await get("/video/hero-v1.mp4", { Range: "bytes=995-5000" });
  assert.equal(past.headers.get("Content-Range"), "bytes 995-999/1000");
  assert.deepEqual(await bytes(past), FILE.slice(995));
});

test("a range that starts past the end is 416 with the size", async () => {
  const res = await get("/video/hero-v1.mp4", { Range: "bytes=1000-1001" });
  assert.equal(res.status, 416);
  assert.equal(res.headers.get("Content-Range"), "bytes */1000");
  assert.equal((await bytes(res)).length, 0);
  assert.equal((await get("/video/hero-v1.mp4", { Range: "bytes=-0" })).status, 416);
});

test("no Range, a malformed one or several ranges: the whole file, 200, ranges announced", async () => {
  for (const range of [undefined, "bytes=abc", "items=0-1", "bytes=0-1,5-6", "bytes=9-3"]) {
    const res = await get("/video/hero-v1.mp4", range ? { Range: range } : {});
    assert.equal(res.status, 200, String(range));
    assert.equal(res.headers.get("Accept-Ranges"), "bytes");
    assert.equal(res.headers.get("Content-Length"), "1000");
    assert.deepEqual(await bytes(res), FILE, String(range));
  }
});

test("a file without Content-Length is measured and still cut right", async () => {
  const res = await get("/video/hero-v1.mp4", { Range: "bytes=10-19" }, { ASSETS: assets({ length: false }) });
  assert.equal(res.status, 206);
  assert.equal(res.headers.get("Content-Range"), "bytes 10-19/1000");
  assert.deepEqual(await bytes(res), FILE.slice(10, 20));
});

test("should the assets ever answer 206 themselves, that answer is passed on", async () => {
  const res = await get("/video/hero-v1.mp4", { Range: "bytes=0-1" }, { ASSETS: assets({ native206: true }) });
  assert.equal(res.status, 206);
  assert.equal(res.headers.get("Content-Range"), "bytes 0-1/1000");
  assert.equal(res.headers.get("Accept-Ranges"), "bytes");
});

test("HEAD gives the headers without a body", async () => {
  const res = await get("/video/hero-v1.mp4", { Range: "bytes=0-9" }, { ASSETS: assets() }, "HEAD");
  assert.equal(res.status, 206);
  assert.equal(res.headers.get("Content-Length"), "10");
  assert.equal(res.body, null);
});

test("subtitles are text/vtt, a missing video is the assets' 404, POST is refused", async () => {
  const vtt = await get("/video/tour.cs.vtt");
  assert.equal(vtt.headers.get("Content-Type"), "text/vtt; charset=utf-8");
  assert.equal((await get("/video/nope.webm")).status, 404);
  assert.equal((await get("/video/hero-v1.mp4", {}, { ASSETS: assets() }, "POST")).status, 405);
});

test("parseRange edge cases", () => {
  assert.deepEqual(parseRange("bytes=0-0", 10), { start: 0, end: 0 });
  assert.deepEqual(parseRange("bytes=-20", 10), { start: 0, end: 9 });
  assert.equal(parseRange("bytes=10-", 10), "unsatisfiable");
  assert.equal(parseRange("bytes=-", 10), null);
  assert.equal(parseRange(null, 10), null);
});

test("HEAD with the assets' own 206 sends no body and lets the asset body go", async () => {
  let cancelled = false;
  const assets = {
    async fetch() {
      const body = new ReadableStream({ cancel() { cancelled = true; } });
      return new Response(body, { status: 206, headers: { "Content-Range": "bytes 0-1/1000", "Content-Length": "2" } });
    },
  };
  const res = await get("/video/hero-v1.mp4", { Range: "bytes=0-1" }, { ASSETS: assets }, "HEAD");
  assert.equal(res.status, 206);
  assert.equal(res.body, null);
  assert.ok(cancelled);
});
