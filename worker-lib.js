/**
 * What worker.js needs besides its fetch handler: limits, the anti-spam clock,
 * the hero stats, the offline guard for outbound calls, old addresses and the
 * video Range handling. Kept apart because workerd accepts nothing but handlers
 * as named exports of the main module, while the tests import all of this.
 */

import { NOT_FOUND, REDIRECTS } from "./worker-routes.gen.js";

/** The pasted company list, in characters: 150 four-column lines with room to spare. */
export const CLIENTS_TEXT_MAX = 30000;

/** Faster than this from opening the page to sending the form, no person typed it. */
export const MIN_FILL_MS = 2000;

/**
 * How long the form was open before it was sent, in ms, and how we know.
 * The page measures it itself (performance.now(), immune to a wrong clock).
 * A page loaded before that sends only its clock time at load; a visitor whose
 * clock runs ahead of ours makes that negative, which says nothing about speed,
 * so it lets them through rather than taking them for a bot.
 */
export function fillTime(elapsedMs, timestamp, now) {
  const elapsed = Number(elapsedMs);
  if (elapsedMs != null && elapsedMs !== "" && Number.isFinite(elapsed) && elapsed >= 0) {
    return { ms: Math.round(elapsed), source: "page" };
  }
  const loadedAt = parseInt(timestamp, 10);
  if (!loadedAt) return { ms: null, source: "none" };
  const diff = now - loadedAt;
  if (diff < 0) return { ms: Infinity, source: "clock ahead" };
  return { ms: diff, source: "clock" };
}

/**
 * The hero preview's numbers from the sandbox feed, as of its last scan: new roles
 * on the last day of daily_new, companies with a role first seen that day, and
 * roles open 45+ days at the scan (posted date, or first seen when it is later).
 * null when the feed lacks what they need.
 */
export function heroStats(feed) {
  const days = Object.keys((feed && feed.daily_new) || {}).sort();
  const scanAt = Date.parse((feed && feed.scan && feed.scan.at) || "");
  if (!days.length || Number.isNaN(scanAt)) return null;
  const day = days[days.length - 1];
  const hiring = new Set();
  let open45 = 0;
  for (const r of feed.roles || []) {
    const seen = Date.parse(r.seen || "");
    if (Number.isNaN(seen)) continue;
    if (String(r.seen).slice(0, 10) === day) hiring.add(r.co);
    const posted = Date.parse(r.posted || "");
    const since = !Number.isNaN(posted) && posted < seen ? posted : seen;
    if (scanAt - since >= 45 * 86400000) open45 += 1;
  }
  return { day, scan_at: feed.scan.at, new_roles: feed.daily_new[day] || 0, companies_hiring: hiring.size, open_45: open45 };
}

// ── Offline guard ───────────────────────────────────────────────────────────

const LOCAL_HOSTS = /^(localhost|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|0\.0\.0\.0|\[::1\]|.+\.localhost)$/i;

/**
 * True when the Worker must not call anything outside: `npm run dev` sets
 * OFFLINE_DEV=1, and a request to a local host name is offline even without it,
 * so a bare `wrangler dev` never wakes the production app or sends e-mail.
 */
export function isOffline(env, requestUrl) {
  const flag = String((env && env.OFFLINE_DEV) || "").toLowerCase();
  if (flag === "1" || flag === "true") return true;
  try {
    return LOCAL_HOSTS.test(new URL(requestUrl).hostname);
  } catch {
    return false;
  }
}

/**
 * The fetch every outbound call of the Worker goes through. Offline it fails at
 * once, so each caller takes its normal failure path (DNS check lets the address
 * through, a channel counts as failed, the app wake-up is logged) and nothing
 * leaves the machine.
 */
export function outboundFetch(env, requestUrl) {
  if (isOffline(env, requestUrl)) {
    return async (url) => {
      throw new Error(`Offline (local run): outbound call to ${new URL(String(url)).host} not sent`);
    };
  }
  return (...args) => fetch(...args);
}

// ── Old addresses ───────────────────────────────────────────────────────────

/** A 301 to the page's new address for an old one, or null. The query string is kept. */
export function redirectFor(url) {
  const to = Object.prototype.hasOwnProperty.call(REDIRECTS, url.pathname) ? REDIRECTS[url.pathname] : null;
  if (!to) return null;
  return new Response(null, { status: 301, headers: { Location: `${url.origin}${to}${url.search}` } });
}

/** Where the 404 page for a path lives (its language's root), e.g. "/en/404". */
export function notFoundPath(pathname) {
  const hit = NOT_FOUND.find((n) => pathname.startsWith(n.prefix));
  return hit ? hit.page : null;
}

// ── /video/*: byte ranges ───────────────────────────────────────────────────

const VIDEO_TYPES = {
  mp4: "video/mp4",
  webm: "video/webm",
  webp: "image/webp",
  jpg: "image/jpeg",
  vtt: "text/vtt; charset=utf-8",
};

