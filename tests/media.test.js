// The real clips on the site: what media.json has to say about them, the addresses and
// dates the build makes of it, the release check's new rows, and tools/media-use.mjs,
// the one step that swaps a set of clips. Run with `npm test`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, truncateSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSite, loadSite } from "../build.mjs";
import { answer, checkSite, dataClipFiles, hiddenDates, ignoredNames, siteFiles, videoBudget, videoSetProblems, workerFirstPatterns } from "../tools/check-site.mjs";
import { VIDEO_SWITCH_AT, largestVideo } from "../src/js/media.js";
import { LENGTH_TOLERANCE, POSTER_MIN_BYTES, chapterProblems, dateProblem, expectedFiles, ffprobeInfo, lengthProblems, recoverInterrupted, releaseCheck, setProblems, setVersion, useSet } from "../tools/media-use.mjs";
import { REDIRECTS } from "../worker-routes.gen.js";

const copy = (x) => JSON.parse(JSON.stringify(x));
const siteWith = (edit) => {
  const site = loadSite();
  site.media = copy(site.media);
  edit(site.media);
  return site;
};
const page = (files, path) => String(files.get(path));

// ── media.json ──────────────────────────────────────────────────────────────

test("media.json: every clip has WebM + MP4 and a poster, the phone cut is 4:5, V6 has none, the placeholder is gone", () => {
  const { clips, clip_date, version } = loadSite().media;
  assert.match(clip_date, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(version, /^[0-9a-f]{10}$/);
  assert.doesNotMatch(JSON.stringify(clips), /ukazka-v0/);
  for (const [id, clip] of Object.entries(clips)) {
    assert.deepEqual(clip.sources.map((s) => s.type), ["video/webm", "video/mp4"], id);
    assert.equal(clip.width / clip.height, 16 / 10, `${id} is 16:10`);
    assert.match(clip.poster, /\{lang\}\.webp$/, id);
  }
  for (const id of ["hero", "how1", "how2", "how3", "how4"]) {
    const cut = clips[id].mobile;
    assert.ok(cut, `${id} has a phone cut`);
    assert.equal(cut.width / cut.height, 4 / 5, id);
    assert.deepEqual(cut.sources.map((s) => s.type), ["video/webm", "video/mp4"], id);
    assert.match(cut.poster, /-mobile\.\{lang\}\.webp$/, id);
  }
  assert.equal(clips.ats.mobile, null);
  assert.equal(clips.tour.mobile, null);
  assert.equal(clips.ats.clip_date, "2026-11-01", "V6 is not retaken with the morning clips");
  assert.deepEqual(clips.tour.tracks.map((t) => t.srclang), ["cs", "en"]);
  for (const lang of ["cs", "en"]) assert.equal(clips.tour.chapters[lang].length, 5, lang);
});

test("/demo: the five chapters are buttons with the times of this language, the fifth is the Radar + ATS one", () => {
  const files = buildSite(loadSite());
  const { chapters } = loadSite().media.clips.tour;
  for (const [path, lang, fifth] of [["public/demo.html", "cs", /Kandidáti a.pipeline \(Radar \+ ATS\)/], ["public/en/demo.html", "en", /Candidates and pipeline \(Radar \+ ATS\)/]]) {
    const html = page(files, path);
    assert.deepEqual([...html.matchAll(/class="tour-chapter" type="button" data-seek="([\d.]+)"/g)].map((m) => Number(m[1])), chapters[lang].map((c) => c.start), lang);
    assert.match(html.slice(html.lastIndexOf('class="tour-chapter"')), fifth);
    assert.match(html, new RegExp(`<track kind="subtitles" srclang="${lang}"[^>]* default>`));
  }
});

test("the tour's subtitles follow the page's language, not the browser's (WebKit ignores <track default>)", () => {
  const js = page(buildSite(loadSite()), "public/js/site.js");
  assert.match(js, /track\.mode = track\.language === document\.documentElement\.lang \? "showing" : "disabled"/);
});

// ── The dates ───────────────────────────────────────────────────────────────

test("V6 keeps its own recording date when the other clips get a new one, and loses the sentence without one", () => {
  const files = buildSite(siteWith((m) => { m.clip_date = "2026-11-03"; m.clips.ats.clip_date = "2026-11-01"; }));
  const cs = page(files, "public/index.html");
  assert.match(cs, /Natočeno v.testovacím workspace 1\. 11\. 2026\./);
  assert.match(cs, /Natočeno 3\. 11\. 2026\./);
  assert.match(page(files, "public/en/index.html"), /Recorded in a test workspace on 1\sNov\s2026\./);
  assert.match(page(files, "public/demo.html"), /Natočeno 3\. 11\. 2026\./);
  const none = page(buildSite(siteWith((m) => { m.clips.ats.clip_date = null; })), "public/index.html");
  assert.doesNotMatch(none, /testovacím workspace/);
});

// ── The addresses ───────────────────────────────────────────────────────────

test("every video address carries the set's version, a new version changes them all, none without one", () => {
  const addresses = (html) => [
    ...[...html.matchAll(/\s(?:src|poster)="(\/video\/[^"]+)"/g)].map((m) => m[1]),
    ...dataClipFiles(html),
    ...[...html.matchAll(/<link rel="preload" as="image" href="(\/video\/[^"]+)"/g)].map((m) => m[1]),
  ];
  const a = addresses(page(buildSite(siteWith((m) => { m.version = "aaaaaaaaaa"; })), "public/index.html"));
  assert.ok(a.length > 30, `${a.length} addresses`);
  for (const url of a) assert.match(url, /\?v=aaaaaaaaaa$/, url);
  const none = addresses(page(buildSite(siteWith((m) => { m.version = null; })), "public/index.html"));
  assert.equal(none.length, a.length);
  for (const url of none) assert.doesNotMatch(url, /\?/, url);
  for (const url of addresses(page(buildSite(siteWith((m) => { m.version = "aaaaaaaaaa"; })), "public/demo.html"))) assert.match(url, /\?v=aaaaaaaaaa$/, url);
});

test("the hero's poster is preloaded per screen, in the page's language, on the home page only", () => {
  const files = buildSite(siteWith((m) => { m.version = null; }));
  assert.match(page(files, "public/index.html"), /<link rel="preload" as="image" href="\/video\/hero-mobile\.cs\.webp" media="\(max-width: 767px\)" fetchpriority="high">/);
  assert.match(page(files, "public/index.html"), /<link rel="preload" as="image" href="\/video\/hero\.cs\.webp" media="\(min-width: 768px\)" fetchpriority="high">/);
  assert.match(page(files, "public/en/index.html"), /href="\/video\/hero-mobile\.en\.webp" media="\(max-width: 767px\)"/);
  for (const path of ["public/demo.html", "public/en/demo.html", "public/cenik.html", "public/blog/index.html"]) {
    assert.doesNotMatch(page(files, path), /rel="preload" as="image"/, path);
  }
});

test("the frame is 16:10 as the clips, and V6 gets its 720 px only from 1 280 px", () => {
  const css = page(buildSite(loadSite()), "public/css/site.css");
  assert.match(css, /\.frame__screen video \{[^}]*aspect-ratio: 16 \/ 10;/);
  assert.doesNotMatch(css, /16 \/ 9/);
  assert.match(css, /@media \(min-width: 1280px\) \{ \.ats-grid \{ grid-template-columns: minmax\(0, 1fr\) min\(var\(--video-side\), 60%\); \} \}/);
  assert.match(css, /--video-side: 45rem;/);
});

test("the marker, the chapter times and a left-over .incoming are not published", () => {
  const names = ignoredNames();
  assert.ok(names.has(".gitignore"));
  assert.ok(names.has("tour.chapters.json"));
  assert.ok(names.has(".incoming"));
  assert.equal(answer("/video/tour.chapters.json", siteFiles(), REDIRECTS, workerFirstPatterns()).status, 404);
  assert.equal(answer("/video/.gitignore", siteFiles(), REDIRECTS, workerFirstPatterns()).status, 404);
});

// ── The release check ───────────────────────────────────────────────────────

const check = (html, release) => {
  const files = siteFiles(buildSite(loadSite()));
  files.set("public/x.html", `<html lang="cs"><title>x</title><meta name="description" content="x"><meta name="robots" content="noindex">${html}`);
  return checkSite(files, { redirects: REDIRECTS, workerFirst: workerFirstPatterns(), release });
};

test("a chapter tab's file that is not there is an error: nothing else names those files", () => {
  const clip = { poster: "/video/nope.cs.webp?v=1", sources: [{ src: "/video/nope.cs.webm?v=1", type: "video/webm" }], mobile: { poster: "/video/nope-m.cs.webp", sources: [{ src: "/video/nope-m.cs.mp4", type: "video/mp4" }] } };
  const attr = JSON.stringify(clip).replace(/"/g, "&quot;");
  const { errors } = check(`<button data-clip="${attr}"></button>`, false);
  for (const name of ["nope.cs.webp?v=1", "nope.cs.webm?v=1", "nope-m.cs.webp", "nope-m.cs.mp4"]) {
    assert.ok(errors.some((e) => e.startsWith("public/x.html") && e.includes(name)), name);
  }
});

test("release: a caption without its date and a tour without five chapters stop it, while building they only warn", () => {
  const html = '<figure class="video video--how1" data-autoplay><figcaption>Veřejné demo.</figcaption></figure><figure class="video video--tour" data-facade><figcaption></figcaption></figure><button class="tour-chapter" type="button"></button>';
  const loose = check(html, false);
  const strict = check(html, true);
  for (const what of ["how1 video has no recording date", "tour video has no recording date", "1 chapter buttons, not 5"]) {
    assert.ok(loose.warnings.some((w) => w.includes(what)), `warning ${what}`);
    assert.ok(strict.errors.some((e) => e.startsWith("public/x.html") && e.includes(what)), `error ${what}`);
  }
});

test("release: V6 without its date stops it, and a figure's date does not count for the figure before it", () => {
  const release = (edit) => checkSite(siteFiles(buildSite(siteWith(edit))), { redirects: REDIRECTS, workerFirst: workerFirstPatterns(), release: true }).errors;
  const what = "ats video has no recording date";
  assert.ok(release((m) => { m.clips.ats.clip_date = null; }).some((e) => e.includes(what)), "V6 without a date");
  assert.ok(!release(() => {}).some((e) => e.includes(what)), "V6 with its date");
  const { errors } = check('<figure class="video video--how1" data-autoplay></figure><figure class="video video--tour" data-facade><figcaption>Natočeno 3. 11. 2026.</figcaption></figure>', true);
  assert.ok(errors.some((e) => e.startsWith("public/x.html") && e.includes("how1 video has no recording date")));
  assert.ok(!errors.some((e) => e.startsWith("public/x.html") && e.includes("tour video has no recording date")));
});

test("the budgets of the videos", () => {
  assert.equal(videoBudget("public/video/hero.cs.mp4"), 1.5e6);
  assert.equal(videoBudget("hero-mobile.en.webm"), 0.8e6);
  assert.equal(videoBudget("rano-mobile.cs.mp4"), 2.5e6);
  assert.equal(videoBudget("vedle-ats.en.webm"), 2.5e6);
  assert.equal(videoBudget("tour.cs.mp4"), 10e6);
  assert.equal(videoBudget("hero.cs.webp"), null);
});

// ── tools/media-use.mjs ─────────────────────────────────────────────────────

const REAL = new URL("../src/data/media.json", import.meta.url);
const TODAY = new Date(2026, 10, 3, 12);
const chapters = (shift = 0) => ({
  cs: ["rano", "detail", "komu-zavolat", "kandidat", "ats"].map((id, i) => ({ id, start: i ? i * 20 + shift : 0, title: id })),
  en: ["rano", "detail", "komu-zavolat", "kandidat", "ats"].map((id, i) => ({ id, start: i ? i * 21 + shift : 0, title: id })),
  cs_duration: 100 + shift,
  en_duration: 110 + shift,
});
const fakePoster = (seed) => Buffer.alloc(POSTER_MIN_BYTES, seed);
/** A made-up set: every file media.json names, a few bytes each (posters as many as one has to have), and sizes that a fake ffprobe reads back. */
function fakeSet(dir, media) {
  mkdirSync(dir, { recursive: true });
  for (const f of expectedFiles(media)) writeFileSync(join(dir, f.name), f.name.endsWith(".vtt") ? "WEBVTT\n" : f.name.endsWith(".webp") ? fakePoster(f.name) : `fake ${f.name}`);
  writeFileSync(join(dir, "tour.chapters.json"), JSON.stringify(chapters()));
}
function sandbox() {
  const root = mkdtempSync(join(tmpdir(), "media-use-"));
  mkdirSync(join(root, "src/data"), { recursive: true });
  mkdirSync(join(root, "public/video"), { recursive: true });
  const media = JSON.parse(readFileSync(REAL, "utf8"));
  writeFileSync(join(root, "src/data/media.json"), JSON.stringify(media));
  const source = join(root, "set");
  const { sizes, lengths, probe } = fakeProbe(media, source);
  fakeSet(source, media);
  const use = (extra = {}) => useSet({ source, date: "2026-11-03", root, today: TODAY, probe, tracked: [], staged: [], ...extra });
  const json = () => readFileSync(join(root, "src/data/media.json"), "utf8");
  return { root, media, source, sizes, lengths, probe, use, json, done: () => rmSync(root, { recursive: true, force: true }) };
}
/** ffprobe for a made-up set: the sizes media.json expects; the length tour.chapters.json says, unless a test sets the real one. */
function fakeProbe(media, source) {
  const sizes = new Map(expectedFiles(media).filter((f) => f.width).map((f) => [f.name, { width: f.width, height: f.height }]));
  const lengths = new Map();
  const probe = (path) => {
    const name = path.split(/[\\/]/).pop();
    const lang = (name.match(/^tour\.(cs|en)\./) || [])[1];
    if (!lang) return sizes.get(name);
    const said = existsSync(join(source, "tour.chapters.json")) ? JSON.parse(readFileSync(join(source, "tour.chapters.json"), "utf8"))[`${lang}_duration`] : undefined;
    return { ...sizes.get(name), duration: lengths.has(name) ? lengths.get(name) : said };
  };
  return { sizes, lengths, probe };
}
/** Every file a run may change, with its hash: equal fingerprints mean nothing changed, byte for byte. */
function fingerprint(root) {
  const out = {};
  const add = (rel) => { out[rel] = createHash("sha256").update(readFileSync(join(root, rel))).digest("hex"); };
  const walk = (dir) => {
    for (const name of readdirSync(join(root, dir))) {
      const rel = `${dir}/${name}`;
      if (statSync(join(root, rel)).isDirectory()) walk(rel);
      else add(rel);
    }
  };
  walk("public");
  for (const rel of ["src/data/media.json", "build-manifest.json", "worker-routes.gen.js"]) if (existsSync(join(root, rel))) add(rel);
  return out;
}
const leftovers = (root) => [".media-use", "public/video/.incoming"].filter((p) => existsSync(join(root, p)));

test("media:use puts the set in place: files, date, chapters without titles, version; V6's date stays; the marker hides it from git", () => {
  const s = sandbox();
  try {
    const { problems, version } = s.use();
    assert.deepEqual(problems, []);
    const m = JSON.parse(s.json());
    assert.equal(m.clip_date, "2026-11-03");
    assert.equal(m.version, version);
    assert.equal(m.clips.ats.clip_date, "2026-11-01");
    assert.deepEqual(m.clips.tour.chapters.cs[1], { id: "detail", start: 20 });
    for (const f of expectedFiles(m)) assert.ok(existsSync(join(s.root, "public/video", f.name)), f.name);
    assert.ok(existsSync(join(s.root, "public/video/tour.chapters.json")));
    assert.ok(!existsSync(join(s.root, "public/video/.incoming")));
    assert.match(readFileSync(join(s.root, "public/video/.gitignore"), "utf8"), /^\*$/m);
    // everything else in the file is what it was
    const before = copy(s.media);
    for (const o of [before, m]) { delete o.clip_date; delete o.version; delete o.clips.tour.chapters; }
    assert.deepEqual(m, before);
  } finally { s.done(); }
});

test("media:use a second time with a new cut: only date, chapters and version change, and the version is new", () => {
  const s = sandbox();
  try {
    const first = s.use();
    const a = JSON.parse(s.json());
    writeFileSync(join(s.source, "hero.cs.mp4"), "another cut");
    writeFileSync(join(s.source, "tour.chapters.json"), JSON.stringify(chapters(3)));
    const second = s.use({ date: "2026-11-02" });
    assert.notEqual(second.version, first.version);
    const b = JSON.parse(s.json());
    assert.equal(b.clip_date, "2026-11-02");
    assert.equal(b.clips.tour.chapters.en[4].start, 87);
    assert.equal(readFileSync(join(s.root, "public/video/hero.cs.mp4"), "utf8"), "another cut");
    for (const o of [a, b]) { delete o.clip_date; delete o.version; delete o.clips.tour.chapters; }
    assert.deepEqual(b, a);
  } finally { s.done(); }
});

test("media:use with clips git already tracks leaves no marker behind", () => {
  const s = sandbox();
  try {
    s.use();
    assert.ok(existsSync(join(s.root, "public/video/.gitignore")));
    s.use({ tracked: ["public/video/hero.cs.mp4"] });
    assert.ok(!existsSync(join(s.root, "public/video/.gitignore")));
  } finally { s.done(); }
});

for (const [what, spoil, expected, extra] of [
  ["a missing file", (s) => rmSync(join(s.source, "detail-mobile.en.webm")), /detail-mobile\.en\.webm: missing/],
  ["four chapters", (s) => { const c = chapters(); c.en.pop(); writeFileSync(join(s.source, "tour.chapters.json"), JSON.stringify(c)); }, /en: 4 chapters, not 5/],
  ["no chapter file", (s) => rmSync(join(s.source, "tour.chapters.json")), /tour\.chapters\.json: missing/],
  ["a file over its budget", (s) => truncateSync(join(s.source, "hero-mobile.cs.mp4"), 900000), /hero-mobile\.cs\.mp4: 0\.90 MB is over its budget of 0\.8 MB/],
  ["other pixels than media.json", (s) => s.sizes.set("rano.cs.webm", { width: 1440, height: 900 }), /rano\.cs\.webm: 1440×900, media\.json says 1280×800/],
  ["a subtitle file that is none", (s) => writeFileSync(join(s.source, "tour.en.vtt"), "nope"), /tour\.en\.vtt: not a WebVTT file/],
  ["an empty poster", (s) => truncateSync(join(s.source, "rano.cs.webp"), 0), /rano\.cs\.webp: empty \(0 B\)/],
  ["an empty video", (s) => truncateSync(join(s.source, "rano.cs.mp4"), 0), /rano\.cs\.mp4: empty \(0 B\)/],
  ["a poster of one byte", (s) => writeFileSync(join(s.source, "rano.cs.webp"), "x"), /rano\.cs\.webp: 1 B is too small for a poster/],
  ["a poster of 16 × 16 pixels", (s) => s.sizes.set("rano.cs.webp", { width: 16, height: 16 }), /rano\.cs\.webp: 16×16, media\.json says 1280×800/],
  ["a phone poster of the desktop cut's pixels", (s) => s.sizes.set("hero-mobile.en.webp", { width: 1440, height: 900 }), /hero-mobile\.en\.webp: 1440×900, media\.json says 720×900/],
  ["a length the video does not have", (s) => s.lengths.set("tour.cs.webm", 100 + LENGTH_TOLERANCE + 0.1), /cs_duration is 100 s, tour\.cs\.webm is 100\.60 s long/],
  ["a video without a length", (s) => s.lengths.set("tour.en.mp4", NaN), /tour\.en\.mp4: ffprobe gives no length/],
  ["a chapter past the real end, with a length made up to fit (review, etapa 4)", (s) => {
    const c = chapters();
    c.cs[4].start = 500;
    c.cs_duration = 999;
    writeFileSync(join(s.source, "tour.chapters.json"), JSON.stringify(c));
    s.lengths.set("tour.cs.mp4", 95.98);
    s.lengths.set("tour.cs.webm", 95.98);
  }, /chapter ats starts at 500 s, the video is 95\.98 s long/],
  ["clips staged for a commit", () => {}, /clips staged for a commit: public\/video\/hero\.cs\.mp4/, { staged: ["public/video/hero.cs.mp4"] }],
]) {
  test(`media:use refuses ${what} and changes nothing`, () => {
    const s = sandbox();
    try {
      spoil(s);
      const before = s.json();
      const { problems, version } = s.use(extra);
      assert.ok(problems.some((p) => expected.test(p)), problems.join("; "));
      assert.equal(version, undefined);
      assert.equal(s.json(), before);
      assert.deepEqual(readdirSync(join(s.root, "public/video")), []);
    } finally { s.done(); }
  });
}

test("media:use refuses a bad date and a folder that is not there", () => {
  const s = sandbox();
  try {
    const before = s.json();
    for (const date of ["3. 11. 2026", "2026-02-30", "2026-11-04", undefined]) {
      assert.ok(s.use({ date }).problems.some((p) => p.startsWith("--date")), String(date));
    }
    assert.ok(s.use({ source: join(s.root, "nope") }).problems.some((p) => p.includes("not a folder")));
    assert.equal(s.json(), before);
    assert.deepEqual(readdirSync(join(s.root, "public/video")), []);
  } finally { s.done(); }
});

test("the length tolerance: a rounded length passes, the shortest cut decides for the chapters", () => {
  const c = chapters();
  const lengths = { "tour.cs.mp4": 99.99, "tour.cs.webm": 100 - LENGTH_TOLERANCE, "tour.en.mp4": 110, "tour.en.webm": 110 };
  assert.deepEqual(lengthProblems(c, lengths), []);
  c.cs[4].start = 99.6;
  assert.ok(lengthProblems(c, lengths).some((p) => p.startsWith("cs: chapter ats starts at 99.6 s")));
});

test("chapter and date rules on their own", () => {
  assert.deepEqual(chapterProblems(chapters()), []);
  const late = chapters();
  late.cs[3].start = 10;
  assert.ok(chapterProblems(late).some((p) => p.includes("kandidat") && p.includes("not after")));
  const past = chapters();
  past.cs_duration = 60;
  assert.ok(chapterProblems(past).some((p) => p.includes("past the video")));
  const moved = chapters();
  moved.en[0].start = 1;
  assert.ok(chapterProblems(moved).some((p) => p.includes("first chapter")));
  const order = chapters();
  [order.cs[1], order.cs[2]] = [order.cs[2], order.cs[1]];
  assert.ok(chapterProblems(order).some((p) => p.startsWith("cs: chapters are")));
  assert.equal(dateProblem("2026-11-03", TODAY), null);
});

test("the version depends on the files of the set, not on where they are", () => {
  const s = sandbox();
  try {
    const a = setVersion(s.source, s.media);
    const other = join(s.root, "other");
    mkdirSync(other);
    for (const f of expectedFiles(s.media)) copyFileSync(join(s.source, f.name), join(other, f.name));
    assert.equal(setVersion(other, s.media), a);
    writeFileSync(join(other, "tour.cs.vtt"), "WEBVTT\nchanged");
    assert.notEqual(setVersion(other, s.media), a);
    assert.deepEqual(setProblems(s.source, s.media, { probe: s.probe }), []);
  } finally { s.done(); }
});

test("the version does not depend on line ends in text files (core.autocrlf), but it does on every byte of a video", () => {
  const s = sandbox();
  try {
    const crlf = (name) => writeFileSync(join(s.source, name), readFileSync(join(s.source, name), "latin1").replace(/\n/g, "\r\n"), "latin1");
    writeFileSync(join(s.source, "tour.cs.vtt"), "WEBVTT\n\n00:00.000 --> 00:01.000\nŘádek\n");
    const lf = setVersion(s.source, s.media);
    crlf("tour.cs.vtt");
    assert.match(readFileSync(join(s.source, "tour.cs.vtt"), "utf8"), /\r\n/);
    assert.equal(setVersion(s.source, s.media), lf);
    writeFileSync(join(s.source, "hero.cs.mp4"), "a\nb\n");
    const video = setVersion(s.source, s.media);
    crlf("hero.cs.mp4");
    assert.notEqual(setVersion(s.source, s.media), video);
    // the same version means the same bytes: a CRLF checkout goes on the site with LF
    const { problems } = s.use();
    assert.deepEqual(problems, []);
    assert.equal(readFileSync(join(s.root, "public/video/tour.cs.vtt"), "utf8"), "WEBVTT\n\n00:00.000 --> 00:01.000\nŘádek\n");
    assert.equal(readFileSync(join(s.root, "public/video/hero.cs.mp4"), "latin1"), "a\r\nb\r\n", "a video is copied as it is");
  } finally { s.done(); }
});

test(".gitattributes speaks only about public/video", () => {
  const lines = readFileSync(new URL("../.gitattributes", import.meta.url), "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#"));
  assert.ok(lines.length);
  for (const line of lines) assert.match(line, /^public\/video\/\*\.(vtt|json) text eol=lf$|^public\/video\/\*\.(mp4|webm|webp) binary$/);
});

test("release: the files on disk have to be the version media.json says, whatever the checkout's line ends", () => {
  const s = sandbox();
  try {
    assert.deepEqual(s.use().problems, []);
    const video = join(s.root, "public/video");
    const problems = () => videoSetProblems(JSON.parse(s.json()), { root: s.root });
    assert.deepEqual(problems(), []);
    // a checkout of the same clips with CRLF is not a change
    writeFileSync(join(video, "tour.en.vtt"), readFileSync(join(video, "tour.en.vtt"), "utf8").replace(/\n/g, "\r\n"));
    assert.deepEqual(problems(), []);
    // a clip changed by hand is
    writeFileSync(join(video, "hero.cs.webp"), "another poster");
    assert.ok(problems().some((p) => p.includes("a clip changed without npm run media:use")));
    rmSync(join(video, "hero.cs.webp"));
    assert.ok(problems().some((p) => p.includes("hero.cs.webp") && p.includes("missing")));
  } finally { s.done(); }
});

test("release: a work folder or an .incoming left behind stops it, except for media:use's own check", () => {
  const s = sandbox();
  try {
    assert.deepEqual(s.use().problems, []);
    const media = JSON.parse(s.json());
    mkdirSync(join(s.root, ".media-use"));
    assert.ok(videoSetProblems(media, { root: s.root }).some((p) => p.includes("--recover")));
    assert.deepEqual(videoSetProblems(media, { root: s.root, duringMediaUse: true }), []);
    rmSync(join(s.root, ".media-use"), { recursive: true });
    mkdirSync(join(s.root, "public/video/.incoming"));
    assert.ok(videoSetProblems(media, { root: s.root }).some((p) => p.includes(".incoming")));
    recoverInterrupted(s.root);
    assert.deepEqual(leftovers(s.root), []);
  } finally { s.done(); }
});

test("files that are not part of the set: not copied, not in the version, not removed, and listed", () => {
  const s = sandbox();
  try {
    const clean = setVersion(s.source, s.media);
    writeFileSync(join(s.source, "hero.cs.jpg"), "an old still");
    writeFileSync(join(s.source, "notes.json"), "{}");
    writeFileSync(join(s.root, "public/video/hero.en.jpg"), "already here");
    writeFileSync(join(s.root, "public/video/.gitkeep"), "");
    assert.equal(setVersion(s.source, s.media), clean);
    const { problems, version, warnings } = s.use();
    assert.deepEqual(problems, []);
    assert.equal(version, clean);
    assert.ok(!existsSync(join(s.root, "public/video/hero.cs.jpg")), "not copied");
    assert.ok(!existsSync(join(s.root, "public/video/notes.json")), "not copied");
    assert.equal(readFileSync(join(s.root, "public/video/hero.en.jpg"), "utf8"), "already here", "not removed");
    assert.deepEqual(warnings, ["not part of the set, not copied: hero.cs.jpg, notes.json", "in public/video but not part of the set, left there (and published): hero.en.jpg"]);
    assert.deepEqual(videoSetProblems(JSON.parse(s.json()), { root: s.root }), []);
  } finally { s.done(); }
});

// ── media:use as one transaction ────────────────────────────────────────────

const STEPS = ["backup copied", "backup", "copied", "first file in place", "all files in place", "media.json written", "media.json"];
/** A set in place and the next one waiting: a new cut, new chapter times, a new date. */
function nextSet(s) {
  assert.deepEqual(s.use().problems, []);
  writeFileSync(join(s.source, "hero.cs.webm"), "another cut");
  writeFileSync(join(s.source, "tour.chapters.json"), JSON.stringify(chapters(3)));
  return fingerprint(s.root);
}

for (const at of [...STEPS, "verify"]) {
  test(`media:use that fails at "${at}" puts everything back, byte for byte`, () => {
    const s = sandbox();
    try {
      const before = nextSet(s);
      const fail = () => { throw new Error(`failed at ${at}`); };
      const { problems, undone } = s.use({ date: "2026-11-02", step: (name) => { if (name === at) fail(); }, verify: at === "verify" ? fail : undefined });
      assert.deepEqual(problems, [`failed at ${at}`]);
      assert.equal(undone, true);
      assert.deepEqual(fingerprint(s.root), before);
      assert.deepEqual(leftovers(s.root), []);
    } finally { s.done(); }
  });
}

test("media:use that fails on the first set removes what the run added: no clips, no marker, no new files", () => {
  const s = sandbox();
  try {
    const before = fingerprint(s.root);
    const { problems } = s.use({
      verify: () => {
        mkdirSync(join(s.root, "public/new/deep"), { recursive: true });
        writeFileSync(join(s.root, "public/new/deep/page.html"), "made by the build");
        writeFileSync(join(s.root, "build-manifest.json"), "{}");
        throw new Error("the release check failed");
      },
    });
    assert.deepEqual(problems, ["the release check failed"]);
    assert.deepEqual(fingerprint(s.root), before);
    assert.deepEqual(readdirSync(join(s.root, "public/video")), []);
    assert.ok(!existsSync(join(s.root, "public/new")));
    assert.ok(!existsSync(join(s.root, "build-manifest.json")));
  } finally { s.done(); }
});

/** A real process that dies at a stage: no catch runs, no handler runs. */
function killedRun(s, at) {
  const tool = new URL("../tools/media-use.mjs", import.meta.url).href;
  const script = join(s.root, "killed.mjs");
  writeFileSync(script, `
    import { readFileSync } from "node:fs";
    import { join } from "node:path";
    import { expectedFiles, useSet } from ${JSON.stringify(tool)};
    const [root, source, at] = process.argv.slice(2);
    const media = JSON.parse(readFileSync(join(root, "src/data/media.json"), "utf8"));
    const sizes = new Map(expectedFiles(media).filter((f) => f.width).map((f) => [f.name, f]));
    const chapters = JSON.parse(readFileSync(join(source, "tour.chapters.json"), "utf8"));
    const probe = (path) => {
      const name = path.replaceAll(String.fromCharCode(92), "/").split("/").pop();
      const lang = name.startsWith("tour.cs.") ? "cs" : name.startsWith("tour.en.") ? "en" : null;
      return { ...sizes.get(name), duration: lang ? chapters[lang + "_duration"] : undefined };
    };
    const die = () => process.kill(process.pid, "SIGKILL");
    useSet({ source, date: "2026-11-01", root, probe, tracked: [], staged: [], step: (name) => { if (name === at) die(); }, verify: at === "verify" ? die : undefined });
    console.log("survived");
  `);
  const run = spawnSync(process.execPath, [script, s.root, s.source, at], { encoding: "utf8", timeout: 60000 });
  rmSync(script);
  assert.doesNotMatch(run.stdout, /survived/, run.stderr);
  assert.notEqual(run.status, 0);
}

for (const at of ["lock", ...STEPS, "verify"]) {
  test(`media:use killed at "${at}": the release check refuses, and the next run puts everything back`, () => {
    const s = sandbox();
    try {
      const before = nextSet(s);
      killedRun(s, at);
      assert.ok(existsSync(join(s.root, ".media-use")));
      const media = JSON.parse(s.json());
      assert.ok(videoSetProblems(media, { root: s.root }).some((p) => p.includes("--recover")));
      // a refused run still undoes the interrupted one first
      const { problems, recovered } = s.use({ date: "not a date" });
      assert.ok(problems.some((p) => p.startsWith("--date")));
      assert.equal(recovered, !["lock", "backup copied"].includes(at), "before the whole copy exists nothing has changed");
      assert.deepEqual(fingerprint(s.root), before);
      assert.deepEqual(leftovers(s.root), []);
      assert.ok(!existsSync(join(s.root, "src/data/media.json.tmp")));
    } finally { s.done(); }
  });
}

test("the undo itself can be interrupted and repeated; the new files wait outside public/", () => {
  const s = sandbox();
  try {
    const before = nextSet(s);
    killedRun(s, "copied");
    assert.ok(existsSync(join(s.root, ".media-use/incoming/hero.cs.webm")));
    assert.ok(!existsSync(join(s.root, "public/video/.incoming")));
    assert.deepEqual(fingerprint(s.root), before, "nothing in public/ has changed yet");
    recoverInterrupted(s.root);
    killedRun(s, "media.json");
    let moved = 0;
    assert.throws(() => recoverInterrupted(s.root, { step: () => { if (++moved === 5) throw new Error("killed"); } }), /killed/);
    assert.equal(recoverInterrupted(s.root), true);
    assert.deepEqual(fingerprint(s.root), before);
    assert.deepEqual(leftovers(s.root), []);
    assert.equal(recoverInterrupted(s.root), false, "nothing left to undo");
  } finally { s.done(); }
});

test("media:use leaves a run that is still going alone", () => {
  const s = sandbox();
  try {
    const before = nextSet(s);
    mkdirSync(join(s.root, ".media-use/backup"), { recursive: true });
    writeFileSync(join(s.root, ".media-use/pid"), String(process.ppid));
    const { problems } = s.use({ date: "2026-11-02" });
    assert.ok(problems[0].includes(`process ${process.ppid}`), problems.join("; "));
    assert.ok(existsSync(join(s.root, ".media-use/backup")));
    assert.deepEqual(fingerprint(s.root), before);
  } finally { s.done(); }
});

test("clips staged in a real repository stop it before anything changes; once the last commit has clips, staging is legitimate and no marker stays", () => {
  const s = sandbox();
  try {
    const git = (...args) => execFileSync("git", ["-c", "user.name=test", "-c", "user.email=test@example.com", "-c", "core.autocrlf=false", ...args], { cwd: s.root, stdio: "pipe" });
    git("init", "-q");
    const clip = join(s.root, "public/video/hero.cs.mp4");
    writeFileSync(clip, "a clip");
    git("add", "public/video/hero.cs.mp4");
    const before = fingerprint(s.root);
    const staged = s.use({ tracked: undefined, staged: undefined });
    assert.ok(staged.problems.some((p) => p.includes("clips staged for a commit: public/video/hero.cs.mp4")), staged.problems.join("; "));
    assert.deepEqual(fingerprint(s.root), before);
    git("commit", "-q", "-m", "clips");
    writeFileSync(clip, "a new cut");
    git("add", "public/video/hero.cs.mp4");
    const merged = s.use({ tracked: undefined, staged: undefined });
    assert.deepEqual(merged.problems, []);
    assert.match(merged.note, /tracked by git/);
    assert.ok(!existsSync(join(s.root, "public/video/.gitignore")));
  } finally { s.done(); }
});

// ── The whole way: a copy of the repo with made-up clips, the real build and release check ──

const REPO = fileURLToPath(new URL("..", import.meta.url));
/** This repo without git, tests and clips, in a temporary folder. The tools work on the folder they are in. */
function repoCopy() {
  const root = mkdtempSync(join(tmpdir(), "media-use-repo-"));
  const skip = new Set([".git", ".wrangler", ".media-use", "node_modules", "tests"]);
  cpSync(REPO, root, {
    recursive: true,
    filter: (src) => {
      const rel = relative(REPO, src).replace(/\\/g, "/");
      return !skip.has(rel.split("/")[0]) && !rel.startsWith("public/video/");
    },
  });
  mkdirSync(join(root, "public/video"), { recursive: true });
  const media = JSON.parse(readFileSync(join(root, "src/data/media.json"), "utf8"));
  const source = join(root, "set");
  fakeSet(source, media);
  const { probe } = fakeProbe(media, source);
  const use = (extra = {}) => useSet({ source, date: "2026-11-02", root, today: TODAY, probe, tracked: [], staged: [], verify: releaseCheck(root, "pipe"), ...extra });
  const release = () => spawnSync(process.execPath, ["tools/check-site.mjs", "--release"], { cwd: root, encoding: "utf8", timeout: 60000 });
  return { root, source, use, release, done: () => rmSync(root, { recursive: true, force: true }) };
}

test("[TEXT] in cs.json: the release check fails after the swap and clips, media.json and public/ are what they were (review, etapa 4)", () => {
  const c = repoCopy();
  try {
    assert.deepEqual(c.use().problems, []);
    assert.equal(c.release().status, 0, "the first set is good");
    const before = fingerprint(c.root);
    const cs = join(c.root, "src/i18n/cs.json");
    const text = readFileSync(cs, "utf8");
    writeFileSync(cs, text.replace('"demo_play": "Přehrát prohlídku"', '"demo_play": "[TEXT]"'));
    writeFileSync(join(c.source, "hero.cs.webm"), "another cut");
    const { problems, undone, version } = c.use({ date: "2026-11-03" });
    assert.ok(problems.length, "it fails");
    assert.equal(undone, true);
    assert.equal(version, undefined);
    assert.deepEqual(fingerprint(c.root), before);
    assert.deepEqual(leftovers(c.root), []);
    // and with the text put right the same set goes through
    writeFileSync(cs, text);
    const again = c.use({ date: "2026-11-03" });
    assert.deepEqual(again.problems, []);
    assert.notDeepEqual(fingerprint(c.root), before);
    assert.equal(c.release().status, 0);
  } finally { c.done(); }
});

test("check:release in a real run: a poster changed without media:use stops it, the same clips with CRLF subtitles do not", () => {
  const c = repoCopy();
  try {
    assert.deepEqual(c.use().problems, []);
    const vtt = join(c.root, "public/video/tour.cs.vtt");
    assert.equal(readFileSync(vtt, "utf8"), "WEBVTT\n");
    writeFileSync(vtt, "WEBVTT\r\n");
    const same = c.release();
    assert.equal(same.status, 0, same.stderr);
    writeFileSync(join(c.root, "public/video/hero.cs.webp"), "another poster");
    const changed = c.release();
    assert.equal(changed.status, 1);
    assert.match(changed.stderr, /a clip changed without npm run media:use/);
  } finally { c.done(); }
});

test("the tour's chapter says which one is playing; without JavaScript the chapters are text, not buttons; the hero starts earlier than the other loops", () => {
  const files = buildSite(loadSite());
  const js = String(files.get("public/js/site.js"));
  const styles = String(files.get("public/css/site.css"));
  assert.match(styles, /\.no-js \.tour-chapters--seek,\s*\.js \.tour-chapters--text \{ display: none; \}/);
  const demo = String(files.get("public/en/demo.html"));
  const plain = demo.match(/<ol class="tour-chapters tour-chapters--text">[\s\S]*?<\/ol>/)[0];
  assert.match(plain, /<li><span class="tour-chapter__time">0:00<\/span> Morning/);
  assert.equal((plain.match(/<li>/g) || []).length, 5);
  assert.doesNotMatch(plain, /<button/);
  assert.match(js, /b\.setAttribute\("aria-current", "true"\)/);
  assert.match(js, /const seen = watch\(0\.5\);/);
  assert.match(js, /const seenHero = watch\(0\.25\);/);
  assert.match(js, /\(fig\.classList\.contains\("video--hero"\) \? seenHero : seen\)\.observe\(fig\)/);
});

test("the article's sentence reads as the lead chose it", () => {
  const en = String(buildSite(loadSite()).get("public/en/blog/the-4-day-latency-gap.html"));
  assert.match(en, /Being one of the first to bring relevant people shows you know the market\./);
  assert.doesNotMatch(en, /among the first/);
});

// ── More than one process: the lock, --recover next to a live run, a copy older than the last commit ──

const until = async (what, ms = 30000) => {
  const end = Date.now() + ms;
  while (!what()) {
    if (Date.now() > end) throw new Error("waited too long");
    await new Promise((res) => setTimeout(res, 15));
  }
};
const toolUrl = new URL("../tools/media-use.mjs", import.meta.url).href;
/** A real run in its own process that stays in its last stage until the file go exists; ends by printing its result. */
function liveRun(root, source, go, date = "2026-11-01") {
  const script = join(root, `live-${Math.random().toString(36).slice(2)}.mjs`);
  writeFileSync(script, `
    import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
    import { join } from "node:path";
    import { expectedFiles, useSet } from ${JSON.stringify(toolUrl)};
    const [root, source, date, go, me] = process.argv.slice(2);
    rmSync(me);
    const media = JSON.parse(readFileSync(join(root, "src/data/media.json"), "utf8"));
    const sizes = new Map(expectedFiles(media).filter((f) => f.width).map((f) => [f.name, f]));
    const chapters = JSON.parse(readFileSync(join(source, "tour.chapters.json"), "utf8"));
    const probe = (path) => {
      const name = path.replaceAll(String.fromCharCode(92), "/").split("/").pop();
      const lang = name.startsWith("tour.cs.") ? "cs" : name.startsWith("tour.en.") ? "en" : null;
      return { ...sizes.get(name), duration: lang ? chapters[lang + "_duration"] : undefined };
    };
    const wait = () => { writeFileSync(go + ".waiting", ""); while (!existsSync(go)) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 15); };
    console.log(JSON.stringify(useSet({ source, date, root, probe, tracked: [], staged: [], verify: wait })));
  `);
  const child = spawn(process.execPath, [script, root, source, date, go, script], { stdio: ["ignore", "pipe", "pipe"] });
  let out = "";
  let err = "";
  child.stdout.on("data", (d) => { out += d; });
  child.stderr.on("data", (d) => { err += d; });
  return new Promise((res) => child.on("exit", () => res(out ? JSON.parse(out) : { crashed: err })));
}
const ownSet = (s, name, cut) => {
  const dir = join(s.root, name);
  cpSync(s.source, dir, { recursive: true });
  writeFileSync(join(dir, "hero.cs.webm"), cut);
  return dir;
};
const deadProcess = () => spawnSync(process.execPath, ["-e", ""]).pid;

test("--recover next to a live run: it refuses, the run finishes, the files hash to the version (review k2, M1, real processes)", async () => {
  const c = repoCopy();
  try {
    assert.deepEqual(c.use().problems, []);
    writeFileSync(join(c.source, "hero.cs.webp"), fakePoster("a new poster"));
    const go = join(c.root, "go");
    const run = liveRun(c.root, c.source, go);
    await until(() => existsSync(join(c.root, ".media-use/backup")));
    const recover = spawnSync(process.execPath, ["tools/media-use.mjs", "--recover"], { cwd: c.root, encoding: "utf8", timeout: 60000 });
    assert.equal(recover.status, 1, recover.stdout);
    assert.match(recover.stderr, /another media:use is running \(process \d+\)/);
    assert.match(recover.stderr, /--force-recover/);
    assert.ok(existsSync(join(c.root, ".media-use/backup")), "the copy is still there");
    const release = c.release();
    assert.equal(release.status, 1);
    assert.match(release.stderr, /a media:use is running \(process \d+\)/);
    assert.doesNotMatch(release.stderr, /interrupted/);
    writeFileSync(go, "");
    const result = await run;
    assert.deepEqual(result.problems, [], result.crashed);
    const media = JSON.parse(readFileSync(join(c.root, "src/data/media.json"), "utf8"));
    assert.equal(media.version, result.version);
    assert.deepEqual(videoSetProblems(media, { root: c.root }), []);
    assert.deepEqual(leftovers(c.root), []);
  } finally { c.done(); }
});

test("--force-recover next to a live run goes back, and the run then says it did not stay and nothing was undone by it", async () => {
  const s = sandbox();
  try {
    const before = nextSet(s);
    const go = join(s.root, "go");
    const run = liveRun(s.root, s.source, go);
    await until(() => existsSync(`${go}.waiting`));
    assert.throws(() => recoverInterrupted(s.root), /another media:use is running/);
    assert.equal(recoverInterrupted(s.root, { force: true }), true);
    assert.deepEqual(fingerprint(s.root), before);
    writeFileSync(go, "");
    const result = await run;
    assert.equal(result.undone, false, JSON.stringify(result));
    assert.match(result.problems.join(" "), /copy of the state before this run is gone/);
    assert.equal(result.version, undefined);
    assert.deepEqual(fingerprint(s.root), before);
    assert.deepEqual(leftovers(s.root), []);
  } finally { s.done(); }
});

test("a failed run whose copy has disappeared does not say that nothing changed", () => {
  const s = sandbox();
  try {
    nextSet(s);
    const { problems, undone } = s.use({
      date: "2026-11-02",
      step: (name) => { if (name === "media.json") rmSync(join(s.root, ".media-use/backup"), { recursive: true }); },
      verify: () => { throw new Error("the release check failed"); },
    });
    assert.equal(undone, false);
    assert.match(problems.join(" "), /copy of the state before this run is gone/);
  } finally { s.done(); }
});

for (const gap of [0, 100, 500, 1500]) {
  test(`two runs ${gap} ms apart: one has the lock from its first step, the other changes nothing (review k2, M2, real processes)`, async () => {
    const s = sandbox();
    try {
      nextSet(s);
      const go = join(s.root, "go");
      const a = ownSet(s, "set-a", "cut a");
      const b = ownSet(s, "set-b", "cut b");
      const first = liveRun(s.root, a, go, "2026-11-01");
      await new Promise((res) => setTimeout(res, gap));
      const second = liveRun(s.root, b, go, "2026-10-31");
      // the one without the lock ends by itself, the other waits in its last stage
      const loser = await Promise.race([first, second]);
      assert.match((loser.problems || []).join(" "), /another media:use is running \(process \d+\)/, JSON.stringify(loser));
      assert.equal(loser.version, undefined);
      writeFileSync(go, "");
      const results = await Promise.all([first, second]);
      const winners = results.filter((r) => r.problems && !r.problems.length);
      assert.equal(winners.length, 1, JSON.stringify(results));
      const media = JSON.parse(s.json());
      assert.equal(media.version, winners[0].version);
      assert.deepEqual(videoSetProblems(media, { root: s.root }), []);
      assert.deepEqual(leftovers(s.root), []);
    } finally { s.done(); }
  });
}

test("a lock whose process is gone does not stand in the way; check:release tells running from interrupted", () => {
  const s = sandbox();
  try {
    nextSet(s);
    mkdirSync(join(s.root, ".media-use"));
    const media = () => JSON.parse(s.json());
    writeFileSync(join(s.root, ".media-use/pid"), String(process.ppid));
    assert.ok(videoSetProblems(media(), { root: s.root }).some((p) => p.includes(`a media:use is running (process ${process.ppid})`)));
    const gone = deadProcess();
    writeFileSync(join(s.root, ".media-use/pid"), String(gone));
    assert.ok(videoSetProblems(media(), { root: s.root }).some((p) => p.includes("left by an interrupted media:use")));
    assert.deepEqual(s.use({ date: "2026-11-02" }).problems, []);
    assert.deepEqual(leftovers(s.root), []);
    // a lock with no number in it: its process died between creating and writing
    mkdirSync(join(s.root, ".media-use"));
    writeFileSync(join(s.root, ".media-use/pid"), "");
    assert.deepEqual(s.use({ date: "2026-11-02" }).problems, []);
    assert.deepEqual(leftovers(s.root), []);
  } finally { s.done(); }
});

/** A repository of made-up clips: killed run, then two commits made on top of the copy it left. */
function killedThenCommitted(s) {
  const git = (...args) => execFileSync("git", ["-c", "user.name=test", "-c", "user.email=test@example.com", "-c", "core.autocrlf=false", ...args], { cwd: s.root, stdio: "pipe" });
  git("init", "-q");
  git("add", "public", "src/data/media.json");
  git("commit", "-q", "-m", "the state before");
  const clean = fingerprint(s.root);
  writeFileSync(join(s.source, "hero.cs.webm"), "another cut");
  killedRun(s, "media.json");
  assert.ok(existsSync(join(s.root, ".media-use/backup")));
  const media = JSON.parse(readFileSync(join(s.root, "src/data/media.json"), "utf8"));
  media.committed_later = true;
  writeFileSync(join(s.root, "src/data/media.json"), JSON.stringify(media));
  git("add", "src/data/media.json");
  git("commit", "-q", "-m", "a change in media.json");
  writeFileSync(join(s.root, "public/from-merge.html"), "<html>");
  git("add", "public/from-merge.html");
  git("commit", "-q", "-m", "a new page");
  return { clean, after: fingerprint(s.root) };
}

test("a copy older than the last commit: the next run and --recover refuse and touch nothing, --force-recover goes back (review k2, M3)", () => {
  const s = sandbox();
  try {
    const { clean, after } = killedThenCommitted(s);
    const { problems, recovered, version } = s.use({ date: "2026-11-02" });
    assert.match(problems.join(" "), /was taken at commit [0-9a-f]{7}, this worktree is at [0-9a-f]{7}/);
    assert.match(problems.join(" "), /--force-recover/);
    assert.equal(recovered, false);
    assert.equal(version, undefined);
    assert.deepEqual(fingerprint(s.root), after);
    assert.ok(existsSync(join(s.root, "public/from-merge.html")));
    assert.match(s.json(), /committed_later/);
    assert.ok(existsSync(join(s.root, ".media-use/backup")), "the copy stays for the decision");
    assert.throws(() => recoverInterrupted(s.root), /was taken at commit/);
    assert.deepEqual(fingerprint(s.root), after);
    assert.equal(recoverInterrupted(s.root, { force: true }), true);
    assert.deepEqual(fingerprint(s.root), clean);
    assert.deepEqual(leftovers(s.root), []);
  } finally { s.done(); }
});

test("--recover and --force-recover as processes: killed run, a copy older than the last commit, a copy without its list", () => {
  const c = repoCopy();
  const cli = (...args) => spawnSync(process.execPath, ["tools/media-use.mjs", ...args], { cwd: c.root, encoding: "utf8", timeout: 60000 });
  try {
    assert.deepEqual(c.use().problems, []);
    const before = fingerprint(c.root);
    writeFileSync(join(c.source, "hero.cs.webm"), "another cut");
    killedRun(c, "media.json");
    assert.notDeepEqual(fingerprint(c.root), before);
    assert.equal(c.release().status, 1);
    const undone = cli("--recover");
    assert.equal(undone.status, 0, undone.stderr);
    assert.match(undone.stdout, /the interrupted run was undone/);
    assert.deepEqual(fingerprint(c.root), before);
    assert.match(cli("--recover").stdout, /nothing to undo/);

    const { clean, after } = killedThenCommitted(c);
    const refused = cli("--recover");
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /^error: the copy in \.media-use\/ was taken at commit/);
    assert.doesNotMatch(refused.stderr, /\n\s+at /, "no stack trace");
    assert.deepEqual(fingerprint(c.root), after);
    const forced = cli("--force-recover");
    assert.equal(forced.status, 0, forced.stderr);
    assert.deepEqual(fingerprint(c.root), clean);

    mkdirSync(join(c.root, ".media-use/backup"), { recursive: true });
    const noList = cli("--recover");
    assert.equal(noList.status, 1);
    assert.match(noList.stderr, /^error: \.media-use\/backup has no readable before\.json/);
    assert.doesNotMatch(noList.stderr, /\n\s+at /, "no stack trace");
    assert.deepEqual(fingerprint(c.root), clean);
    const run = c.use({ date: "2026-11-02" });
    assert.match(run.problems.join(" "), /has no readable before\.json/);
    assert.deepEqual(fingerprint(c.root), clean);
  } finally { c.done(); }
});

test("a media.json.tmp in the old place goes with the next undo", () => {
  const s = sandbox();
  try {
    nextSet(s);
    mkdirSync(join(s.root, ".media-use"));
    writeFileSync(join(s.root, "src/data/media.json.tmp"), "half");
    recoverInterrupted(s.root);
    assert.ok(!existsSync(join(s.root, "src/data/media.json.tmp")));
  } finally { s.done(); }
});

const realPoster = fileURLToPath(new URL("../public/video/hero.cs.webp", import.meta.url));
const realTour = fileURLToPath(new URL("../public/video/tour.cs.webm", import.meta.url));
test("real ffprobe: sizes of a poster and a video, a length, and a poster that is none", { skip: !existsSync(realPoster) || !existsSync(realTour) || spawnSync("ffprobe", ["-version"]).status !== 0 }, () => {
  const poster = ffprobeInfo(realPoster);
  assert.deepEqual([poster.width, poster.height], [1440, 900]);
  const tour = ffprobeInfo(realTour);
  assert.deepEqual([tour.width, tour.height], [1280, 800]);
  assert.ok(tour.duration > 30, String(tour.duration));
  const dir = mkdtempSync(join(tmpdir(), "media-use-probe-"));
  try {
    writeFileSync(join(dir, "x.webp"), "x");
    const none = ffprobeInfo(join(dir, "x.webp"));
    assert.deepEqual([none.width, none.height], [0, 0], "ffprobe answers without an error, the sizes give it away");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ── Review in a browser, etapa 4 round 2 ────────────────────────────────────

test("site.js imports what the shared module gives it (a missing name stops the whole script)", () => {
  const js = String(buildSite(loadSite()).get("public/js/site.js"));
  const imported = (js.match(/import \{([^}]+)\} from "\.\/media\.js[^"]*"/) || [])[1] || "";
  for (const name of ["clipFor", "clipKey", "largestVideo"]) assert.ok(imported.split(",").map((n) => n.trim()).includes(name), name);
});

test("one video at a time: the largest on screen, and the one playing stays until another is clearly larger", () => {
  const sizes = { hero: 300, rano: 200 };
  const area = (id) => sizes[id];
  assert.equal(largestVideo([], area, null), null);
  assert.equal(largestVideo(["rano"], area, "hero"), "rano", "the other one has left");
  assert.equal(largestVideo(["hero", "rano"], area, null), "hero");
  assert.equal(largestVideo(["hero", "rano"], area, "hero"), "hero");
  assert.equal(largestVideo(["hero", "rano"], area, "rano"), "hero", "1.5× larger takes over");
  sizes.hero = 200 * VIDEO_SWITCH_AT - 1;
  assert.equal(largestVideo(["hero", "rano"], area, "rano"), "rano", "a little larger does not: no flicking between two");
  sizes.hero = 200 * VIDEO_SWITCH_AT;
  assert.equal(largestVideo(["hero", "rano"], area, "rano"), "hero");
});

test("site.js: who plays is decided in one place, the chapters ask there, and a tab only loads the cut that is shown", () => {
  const js = String(buildSite(loadSite()).get("public/js/site.js"));
  assert.match(js, /largestVideo\(live\.filter\(/);
  assert.match(js, /if \(fig === chosen && fig\.dataset\.user !== "paused"\)/);
  const chapters = js.slice(js.indexOf("(function chapters()"));
  assert.doesNotMatch(chapters.slice(0, chapters.indexOf("keepInView")), /\.play\(\)/, "a tab never starts a video past the one place");
  assert.match(js, /videoAskedFor\(fig\);/);
  assert.doesNotMatch(js, /for \(const v of fig\.querySelectorAll\("video"\)\) \{\s*if \(tab\.dataset\.label\)/, "no load() over both cuts");
  assert.match(js, /const v = shownVideo\(fig\);\s*const cut = clipFor\(current,/);
});

test("the charts' text: three cards in a row only from 1 208 px, two from 816 px, and all three cards end on one line", () => {
  const css = String(buildSite(loadSite()).get("public/css/site.css"));
  assert.match(css, /@media \(min-width: 816px\) \{ \.charts__more-grid \{ grid-template-columns: 1fr 1fr; \} \}/);
  assert.match(css, /@media \(min-width: 1208px\) \{\s*\.charts \{ grid-template-columns: 1fr 2fr; \}/);
  assert.doesNotMatch(css, /\.charts \{[^}]*align-items: start/);
  assert.match(css, /\.charts \.chart__caption \{ margin-bottom: auto; \}/);
});

test("the recording date is in the line under the hero, on both screens, in both languages; without a date the line goes and release says so", () => {
  const files = buildSite(loadSite());
  const line = (path) => String(files.get(path)).match(/hero__caption">([\s\S]*?)<\/p>/)[1];
  for (const path of ["public/index.html", "public/en/index.html"]) {
    const spans = [...line(path).matchAll(/<span class="(d-only|m-only)">([\s\S]*?)<\/span>/g)];
    assert.deepEqual(spans.map((m) => m[1]), ["d-only", "m-only"], path);
    for (const m of spans) assert.match(m[2], /20\d\d/, `${path} ${m[1]}`);
  }
  const release = (edit) => checkSite(siteFiles(buildSite(siteWith(edit))), { redirects: REDIRECTS, workerFirst: workerFirstPatterns(), release: true }).errors;
  const what = "the line under the hero video has no recording date";
  assert.ok(!release(() => {}).some((e) => e.includes(what)));
  const none = release((m) => { m.clip_date = null; });
  for (const screen of ["on a wide screen", "on a phone"]) assert.ok(none.some((e) => e.startsWith("public/index.html") && e.includes(`${what} ${screen}`)), screen);
});

test("release sees a date that is there but hidden: a rule on the hero's line or a caption", () => {
  assert.deepEqual(hiddenDates(String(buildSite(loadSite()).get("public/css/site.css"))), []);
  assert.deepEqual(hiddenDates(".a { color: red; }\n@media (max-width: 767px) { .hero__caption { display: none; } }"), [".hero__caption"]);
  assert.deepEqual(hiddenDates("/* .x */ .video figcaption { margin: 0; display: none; }"), [".video figcaption"]);
  assert.deepEqual(hiddenDates(".chapters-video .video figcaption { display: none; } .hero__caption { display: block; }"), []);
});

test("prices in one row on a wide screen, on a phone the label stays in the card", () => {
  const css = String(buildSite(loadSite()).get("public/css/site.css"));
  assert.match(css, /@media \(min-width: 768px\) \{\s*\.plan \{ position: relative; \}\s*\.plan__badge \{ position: absolute;/);
});

test("the tour's subtitle lines have room for their descenders", () => {
  assert.match(String(buildSite(loadSite()).get("public/css/site.css")), /video::cue \{ line-height: 1\.5; \}/);
});

test("articles in the look of the site: no monospace, no // in labels, no typed ticks, green and red only for a state; the words stay", () => {
  const files = buildSite(loadSite());
  assert.doesNotMatch(String(files.get("public/css/site.css")), /font-mono|monospace/);
  const articles = [...files.keys()].filter((p) => /public\/(en\/)?blog\/[a-z0-9-]+\.html$/.test(p) && !p.endsWith("index.html"));
  assert.equal(articles.length, 6);
  for (const path of articles) {
    const html = String(files.get(path));
    assert.doesNotMatch(html, /\/\/ [A-ZÁ-Ž]/, path);
    assert.doesNotMatch(html, /[✓✕]/, path);
    assert.doesNotMatch(html, /tone-(amber|blue)/, path);
    for (const m of html.matchAll(/class="mono tone-(green|red)">([\s\S]*?)<\/div>/g)) assert.match(m[2], /#i-(check|close)/, `${path}: ${m[2]}`);
    assert.match(html, /<ul class="ticks"><li><svg class="ic"[^>]*><use href="#i-check"><\/use><\/svg><span>/, path);
  }
  assert.match(String(files.get("public/blog/kolik-stoji-mrtve-inzeraty.html")), /Bez platební karty/);
});

test("the GDPR page's headings are the size they are in an article; after sending the form the steps are not said twice", () => {
  const files = buildSite(loadSite());
  assert.match(String(files.get("public/css/site.css")), /\.prose h2, \.article h2 \{ font-size: var\(--fs-h3\);/);
  assert.match(String(files.get("public/js/site.js")), /querySelector\("\.trial__next"\);\s*if \(next\) next\.hidden = true;/);
});

test("Czech and Slovak letters come from the small font files: what they cover is what the pages use, and the small ones are preloaded", () => {
  const files = buildSite(loadSite());
  const css = String(files.get("public/css/site.css"));
  for (const m of css.matchAll(/url\("\/fonts\/[a-z]+-latin-ext\.woff2"\)[\s\S]*?unicode-range: ([^;}]+)/g)) assert.equal(m[1].trim(), "U+0100-017F");
  for (const [path, content] of files) {
    if (!path.endsWith(".html")) continue;
    assert.doesNotMatch(String(content), /[ƀ-ʺḀ-ỿ]/u, `${path}: a letter neither font file has`);
  }
  for (const name of ["inter", "manrope"]) {
    const size = statSync(new URL(`../public/fonts/${name}-latin-ext.woff2`, import.meta.url)).size;
    assert.ok(size < 30000, `${name}-latin-ext is ${size} B`);
  }
});