/**
 * Parses a Range header against a file of `size` bytes.
 * { start, end } (inclusive), "unsatisfiable", or null when the header is
 * absent, malformed or asks for several ranges (then the whole file is sent).
 */
export function parseRange(header, size) {
  if (!header) return null;
  const m = /^\s*bytes\s*=\s*(\d*)\s*-\s*(\d*)\s*$/i.exec(header);
  if (!m || (m[1] === "" && m[2] === "")) return null;
  if (m[1] === "") {
    const suffix = Number(m[2]);
    if (suffix === 0 || size === 0) return "unsatisfiable";
    return { start: Math.max(0, size - suffix), end: size - 1 };
  }
  const start = Number(m[1]);
  let end = m[2] === "" ? size - 1 : Number(m[2]);
  if (m[2] !== "" && end < start) return null;
  if (start >= size) return "unsatisfiable";
  if (end >= size) end = size - 1;
  return { start, end };
}

/** Passes the bytes start..end (inclusive) of a stream through, without copying. */
function sliceStream(body, start, end) {
  let pos = 0;
  return body.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        const from = pos;
        pos += chunk.byteLength;
        if (pos <= start || from > end) {
          if (from > end) controller.terminate();
          return;
        }
        controller.enqueue(chunk.subarray(Math.max(0, start - from), Math.min(chunk.byteLength, end + 1 - from)));
        if (pos > end) controller.terminate();
      },
    })
  );
}

/**
 * workerd sends a plain stream chunked, without Content-Length; a FixedLengthStream
 * keeps the length, which players use to plan their range requests. Node (tests)
 * has no FixedLengthStream and gets the stream as it is.
 */
function withLength(stream, length) {
  if (typeof FixedLengthStream === "undefined") return stream;
  const fixed = new FixedLengthStream(length);
  stream.pipeTo(fixed.writable).catch((err) => console.warn("Video stream ended early:", err));
  return fixed.readable;
}

function videoHeaders(source, pathname) {
  const headers = new Headers();
  const ext = pathname.split(".").pop().toLowerCase();
  headers.set("Content-Type", VIDEO_TYPES[ext] || source.headers.get("Content-Type") || "application/octet-stream");
  headers.set("Accept-Ranges", "bytes");
  // Files under /video/ carry a version in the name (hero-v2.mp4), so a new cut is a new address.
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  for (const h of ["ETag", "Last-Modified"]) {
    if (source.headers.get(h)) headers.set(h, source.headers.get(h));
  }
  return headers;
}

/**
 * /video/*: the file from static assets with byte-range support, which Safari on
 * iPhone needs to play a video at all. Static assets answer a Range request with
 * the whole file (200), so the Worker cuts the range out of it; should assets
 * ever answer 206 themselves, that answer is passed on.
 *
 * CPU: the cut streams the file through the Worker without copying, which the
 * budget of the site's videos keeps cheap (hero ≤ 1.5 MB, chapter clips ≤ 2.5 MB,
 * tour ≤ 10 MB). A file over ~10 MB needs its CPU time checked on production
 * (Free plan: 10 ms per request) before it goes under /video/.
 */
export async function serveVideo(request, env) {
  const url = new URL(request.url);
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const range = request.headers.get("Range");
  const asset = await env.ASSETS.fetch(new Request(url.toString(), { method: "GET", headers: range ? { Range: range } : {} }));
  const head = request.method === "HEAD";

  if (asset.status === 206) {
    const headers = videoHeaders(asset, url.pathname);
    for (const h of ["Content-Range", "Content-Length"]) if (asset.headers.get(h)) headers.set(h, asset.headers.get(h));
    if (head && asset.body) await asset.body.cancel();
    return new Response(head ? null : asset.body, { status: 206, headers });
  }
  if (asset.status !== 200 || !asset.body) return asset;

  let body = asset.body;
  let size = Number(asset.headers.get("Content-Length"));
  if (!asset.headers.get("Content-Length") || !Number.isFinite(size)) {
    const bytes = new Uint8Array(await asset.arrayBuffer());
    size = bytes.byteLength;
    body = new Response(bytes).body;
  }

  const headers = videoHeaders(asset, url.pathname);
  const wanted = parseRange(range, size);
  if (wanted === "unsatisfiable") {
    await body.cancel();
    headers.set("Content-Range", `bytes */${size}`);
    headers.delete("Cache-Control");
    return new Response(null, { status: 416, headers });
  }
  if (!wanted) {
    headers.set("Content-Length", String(size));
    if (head) await body.cancel();
    return new Response(head ? null : withLength(body, size), { status: 200, headers });
  }
  headers.set("Content-Range", `bytes ${wanted.start}-${wanted.end}/${size}`);
  headers.set("Content-Length", String(wanted.end - wanted.start + 1));
  if (head) {
    await body.cancel();
    return new Response(null, { status: 206, headers });
  }
  return new Response(withLength(sliceStream(body, wanted.start, wanted.end), wanted.end - wanted.start + 1), { status: 206, headers });
}
