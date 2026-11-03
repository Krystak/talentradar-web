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
import { answer, checkSite, clipIn, dataClipFiles, filesOutsideSet, hiddenDates, ignoredNames, siteFiles, sourceProblems, videoBudget, videoSetProblems, waitingCuts, workerFirstPatterns } from "../tools/check-site.mjs";
import { VIDEO_SWITCH_AT, clipFor, cueNow, largestVideo, savesData } from "../src/js/media.js";
import { AI_LIST_HEADERS, cleanAiList, demoPayload } from "../src/js/demo-form.js";
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
    assert.match(clip.sources[clip.sources.length - 1].type, /^video\/mp4/, `${id}: H.264 for every screen comes last`);
    assert.equal(clip.sources[clip.sources.length - 1].media, undefined, id);
    assert.equal(clip.width / clip.height, 16 / 10, `${id} is 16:10`);
    assert.match(clip.poster, /\{lang\}(\.\d+)?\.webp$/, id);
  }
  assert.equal(clips.how4, undefined, "three chapters");
  for (const id of ["hero", "how1", "how2", "how3"]) {
    const cut = clips[id].mobile;
    assert.ok(cut, `${id} has a phone cut`);
    assert.equal(cut.width / cut.height, 4 / 5, id);
    assert.match(cut.sources[cut.sources.length - 1].type, /^video\/mp4/, id);
    assert.match(cut.poster, /-mobile\.\{lang\}(\.\d+)?\.webp$/, id);
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
  const { hero } = loadSite().media.clips;
  // the names come from media.json: a new cut of the hero changes them, not what this says
  for (const [path, lang] of [["public/index.html", "cs"], ["public/en/index.html", "en"]]) {
    const clip = clipIn(hero, lang);
    const name = (cut) => cut.poster.replace("{lang}", lang);
    assert.ok(page(files, path).includes(`<link rel="preload" as="image" href="${name(clip.mobile)}" media="(max-width: 767px)" fetchpriority="high">`), `${path} phone`);
    assert.ok(page(files, path).includes(`<link rel="preload" as="image" href="${name(clip)}" media="(min-width: 768px)" fetchpriority="high">`), `${path} wide`);
  }
  for (const path of ["public/demo.html", "public/en/demo.html", "public/cenik.html", "public/blog/index.html"]) {
    assert.doesNotMatch(page(files, path), /rel="preload" as="image"/, path);
  }
});

test("the window is 16:10 as the clips, and V6 gets its 720 px only from 1 280 px", () => {
  const css = page(buildSite(loadSite()), "public/css/site.css");
  assert.match(css, /\.frame__screen video \{[^}]*aspect-ratio: 16 \/ 10;/);
  assert.doesNotMatch(css, /16 \/ 9/);
  assert.match(css, /@media \(min-width: 1280px\) \{ \.ats-grid \{ grid-template-columns: minmax\(0, 1fr\) min\(var\(--video-side\), 66%\); \} \}/);
  assert.match(css, /--video-side: 48\.75rem;/, "780 px of board, a window of 718 px as before the board");
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

// tests of the tool work on a set frozen here, so that replacing a clip on the site changes none of them
const REAL = new URL("./media-set.fixture.json", import.meta.url);
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
  ["a missing file", (s) => rmSync(join(s.source, "rano-mobile.en.webm")), /rano-mobile\.en\.webm: missing/],
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
    // media:use only warns, a release does not go out with them (review k2: hero.*.jpg answered 200)
    assert.deepEqual(videoSetProblems(JSON.parse(s.json()), { root: s.root, duringMediaUse: true }), []);
    assert.deepEqual(videoSetProblems(JSON.parse(s.json()), { root: s.root }), ["public/video: 1 files are not part of the set and would be published: hero.en.jpg"]);
    assert.deepEqual(filesOutsideSet(join(s.root, "public/video"), JSON.parse(s.json())), ["hero.en.jpg"]);
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
  writeFileSync(join(root, "src/data/media.json"), readFileSync(REAL));
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
  const none = release((m) => {
    m.clip_date = null;
    delete m.clips.hero.clip_date;
    if (m.clips.hero.mobile) delete m.clips.hero.mobile.clip_date;
    for (const own of Object.values(m.clips.hero.by_lang || {})) delete own.clip_date;
  });
  for (const screen of ["on a wide screen", "on a phone"]) assert.ok(none.some((e) => e.startsWith("public/index.html") && e.includes(`${what} ${screen}`)), screen);
});

test("release sees a date that is there but hidden: a rule on the hero's line or a caption", () => {
  assert.deepEqual(hiddenDates(String(buildSite(loadSite()).get("public/css/site.css"))), []);
  assert.deepEqual(hiddenDates(".a { color: red; }\n@media (max-width: 767px) { .hero__caption { display: none; } }"), [".hero__caption"]);
  assert.deepEqual(hiddenDates("/* .x */ .video figcaption { margin: 0; display: none; }"), [".video figcaption"]);
  assert.deepEqual(hiddenDates(".chapters-video .video figcaption { display: none; } .hero__caption { display: block; }"), [".chapters-video .video figcaption"], "under the chapters too (lead, etapa 5)");
  assert.deepEqual(hiddenDates(".hero__caption { display: block; }"), []);
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

// ── Round 4: the jump to the form, the brief for an AI ──────────────────────

const AI_BRIEF = {
  cs: `Připrav seznam firem pro službu TalentRadar, která hlídá, kde firmy nabírají.

Podklady: [přilož export z CRM nebo seznam klientů, případně napiš obory a region, které nás zajímají]

Vrať pouze tabulku jako prostý text, bez úvodu, bez komentáře a bez bloku kódu. Nejvýš 150 řádků. Oddělovač je středník. První řádek musí být přesně:
Firma;Kariérní stránka;Poslední kontakt;Proběhla zakázka

Pravidla:
- Firma: název firmy, každá firma jen jednou.
- Kariérní stránka: adresa stránky s volnými pozicemi, jen když ji znáš jistě. Jinak nech prázdné, dohledáme ji. Adresy si nevymýšlej.
- Poslední kontakt: datum posledního kontaktu s firmou ve tvaru 15. 3. 2024, jen když je v podkladech. Jinak prázdné.
- Proběhla zakázka: ano nebo ne, jen když to podklady říkají. Jinak prázdné.
- Nepiš jména lidí, e-maily, telefony ani kandidáty.

Příklad:
Firma;Kariérní stránka;Poslední kontakt;Proběhla zakázka
Air Bank;airbank.cz/volne-pozice;15. 3. 2024;ano
Rohlik Group;;;`,
  en: `Prepare a company list for TalentRadar, a service that tracks where companies are hiring.

Source: [attach a CRM export or your client list, or describe the sectors and region we care about]

Return only the table as plain text, with no introduction, no comment and no code block. At most 150 rows. The separator is a semicolon. The first row must be exactly:
Company;Careers page;Last contact;Had placement

Rules:
- Company: the company name, each company only once.
- Careers page: the address of its open positions page, only if you know it for certain. Otherwise leave it empty, we will look it up. Do not make up addresses.
- Last contact: the date of the last contact with the company as 15/03/2024, only if it is in the source. Otherwise empty.
- Had placement: yes or no, only if the source says so. Otherwise empty.
- Do not include people's names, emails, phone numbers or candidates.

Example:
Company;Careers page;Last contact;Had placement
Air Bank;airbank.cz/careers;15/03/2024;yes
Rohlik Group;;;`,
};
const unescapeHtml = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

test("the brief for an AI is on the page with the form, word for word in the page's language, without a no-break space", () => {
  const files = buildSite(loadSite());
  for (const [path, lang] of [["public/index.html", "cs"], ["public/en/index.html", "en"]]) {
    const html = String(files.get(path));
    const inPage = html.match(/<textarea class="ai-brief__prompt"[^>]*\sreadonly[^>]*>([\s\S]*?)<\/textarea>/);
    assert.ok(inPage, path);
    assert.equal(unescapeHtml(inPage[1]), AI_BRIEF[lang], path);
    assert.doesNotMatch(inPage[1], / /, path);
    // the first way: above the field and the upload; not sent with the form
    const brief = html.indexOf('class="ai-brief"');
    assert.ok(brief > html.indexOf('id="clients-acc"') && brief < html.indexOf('id="clients"') && brief < html.indexOf('id="file-upload"'), path);
    assert.doesNotMatch(html.match(/<textarea class="ai-brief__prompt"[^>]*>/)[0], /\sname=/, path);
  }
});

test("the brief's first row and example match the CSV template of its language, and the cleaning recognises that row", () => {
  const { i18n } = loadSite();
  for (const lang of ["cs", "en"]) {
    const template = readFileSync(new URL(`../public${i18n[lang].help_template_href}`, import.meta.url), "utf8").replace(/^﻿/, "").split(/\r?\n/);
    const header = template[0].split(/[;,]/).join(";");
    const brief = i18n[lang].trial_ai_brief.split("\n");
    assert.equal(brief.filter((l) => l === header).length, 2, `${lang}: the rule and the example`);
    assert.ok(AI_LIST_HEADERS.includes(header), lang);
    assert.equal(cleanAiList(i18n[lang].trial_ai_brief.split("\n").slice(-3).join("\n")), i18n[lang].trial_ai_brief.split("\n").slice(-3).join("\n"), `${lang}: the example comes through as it is`);
  }
});

test("cleanAiList: what an AI adds around the table goes, cell by cell the quotes go", () => {
  const table = "Firma;Kariérní stránka;Poslední kontakt;Proběhla zakázka\nAir Bank;airbank.cz/volne-pozice;15. 3. 2024;ano\nRohlik Group;;;";
  assert.equal(cleanAiList(`Tady je váš seznam:\n\n\`\`\`csv\n${table}\n\`\`\`\n\nDejte vědět, kdyby něco chybělo.`), table);
  assert.equal(cleanAiList(`\`\`\`\n${table}\n\`\`\`\nDejte vědět`), table, "a closing line right after the block");
  assert.equal(cleanAiList(`${table}\n\nDejte vědět\nHezký den`), table, "every line of the closing words");
  assert.equal(cleanAiList(table.replace(/\n/g, "\r\n")), table);
  assert.equal(cleanAiList(`﻿${table}`), table);
  assert.equal(cleanAiList('"Firma";"Kariérní stránka";"Poslední kontakt";"Proběhla zakázka"\n"Air Bank";"https://airbank.cz/x";"";"ano"'), "Firma;Kariérní stránka;Poslední kontakt;Proběhla zakázka\nAir Bank;https://airbank.cz/x;;ano");
  assert.equal(cleanAiList('"Firma;Kariérní stránka;Poslední kontakt;Proběhla zakázka"\n"Air Bank;airbank.cz;;"'), "Firma;Kariérní stránka;Poslední kontakt;Proběhla zakázka\nAir Bank;airbank.cz;;", "a quoted whole row");
  assert.equal(cleanAiList("Here you go:\ncompany;careers page;last contact;had placement\nAir Bank;;;\n\nLet me know."), "company;careers page;last contact;had placement\nAir Bank;;;".replace("company;careers page;last contact;had placement", "company;careers page;last contact;had placement"));
  // a company without a separator in the table itself stays; so does a row after an empty line that has one
  assert.equal(cleanAiList("Company;Careers page;Last contact;Had placement\nAir Bank\n\nRohlik Group;;;"), "Company;Careers page;Last contact;Had placement\nAir Bank\nRohlik Group;;;");
});

test("cleanAiList: after the table only rows as wide as the first row go on; the first other line ends it; inside the table a shorter row stays", () => {
  const head = "Firma;Kariérní stránka;Poslední kontakt;Proběhla zakázka";
  const table = `${head}\nAir Bank;airbank.cz;;ano`;
  assert.equal(cleanAiList(`${table}\n\nDejte vědět; rád pomůžu`), table, "a closing sentence with a semicolon is no company");
  assert.equal(cleanAiList(`\`\`\`\n${table}\n\`\`\`\nDejte vědět; rád pomůžu`), table, "right after the code block too");
  assert.equal(cleanAiList(`${table}\n\nDejte vědět; rád pomůžu\nRohlik Group;;;`), table, "all that follows the first such line goes");
  assert.equal(cleanAiList(`${table}\n\nA;b;c;d;e`), table, "more separators than the first row");
  assert.equal(cleanAiList(`${table}\n\nRohlik Group;;;`), `${table}\nRohlik Group;;;`, "a row as wide as the first one goes on");
  assert.equal(cleanAiList(`${table}\nRohlik Group;web\nSeznam\nAlza;;;`), `${table}\nRohlik Group;web\nSeznam\nAlza;;;`, "shorter rows with no empty line before them stay");
  assert.equal(cleanAiList(`${table}\n\n"Rohlik Group";"";"";""`), `${table}\nRohlik Group;;;`, "quotes do not change the width");
});

test("the brief's button says what it will do, also after the fallback has opened it", () => {
  const files = buildSite(loadSite());
  const js = String(files.get("public/js/site.js"));
  assert.match(js, /show\.textContent = on \? t\("trial_ai_hide", showLabel\) : showLabel;/);
  assert.match(js, /const byHand = \(\) => \{\s*open\(true\);/, "the fallback opens through the same function");
  const i18n = (path) => { const html = String(files.get(path)); return html.slice(html.indexOf('id="i18n"')); };
  assert.match(i18n("public/index.html"), /"trial_ai_hide":"Skrýt zadání"/);
  assert.match(i18n("public/en/index.html"), /"trial_ai_hide":"Hide the brief"/);
});

test("cleanAiList: without the recognised first row the text stays exactly as it is", () => {
  for (const typed of ["Rohlik Group", "Rohlik Group\nAir Bank; airbank.cz/volne-pozice\n", "  Tady je seznam:\n\n```\nAir Bank\n```\n", '"Air Bank";"x"', "Firma;Web\nAir Bank;airbank.cz", "", "Air Bank;;;\n\nRohlik"]) {
    assert.equal(cleanAiList(typed), typed);
  }
  assert.equal(cleanAiList(null), "");
  assert.equal(cleanAiList(undefined), "");
});

test("the form sends the cleaned list, still as the one text field the Worker reads", () => {
  const body = demoPayload({ name: "A B", email: "a@example.com", company: "C", clients: "Tady to je:\n```\nCompany;Careers page;Last contact;Had placement\nAir Bank;;;\n```\nBye", lang: "en" });
  assert.equal(body.clients, "Company;Careers page;Last contact;Had placement\nAir Bank;;;");
  assert.equal(demoPayload({ clients: "  Rohlik Group\n" }).clients, "Rohlik Group");
  assert.equal(typeof body.clients, "string");
});

test("the brief's controls: copying with a way back, said out loud, nothing without JavaScript that does nothing, no monospace", () => {
  const files = buildSite(loadSite());
  const css = String(files.get("public/css/site.css"));
  const js = String(files.get("public/js/site.js"));
  const html = String(files.get("public/index.html"));
  assert.match(js, /navigator\.clipboard\.writeText\(brief\.value\)\.then\(copied, byHand\)/);
  assert.match(js, /document\.execCommand\("copy"\)/);
  assert.match(html, /id="ai-brief-status" role="status" aria-live="polite"/);
  assert.match(html, /class="ai-brief" aria-live="off"/, "the form's own live region must not read the whole brief out when it opens");
  assert.match(css, /\.js \.ai-brief__prompt:not\(\.is-open\) \{ display: none; \}/);
  assert.match(css, /\.no-js \.ai-brief__actions \{ display: none; \}/);
  for (const key of ["trial_ai_copied"]) assert.match(html.slice(html.indexOf('id="i18n"')), new RegExp(`"${key}":"Zkopírováno"`));
  assert.match(String(files.get("public/en/index.html")).slice(String(files.get("public/en/index.html")).indexOf('id="i18n"')), /"trial_ai_copied":"Copied"/);
  assert.doesNotMatch(html.match(/<div class="ai-brief"[\s\S]*?<\/textarea>/)[0], /[\u{1F300}-\u{1FAFF}☀-➿]/u, "no emoji");
});

test("a link to the form lands on its heading under the bar; on a phone no focus, and the bar stays while the page moves", () => {
  const js = String(buildSite(loadSite()).get("public/js/site.js"));
  assert.match(js, /const wanted = \(\) => title\.getBoundingClientRect\(\)\.top \+ window\.scrollY - \(header \? header\.offsetHeight : 0\) - 8;/);
  assert.match(js, /if \(!slimBar\.matches\) first\.focus\(\{ preventScroll: true \}\);/);
  assert.match(js, /y < 80 \|\| holdHeader\) header\.classList\.remove\("is-hidden"\)/);
  assert.match(js, /addEventListener\("hashchange", \(\) => \{\s*if \(location\.hash === `#\$\{title\.id\}`\) land\(false\);/);
  // the anchor itself is the heading: right without the script and when the browser jumps on its own
  const files = buildSite(loadSite());
  assert.match(String(files.get("public/index.html")), /<h2 id="zkusit">/);
  assert.match(String(files.get("public/en/index.html")), /<h2 id="try">/);
  assert.match(String(files.get("public/css/site.css")), /\.trial__head h2 \{[^}]*scroll-margin-top:/);
});

test("the articles' box says the offer as the form does", () => {
  const files = buildSite(loadSite());
  const { i18n } = loadSite();
  for (const [path, lang, slugs] of [["public/blog/", "cs", ["prvni-dny-po-vypsani-pozice", "dlouho-otevrene-pozice", "kolik-stoji-mrtve-inzeraty"]], ["public/en/blog/", "en", ["the-4-day-latency-gap", "anatomy-of-stale-roles", "hidden-cost-of-dead-vacancies"]]]) {
    for (const slug of slugs) {
      const box = String(files.get(`${path}${slug}.html`)).match(/<div class="article-cta">[\s\S]*?<\/span>/)[0].replace(/ /g, " ");
      assert.ok(box.includes(i18n[lang].trial_promo), `${slug}: ${box}`);
    }
  }
});

// ── Etapa 5: the window on a board, the line under it, three chapters, versions by density ──

test("the frame: no painted bar, a board of the given proportions, none on a light band or a phone, the pause button under the window", () => {
  const files = buildSite(loadSite());
  const css = String(files.get("public/css/site.css"));
  const home = String(files.get("public/index.html"));
  assert.doesNotMatch(home, /frame__bar|frame__dots|frame__url|app\.talentradar\.eu<\/span>/);
  assert.doesNotMatch(css, /frame__bar|frame__dots|frame__url/);
  assert.equal(loadSite().i18n.cs.video_frame_url, undefined);
  assert.match(css, /\.frame \{[^}]*padding: 3\.27% 4% 1\.82%;[^}]*linear-gradient\(180deg, var\(--navy-800\), var\(--navy-850\)\)/);
  assert.match(css, /\.frame__window \{[^}]*border-radius: 11px;[^}]*0 0 0 1px rgba\(255, 255, 255, 0\.13\), 0 22px 54px rgba\(4, 7, 14, 0\.55\)/);
  assert.match(css, /\.band--light \.frame \{[^}]*padding: 0;[^}]*background: none;/);
  assert.match(css, /\.band--light \.frame__window \{ box-shadow: 0 18px 44px rgba\(19, 27, 44, 0\.28\); \}/);
  assert.match(css, /\.hero__media \.video \{ margin-inline: auto; max-width: var\(--video-hero\); \}/);
  assert.match(css, /--video-hero: 68\.75rem/);
  // the pause button is under the window, 48 px on a phone, not over the picture
  const hero = home.match(/<figure class="video video--hero[\s\S]*?<\/figure>/)[0];
  assert.ok(hero.indexOf("</video>") < hero.indexOf('class="frame__foot"') && hero.indexOf('class="frame__foot"') < hero.indexOf("video__toggle"));
  assert.match(css, /\.video__toggle \{ width: 48px; height: 48px; min-height: 48px;/);
  assert.doesNotMatch(css.match(/\.video__toggle \{ width: 48px[^}]*\}/)[0], /position: absolute/);
  // the same frame for every clip
  for (const id of ["hero", "how1", "ats"]) assert.match(home, new RegExp(`video--${id}[\\s\\S]*?<div class="frame">\\s*<div class="frame__window">`), id);
  assert.match(String(files.get("public/demo.html")), /video--tour[\s\S]*?<div class="frame">\s*<div class="frame__window">/);
});

test("the line under a video: the words from the text map and the times from media.json, a new clip's data changes it without any code", () => {
  const home = (edit) => String(buildSite(siteWith(edit)).get("public/index.html"));
  const hero = (html) => html.match(/<figure class="video video--hero[\s\S]*?<\/figure>/)[0];
  const site = loadSite();
  const lines = [...hero(home(() => {})).matchAll(/<span class="video__cue-line( is-on)?(?: [dm]-only| m-first)*" data-cues="hero" data-at="([\d.]+|none)"(?: data-at-mobile="([\d.]+|none)")?>/g)];
  assert.deepEqual(lines.map((m) => (m[2] === "none" ? null : Number(m[2]))), site.media.clips.hero.cues.map((c) => c.at));
  assert.deepEqual(lines.map((m) => !!m[1]), lines.map((_, i) => i === 0), "the first sentence is the one without JavaScript");
  const changed = hero(home((m) => { m.clips.hero.cues = [{ at: 1.5, key: "cue_hero_2" }]; }));
  assert.match(changed, /<span class="video__cue-line is-on" data-cues="hero" data-at="1\.5">Každé ráno, co přibylo\.<\/span>/);
  assert.equal((changed.match(/video__cue-line/g) || []).length, 1);
  // every chapter's sentences are in its one figure, so the line has one height for all three
  const how = home(() => {}).match(/<figure class="video video--how1[\s\S]*?<\/figure>/)[0];
  for (const id of ["how1", "how2", "how3"]) assert.match(how, new RegExp(`data-cues="${id}"`), id);
  // all the words exist in both languages; 60 characters is the rule, the hero's first sentence from the approved table has 61
  for (const [id, clip] of Object.entries(site.media.clips)) {
    for (const cue of clip.cues || []) {
      for (const lang of ["cs", "en"]) {
        assert.ok(site.i18n[lang][cue.key], `${id} ${cue.key} ${lang}`);
        assert.ok(site.i18n[lang][cue.key].length <= 61, `${lang} ${cue.key}: ${site.i18n[lang][cue.key].length} characters`);
      }
    }
  }
});

test("the line's mechanics: one grid cell, a fixed height; it follows the clip's time, stays on the first with reduced motion", () => {
  const files = buildSite(loadSite());
  const css = String(files.get("public/css/site.css"));
  const js = String(files.get("public/js/site.js"));
  assert.match(css, /\.video__cue \{ display: grid;/);
  assert.match(css, /\.video__cue-line \{ grid-area: 1 \/ 1; opacity: 0; visibility: hidden;/);
  assert.match(js, /const look = \(\) => \{ if \(v === shownVideo\(fig\)\) showCue\(fig\); \};\s*v\.addEventListener\("timeupdate", look\);\s*followFrames\(v, look\);/);
  assert.match(js, /requestVideoFrameCallback\(frame\)/);
  assert.match(js, /on\.textContent === now\.textContent && on\.getClientRects\(\)\.length\) return;/);
  assert.match(js, /const live = figures\.filter\(\(fig\) => fig\.querySelector\("\.video__toggle"\) && !stillPref\.matches\);/);
  assert.match(js, /fig\.dataset\.cueClip = clip\.id;/);
});

test("three chapters: Morning, Whom to call, Who wants this candidate; the origin and date under the video on a phone too", () => {
  const files = buildSite(loadSite());
  const site = loadSite();
  const css = String(files.get("public/css/site.css"));
  for (const [path, lang] of [["public/index.html", "cs"], ["public/en/index.html", "en"]]) {
    const html = String(files.get(path));
    assert.equal((html.match(/class="chapter-tab"/g) || []).length, 3, path);
    assert.equal((html.match(/role="tabpanel"/g) || []).length, 3, path);
    assert.match(html.match(/<figure class="video video--how1[\s\S]*?<\/figure>/)[0].match(/<figcaption>[\s\S]*?<\/figcaption>/)[0], /20\d\d/, path);
    for (const key of ["how_ch1_body", "how_ch1_body_m"]) {
      assert.doesNotMatch(site.i18n[lang][key], /klient|cílov|bez kontaktu|client|target compan/i, `${lang} ${key}: no groups of companies`);
    }
    assert.equal(site.i18n[lang].how_ch4_body, undefined);
  }
  assert.match(site.i18n.cs.how_ch1_body, /specializac/);
  assert.match(site.i18n.cs.how_ch1_body, /AI/);
  assert.match(site.i18n.en.how_ch1_body, /specialisation/);
  assert.doesNotMatch(`${site.i18n.cs.how_ch1_body} ${site.i18n.cs.how_ch2_body} ${site.i18n.cs.how_ch3_body}`, /\brol[eíi]\b|mandát/);
  assert.match(css, /\.chapters \{ display: grid; grid-template-columns: repeat\(3,/);
  assert.match(css, /@media \(max-width: 560px\) \{\s*\.chapters \{ grid-template-columns: 1fr 1fr; \}\s*\.chapters li:last-child \{ grid-column: 1 \/ -1; \}/);
  // the video first: 860 px of window at 1 440 px, the text beside it takes what is left (lead, etapa 5)
  assert.match(css, /\.chapters-layout \{ display: grid; grid-template-columns: minmax\(0, 1fr\) 16\.5rem;/);
  // the line under the video does not repeat the text beside it
  for (const lang of ["cs", "en"]) {
    for (const [id, clip] of Object.entries({ how1: "how_ch1", how2: "how_ch2", how3: "how_ch3" })) {
      const beside = `${site.i18n[lang][`${clip}_title`]} ${site.i18n[lang][`${clip}_body`]}`.toLowerCase();
      for (const cue of site.media.clips[id].cues) {
        const words = site.i18n[lang][cue.key].toLowerCase().replace(/[.,]/g, "");
        assert.ok(!beside.includes(words), `${lang} ${cue.key} is said in the text beside it`);
      }
    }
  }
  assert.doesNotMatch(css, /chapters-video \.video figcaption \{ display: none/);
});

test("versions by pixel density: <source media> in the page and in a tab's clip, their own size and budget, the order of media.json", () => {
  const hi = "(min-resolution: 1.5dppx) and (min-width: 768px)";
  const addVersions = (clip) => {
    clip.sources = [
      { src: "/video/x.hi.{lang}.mp4", type: 'video/mp4; codecs="av01.0.13M.08"', media: hi, width: 2048, height: 1280, budget_mb: 7 },
      { src: "/video/x.hi2.{lang}.mp4", type: 'video/mp4; codecs="avc1.640033"', media: hi, width: 2048, height: 1280, budget_mb: 7 },
      { src: "/video/x.{lang}.mp4", type: "video/mp4" },
    ];
  };
  const files = buildSite(siteWith((m) => { addVersions(m.clips.hero); addVersions(m.clips.how2); }));
  const home = String(files.get("public/index.html"));
  const desktop = home.match(/<figure class="video video--hero[\s\S]*?<\/video>/)[0];
  const sources = [...desktop.matchAll(/<source [^>]*>/g)].map((m) => m[0]);
  assert.equal(sources.length, 3);
  assert.match(sources[0], /src="\/video\/x\.hi\.cs\.mp4[^"]*" type="video\/mp4; codecs=&quot;av01\.0\.13M\.08&quot;" media="\(min-resolution: 1\.5dppx\) and \(min-width: 768px\)"/);
  assert.doesNotMatch(sources[2], /media=/);
  const tab = JSON.parse(home.match(/id="tab-2"[^>]*data-clip="([^"]+)"/)[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
  assert.equal(tab.id, "how2");
  assert.equal(tab.sources[0].media, hi);
  assert.equal(clipFor(tab, false).sources[0].media, hi);
  assert.equal(clipFor(tab, false).sources[2].media, undefined);
  assert.match(String(files.get("public/js/site.js")), /if \(s\.media\) el\.media = s\.media;/);
  // media:use: sees the version's own size and budget
  const media = siteWith((m) => addVersions(m.clips.hero)).media;
  const row = expectedFiles(media).find((f) => f.name === "x.hi.cs.mp4");
  assert.deepEqual([row.width, row.height, row.budget], [2048, 1280, 7e6]);
  assert.equal(expectedFiles(media).find((f) => f.name === "x.cs.mp4").width, media.clips.hero.width, "a version without a size has the cut's");
});

test("a format can go by taking out its rows, nothing else; without an MP4 for every screen media:use and release refuse", () => {
  const noWebm = siteWith((m) => {
    for (const clip of Object.values(m.clips)) {
      clip.sources = clip.sources.filter((s) => s.type !== "video/webm");
      if (clip.mobile) clip.mobile.sources = clip.mobile.sources.filter((s) => s.type !== "video/webm");
    }
  });
  assert.deepEqual(sourceProblems(noWebm.media), []);
  assert.doesNotMatch(String(buildSite(noWebm).get("public/index.html")), /\.webm/);
  assert.deepEqual(sourceProblems(loadSite().media), []);
  const bad = siteWith((m) => {
    m.clips.how1.sources = [{ src: "/video/a.{lang}.webm", type: "video/webm" }];
    m.clips.how2.mobile.sources = [{ src: "/video/a.{lang}.mp4", type: "video/mp4", media: "(min-resolution: 1.5dppx)" }];
  });
  assert.deepEqual(sourceProblems(bad.media), ["how1: the last source has to be an MP4 for every screen", "how2 phone: the last source has to be an MP4 for every screen"]);
});

test("media:use puts a set with density versions in place in one transaction, checks each version's own size and budget", () => {
  const s = sandbox();
  try {
    const hi = "(min-resolution: 1.5dppx) and (min-width: 768px)";
    s.media.clips.hero.sources.unshift({ src: "/video/hero-hi.{lang}.mp4", type: "video/mp4", media: hi, width: 2048, height: 1280, budget_mb: 7 });
    writeFileSync(join(s.root, "src/data/media.json"), JSON.stringify(s.media));
    fakeSet(s.source, s.media);
    for (const lang of ["cs", "en"]) s.sizes.set(`hero-hi.${lang}.mp4`, { width: 2048, height: 1280 });
    truncateSync(join(s.source, "hero-hi.cs.mp4"), 6900000);
    const { problems } = s.use();
    assert.deepEqual(problems, [], "under its own 7 MB, over the name's 1.5 MB");
    const version = JSON.parse(s.json()).version;
    assert.equal(version, setVersion(join(s.root, "public/video"), s.media));
    // over its budget, and other pixels: refused, nothing changes
    const before = fingerprint(s.root);
    truncateSync(join(s.source, "hero-hi.cs.mp4"), 7100000);
    s.sizes.set("hero-hi.en.mp4", { width: 1920, height: 1200 });
    const refused = s.use({ date: "2026-11-02" }).problems;
    assert.ok(refused.some((p) => /hero-hi\.cs\.mp4: 7\.10 MB is over its budget of 7 MB/.test(p)), refused.join("; "));
    assert.ok(refused.some((p) => /hero-hi\.en\.mp4: 1920×1200, media\.json says 2048×1280/.test(p)), refused.join("; "));
    assert.deepEqual(fingerprint(s.root), before);
    // a failure after the swap undoes the versions as well
    truncateSync(join(s.source, "hero-hi.cs.mp4"), 5000000);
    s.sizes.set("hero-hi.en.mp4", { width: 2048, height: 1280 });
    const failed = s.use({ date: "2026-11-02", verify: () => { throw new Error("the release check failed"); } });
    assert.equal(failed.undone, true);
    assert.deepEqual(fingerprint(s.root), before);
  } finally { s.done(); }
});

test("saving data or on a slow network the videos stay on their poster until asked for", () => {
  assert.equal(savesData(undefined), false);
  assert.equal(savesData({}), false);
  assert.equal(savesData({ effectiveType: "4g" }), false);
  assert.equal(savesData({ saveData: true, effectiveType: "4g" }), true);
  for (const type of ["slow-2g", "2g", "3g"]) assert.equal(savesData({ effectiveType: type }), true, type);
  const js = String(buildSite(loadSite()).get("public/js/site.js"));
  assert.match(js, /if \(stays\) fig\.dataset\.user = "paused";/);
  assert.match(js, /waitsForTap\(e\.target\) \|\| stays\) continue;/);
});

// ── A clip replaced one language and one screen at a time ───────────────────

/** A clip's new cut for Czech, the older one stays for English (the fixture's hero). */
const heroNewForCzech = (m) => {
  const { hero } = m.clips;
  hero.by_lang = { en: { waits: "V1 EN", clip_date: "2026-11-01", poster: hero.poster, sources: hero.sources, width: hero.width, height: hero.height, cues: hero.cues } };
  hero.mobile = { waits: "V1 telefon", clip_date: "2026-11-01", ...hero.mobile };
  hero.clip_date = "2026-11-03";
  hero.poster = "/video/hero.{lang}.1920.webp";
  hero.width = 1920;
  hero.height = 1200;
  hero.sources = [
    { src: "/video/hero.{lang}.2048.60.mp4", type: "video/mp4", media: "(min-resolution: 1.5dppx) and (min-width: 768px)", width: 2048, height: 1280, budget_mb: 7 },
    { src: "/video/hero.{lang}.1440.60.mp4", type: "video/mp4", width: 1440, height: 900, budget_mb: 4.5 },
  ];
  hero.cues = [{ at: 0, at_mobile: 0, key: "cue_hero_1" }, { at: 3.95, at_mobile: 3.3, key: "cue_hero_2" }, { at: 12.5, at_mobile: null, key: "cue_hero_1" }];
};
const frozen = () => JSON.parse(readFileSync(REAL, "utf8"));

test("by_lang: the set has each language's own files, the new name only where it is, and taking the entry out is the whole change", () => {
  const media = frozen();
  heroNewForCzech(media);
  const names = expectedFiles(media).map((f) => f.name);
  for (const name of ["hero.cs.2048.60.mp4", "hero.cs.1440.60.mp4", "hero.cs.1920.webp", "hero.en.webm", "hero.en.mp4", "hero.en.webp", "hero-mobile.cs.mp4", "hero-mobile.en.mp4"]) assert.ok(names.includes(name), name);
  for (const name of ["hero.en.2048.60.mp4", "hero.en.1920.webp", "hero.cs.webm", "hero.cs.mp4", "hero.cs.webp"]) assert.ok(!names.includes(name), name);
  const row = (name) => expectedFiles(media).find((f) => f.name === name);
  assert.deepEqual([row("hero.cs.1920.webp").width, row("hero.en.webp").width, row("hero.cs.1440.60.mp4").budget], [1920, 1440, 4.5e6]);
  assert.equal(clipIn(media.clips.hero, "cs"), media.clips.hero);
  assert.equal(clipIn(media.clips.hero, "en").poster, "/video/hero.{lang}.webp");
  delete media.clips.hero.by_lang;
  assert.ok(expectedFiles(media).map((f) => f.name).includes("hero.en.2048.60.mp4"));
  assert.ok(!expectedFiles(media).map((f) => f.name).includes("hero.en.webm"));
});

test("by_lang with times only: a language on the same files, with its own lines; the phone cut's files are untouched", () => {
  const edit = (m) => {
    m.clips = frozen().clips;
    heroNewForCzech(m);
    m.clips.hero.by_lang.en = { clip_date: "2026-11-03", cues: [{ at: 0, at_mobile: 0, key: "cue_hero_1" }, { at: 4.27, at_mobile: 3.3, key: "cue_hero_2" }] };
    m.version = null;
  };
  const site = siteWith(edit);
  assert.deepEqual(sourceProblems(site.media), []);
  const names = expectedFiles(site.media).map((f) => f.name);
  for (const name of ["hero.en.2048.60.mp4", "hero.en.1440.60.mp4", "hero.en.1920.webp", "hero-mobile.en.mp4"]) assert.ok(names.includes(name), name);
  assert.ok(!names.includes("hero.en.webm"));
  const files = buildSite(site);
  const en = page(files, "public/en/index.html").match(/<figure class="video video--hero[\s\S]*?<\/figure>/)[0];
  assert.match(en, /src="\/video\/hero\.en\.2048\.60\.mp4"/);
  assert.match(en, /data-at="4\.27"/);
  assert.doesNotMatch(en, /data-at="3\.95"/);
  assert.match(page(files, "public/index.html"), /data-at="3\.95"/);
});

test("by_lang: its cuts are held to the same rule, and only the site's languages", () => {
  const media = frozen();
  heroNewForCzech(media);
  assert.deepEqual(sourceProblems(media), []);
  media.clips.hero.by_lang.en.sources = [{ src: "/video/hero.{lang}.webm", type: "video/webm" }];
  assert.deepEqual(sourceProblems(media), ["hero en: the last source has to be an MP4 for every screen"]);
  media.clips.hero.by_lang = { de: media.clips.hero.by_lang.en };
  assert.ok(sourceProblems(media).some((p) => p.includes("by_lang has de")));
});

test("by_lang on the page: each language its files, poster, preload and times; the hidden phone cut stays", () => {
  const files = buildSite(siteWith((m) => { m.clips = frozen().clips; heroNewForCzech(m); m.version = null; }));
  const figure = (path) => page(files, path).match(/<figure class="video video--hero[\s\S]*?<\/figure>/)[0];
  const cs = figure("public/index.html");
  const en = figure("public/en/index.html");
  assert.deepEqual([...cs.match(/<video [\s\S]*?<\/video>/)[0].matchAll(/<source src="([^"]+)"/g)].map((m) => m[1]), ["/video/hero.cs.2048.60.mp4", "/video/hero.cs.1440.60.mp4"]);
  assert.deepEqual([...en.match(/<video [\s\S]*?<\/video>/)[0].matchAll(/<source src="([^"]+)"/g)].map((m) => m[1]), ["/video/hero.en.webm", "/video/hero.en.mp4"]);
  assert.match(cs, /poster="\/video\/hero\.cs\.1920\.webp"/);
  assert.match(cs, /width="1920" height="1200"/);
  assert.match(en, /poster="\/video\/hero\.en\.webp"/);
  assert.match(cs, /poster="\/video\/hero-mobile\.cs\.webp"/);
  assert.match(page(files, "public/index.html"), /rel="preload" as="image" href="\/video\/hero\.cs\.1920\.webp" media="\(min-width: 768px\)"/);
  assert.match(page(files, "public/en/index.html"), /rel="preload" as="image" href="\/video\/hero\.en\.webp" media="\(min-width: 768px\)"/);
  assert.match(cs, /data-at="3\.95" data-at-mobile="3\.3"/);
  assert.match(cs, /data-at="12\.5" data-at-mobile="none"/);
  assert.doesNotMatch(en, /data-at="3\.95"/);
  assert.match(en, /data-at="4\.1"/);
});

test("the date says what each cut is: the hero's own by language and screen, the others the set's", () => {
  const files = buildSite(siteWith((m) => { m.clips = frozen().clips; heroNewForCzech(m); }));
  const line = (path, cls) => page(files, path).match(new RegExp(`hero__caption"><span class="d-only">[\\s\\S]*?</p>`))[0].match(new RegExp(`<span class="${cls}">([\\s\\S]*?)</span>`))[1];
  assert.match(line("public/index.html", "d-only"), /^Natočeno 3\.\u00a011\.\u00a02026 /);
  assert.match(line("public/index.html", "m-only"), /^Natočeno 1\.\u00a011\.\u00a02026 /);
  assert.match(line("public/en/index.html", "d-only"), /^Recorded 1\u00a0Nov\u00a02026 /);
  assert.match(page(files, "public/index.html").match(/<figure class="video video--how1[\s\S]*?<\/figure>/)[0], /Natočeno 1\.\u00a011\.\u00a02026\./);
  // without its own, the hero says the set's
  const set = buildSite(siteWith((m) => { m.clips = frozen().clips; m.clip_date = "2026-10-20"; }));
  assert.match(page(set, "public/index.html").match(/hero__caption">[\s\S]*?<\/p>/)[0], /Natočeno 20\.\u00a010\.\u00a02026 /);
});

test("the date under the chapters: one sentence while all three clips share a day, each clip its own day when they do not", () => {
  const how = (files, path = "public/index.html") => page(files, path).match(/<figure class="video video--how1[\s\S]*?<\/figure>/)[0];
  const clips = (edit) => buildSite(siteWith((m) => { m.clips = frozen().clips; m.clip_date = "2026-11-01"; edit(m); }));
  const same = how(clips(() => {}));
  assert.match(same, /<figcaption>[^<]*Natočeno 1\.\u00a011\.\u00a02026\.<\/figcaption>/);
  assert.doesNotMatch(same, /video__caption-line/);

  const files = clips((m) => { m.clips.how2.clip_date = "2026-11-03"; });
  const lines = [...how(files).match(/<figcaption>([\s\S]*?)<\/figcaption>/)[1].matchAll(/<span class="video__caption-line( is-on)?" data-cues="(how\d)">([\s\S]*?)<\/span>(?=<span class="video__caption-line|<\/span>$)/g)];
  assert.deepEqual(lines.map((l) => l[2]), ["how1", "how2", "how3"]);
  assert.deepEqual(lines.map((l) => !!l[1]), [true, false, false], "without JavaScript the first chapter's, the one that shows");
  // the wide cut of how2 is new, its phone cut is not: each screen is told the day of what it plays
  assert.match(lines[0][3], /^[^<]*Natočeno 1\.\u00a011\.\u00a02026\.$/);
  assert.match(lines[1][3], /<span class="d-only">[^<]*Natočeno 3\.\u00a011\.\u00a02026\.<\/span><span class="m-only">[^<]*Natočeno 1\.\u00a011\.\u00a02026\.<\/span>/);
  assert.match(how(files, "public/en/index.html"), /Recorded 3\u00a0Nov\u00a02026\./);

  // a language still on its older cut says that cut's day
  const en = clips((m) => { m.clips.how2.clip_date = "2026-11-03"; m.clips.how2.by_lang = { en: { clip_date: "2026-11-01" } }; });
  assert.doesNotMatch(how(en, "public/en/index.html"), /video__caption-line/);
  assert.match(how(en), /Natočeno 3\.\u00a011\.\u00a02026\./);

  const css = String(files.get("public/css/site.css"));
  assert.match(css, /\.video__captions \{ display: grid; \}/);
  assert.match(css, /\.video__caption-line \{ grid-area: 1 \/ 1; visibility: hidden; \}/);
  assert.match(String(files.get("public/js/site.js")), /fig\.querySelectorAll\("\.video__caption-line"\)\) l\.classList\.toggle\("is-on", l\.dataset\.cues === clip\.id\)/);
});

test("a clip with its own day says it under its own figure; release wants a date for each clip of a figure", () => {
  const tour = buildSite(siteWith((m) => { m.clips = frozen().clips; m.clip_date = "2026-11-01"; m.clips.tour.clip_date = "2026-11-03"; }));
  assert.match(page(tour, "public/demo.html").match(/<figcaption>[\s\S]*?<\/figcaption>/)[0], /Natočeno 3\.\u00a011\.\u00a02026\./);
  const errors = (edit) => checkSite(siteFiles(buildSite(siteWith((m) => { m.clips = frozen().clips; m.clip_date = "2026-11-01"; edit(m); }))), { redirects: REDIRECTS, workerFirst: workerFirstPatterns(), release: true }).errors;
  const missing = /the caption of the how\d video has no recording date/;
  assert.ok(!errors((m) => { m.clips.how2.clip_date = "2026-11-03"; }).some((e) => missing.test(e)));
  // how1 has its day, how2 and how3 have none: the sentence goes for them, and release names them
  const none = errors((m) => { m.clip_date = null; m.clips.how1.clip_date = "2026-11-03"; m.clips.how1.mobile.clip_date = "2026-11-03"; });
  assert.ok(none.some((e) => e.includes("the caption of the how2 video has no recording date")), none.join("; "));
  assert.ok(none.some((e) => e.includes("the caption of the how3 video has no recording date")));
  assert.ok(!none.some((e) => e.includes("the caption of the how1 video")));
});

test("chapter 1's words say what the clip shows: in alphabetical order it proves no 'most', and what it sets aside there was not set aside by AI (cut sheet V2)", () => {
  const { i18n } = loadSite();
  assert.equal(i18n.cs.cue_morning_1, "Kde se nabírá, firma po firmě.");
  assert.equal(i18n.en.cue_morning_1, "Where they’re hiring, company by company.");
  for (const lang of ["cs", "en"]) {
    assert.doesNotMatch(i18n[lang].cue_morning_1, /nejvíc|most/, lang);
    assert.doesNotMatch(i18n[lang].how_clip1_alt, /\bAI\b/, lang);
  }
});

test("the description of chapters 2 and 3 says what the Czech clips show: no draft in V3, the order by rules in V4 (cut sheets V3, V4)", () => {
  const { cs } = loadSite().i18n;
  assert.doesNotMatch(cs.how_clip2_alt, /návrh|zpráv/i);
  assert.match(cs.how_clip2_alt, /LinkedIn/);
  assert.match(cs.how_clip3_alt, /podle pravidel/);
  assert.doesNotMatch(cs.how_clip3_alt, /\bAI\b/);
});

test("what chapters 2 and 3 say about the estimate and the AI matches the clips: by the role's title, and rules only in the demo", () => {
  const { cs, en } = loadSite().i18n;
  assert.match(cs.how_ch2_body, /Podle názvu pozice odhadneme/);
  assert.match(en.how_ch2_body, /From the role’s title we estimate/);
  assert.doesNotMatch(cs.how_ch2_body, /Z inzerátu/);
  assert.match(cs.how_ch3_body, /V ukázce řadí jen pravidla, bez AI\.$/);
  assert.match(en.how_ch3_body, /In the demo only rules do the ranking, no AI\.$/);
});

test("the text under the hero: the sentences of the cut sheet, no number of companies against the 99 in the clip, the demo's broad focus said", () => {
  const { i18n } = loadSite();
  assert.equal(i18n.cs.cue_hero_1, "Otevřené pozice všech vašich firem, jen ve vaší specializaci.");
  assert.equal(i18n.cs.cue_hero_2, "Každé ráno, co přibylo.");
  assert.equal(i18n.cs.cue_hero_3, "S odkazem na skutečný inzerát.");
  for (const [lang, broad] of [["cs", /širokým zaměřením|široce zaměřená/], ["en", /broad focus/]]) {
    for (const key of ["hero_video_caption", "hero_video_caption_m"]) {
      assert.doesNotMatch(i18n[lang][key], /\b100\b/, `${lang} ${key}`);
      assert.match(i18n[lang][key], broad, `${lang} ${key}`);
      assert.match(i18n[lang][key], /\{clip\.hero(_phone)?_date\}/, `${lang} ${key}`);
    }
    assert.doesNotMatch(i18n[lang].hero_video_poster_alt, /Ranní|morning/i, lang);
  }
  // measured in Chromium, 3. 11. 2026: longer than this and the phone's line takes one more row at 360 px (Czech) and 390 px (English)
  assert.ok(i18n.cs.hero_video_caption_m.replace("{clip.hero_phone_date}", "3. 11. 2026").length <= 90);
  assert.ok(i18n.en.hero_video_caption_m.replace("{clip.hero_phone_date}", "1 Nov 2026").length <= 94);
});

test("a loop is on its own layer before it plays, so the picture does not move when the poster gives way to the first frame", () => {
  assert.match(String(buildSite(loadSite()).get("public/css/site.css")), /\.video\[data-autoplay\] \.frame__screen video \{ will-change: transform; \}/);
});

test("a line for one screen only: it takes no room on the other, and a phone without the script shows its own first sentence", () => {
  const cues = [
    { at: 0, at_mobile: null, key: "cue_hero_1" },
    { at: 2.9, at_mobile: 0, key: "cue_hero_2" },
    { at: 11, at_mobile: 6.2, key: "cue_hero_3" },
    { at: null, at_mobile: 9, key: "cue_hero_2" },
  ];
  const files = buildSite(siteWith((m) => { m.clips.hero.cues = cues; }));
  const html = page(files, "public/index.html").match(/<figure class="video video--hero[\s\S]*?<\/figure>/)[0];
  assert.match(html, /<span class="video__cue-line is-on d-only" data-cues="hero" data-at="0" data-at-mobile="none">/);
  assert.match(html, /<span class="video__cue-line m-first" data-cues="hero" data-at="2\.9" data-at-mobile="0">/);
  assert.match(html, /<span class="video__cue-line" data-cues="hero" data-at="11" data-at-mobile="6\.2">/);
  assert.match(html, /<span class="video__cue-line m-only" data-cues="hero" data-at="none" data-at-mobile="9">/);
  const js = String(files.get("public/js/site.js"));
  assert.match(js, /querySelectorAll\("\.video__cue-line\.m-first"\)\) l\.classList\.remove\("m-first"\)/);
  assert.match(js, /onMediaChange\(phone, firstLines\)/);
  assert.match(String(files.get("public/css/site.css")), /\.video__cue-line\.m-first \{ opacity: 1; visibility: visible; \}/);
  // a clip whose first line is for both screens stays as it was
  const plain = page(buildSite(siteWith((m) => { m.clips.hero.cues = [{ at: 0, at_mobile: 0, key: "cue_hero_1" }]; })), "public/index.html");
  assert.match(plain, /<span class="video__cue-line is-on" data-cues="hero" data-at="0" data-at-mobile="0">/);
  assert.doesNotMatch(plain, /m-first"/);
});

test("the hero's phone cut: its times say what the V1 phone clip shows, the first sentence of the wide cut is not on it", () => {
  const { hero } = loadSite().media.clips;
  const lineAt = (t) => { const seen = hero.cues.filter((c) => c.at_mobile !== null && c.at_mobile !== undefined && c.at_mobile <= t); return seen.sort((a, b) => a.at_mobile - b.at_mobile).pop().key; };
  assert.deepEqual([0, 6.1, 6.2, 8.9, 9, 11.4].map(lineAt), ["cue_hero_2", "cue_hero_2", "cue_hero_3", "cue_hero_3", "cue_hero_2", "cue_hero_2"]);
  assert.equal(hero.mobile.waits, undefined);
  assert.equal(hero.mobile.clip_date, "2026-11-03");
});

test("cueNow on a cut that lacks the page's first line: its own first line from the start, and a line of the other cut never", () => {
  const line = (at, atMobile) => ({ dataset: { at: String(at), atMobile: String(atMobile) } });
  const lines = [line(0, "none"), line(2.9, 0), line(11, 6.2), line(13.1, "none"), line("none", 9)];
  const at = (time, phone) => lines.indexOf(cueNow(lines, time, phone));
  assert.deepEqual([0, 6.19, 6.2, 8.99, 9, 11.49].map((t) => at(t, true)), [1, 1, 2, 2, 4, 4]);
  assert.deepEqual([0, 2.89, 2.9, 10.99, 11, 13.1, 13.99].map((t) => at(t, false)), [0, 0, 1, 1, 2, 3, 3]);
});

test("cueNow: the last line whose time has come, on the phone cut by its own times, a line the phone cut does not have never", () => {
  const line = (at, atMobile) => ({ dataset: { at: String(at), ...(atMobile === undefined ? {} : { atMobile: String(atMobile) }) } });
  const lines = [line(0, 0), line(3.95, 3.3), line(8.55, 6.6), line(12.5, "none")];
  const at = (time, phone) => lines.indexOf(cueNow(lines, time, phone));
  assert.deepEqual([0, 3.94, 3.95, 8.54, 8.55, 12.49, 12.5, 14.99].map((t) => at(t, false)), [0, 0, 1, 1, 2, 2, 3, 3]);
  assert.deepEqual([0, 3.29, 3.3, 6.6, 12.5, 12.8].map((t) => at(t, true)), [0, 0, 1, 2, 2, 2]);
  const noPhoneTime = [line(0), line(5)];
  assert.equal(noPhoneTime.indexOf(cueNow(noPhoneTime, 5, true)), 1, "without one, the clip's time");
});

test("waits: release names every cut that is not the final one, media:use's own check does not stop on them", () => {
  const media = frozen();
  assert.deepEqual(waitingCuts(media), []);
  heroNewForCzech(media);
  assert.deepEqual(waitingCuts(media), ["hero phone: still the older cut, waits for V1 telefon", "hero en: still the older cut, waits for V1 EN"]);
  delete media.clips.hero.by_lang;
  delete media.clips.hero.mobile.waits;
  assert.deepEqual(waitingCuts(media), []);
  const c = repoCopy();
  try {
    assert.deepEqual(c.use().problems, []);
    const path = join(c.root, "src/data/media.json");
    const placed = JSON.parse(readFileSync(path, "utf8"));
    placed.clips.how1.waits = "V2";
    writeFileSync(path, JSON.stringify(placed));
    const release = c.release();
    assert.equal(release.status, 1);
    assert.match(release.stderr, /how1: still the older cut, waits for V2/);
    assert.equal(spawnSync(process.execPath, ["tools/check-site.mjs", "--release", "--during-media-use"], { cwd: c.root, encoding: "utf8", timeout: 60000 }).status, 0);
  } finally { c.done(); }
});

/** A set in place, then media.json names a new Czech hero and a folder holds only its files. */
function oneClipLater() {
  const s = sandbox();
  assert.deepEqual(s.use().problems, []);
  const media = JSON.parse(s.json());
  heroNewForCzech(media);
  writeFileSync(join(s.root, "src/data/media.json"), JSON.stringify(media));
  const folder = join(s.root, "new");
  mkdirSync(folder);
  const write = (name, body) => writeFileSync(join(folder, name), body);
  write("hero.cs.2048.60.mp4", "new 2048");
  write("hero.cs.1440.60.mp4", "new 1440");
  write("hero.cs.1920.webp", fakePoster("new poster"));
  const sizes = new Map(expectedFiles(media).filter((f) => f.width).map((f) => [f.name, { width: f.width, height: f.height, duration: 100 }]));
  const probe = (path) => {
    const name = path.split(/[\\/]/).pop();
    const lang = (name.match(/^tour\.(cs|en)\./) || [])[1];
    return { ...sizes.get(name), duration: lang === "en" ? 110 : 100 };
  };
  const one = (extra = {}) => useSet({ source: folder, keepRest: true, root: s.root, today: TODAY, probe, tracked: [], staged: [], ...extra });
  return { ...s, media, folder, write, sizes, one };
}

test("--keep-rest: one clip's files go in, every other file stays what it is, the dates stay what media.json says, the version is new", () => {
  const s = oneClipLater();
  try {
    const before = JSON.parse(s.json());
    const other = readFileSync(join(s.root, "public/video/rano.cs.mp4"));
    const { problems, version, warnings } = s.one();
    assert.deepEqual(problems, []);
    const after = JSON.parse(s.json());
    assert.equal(after.clip_date, before.clip_date, "the set's date is not touched");
    assert.equal(after.clips.hero.clip_date, "2026-11-03");
    assert.equal(after.version, version);
    assert.notEqual(version, before.version);
    assert.equal(readFileSync(join(s.root, "public/video/hero.cs.2048.60.mp4"), "utf8"), "new 2048");
    assert.ok(readFileSync(join(s.root, "public/video/rano.cs.mp4")).equals(other));
    assert.ok(existsSync(join(s.root, "public/video/hero.en.webm")), "English keeps its cut");
    assert.ok(existsSync(join(s.root, "public/video/tour.chapters.json")));
    assert.deepEqual(leftovers(s.root), []);
    assert.ok(warnings.some((w) => w.includes("hero.cs.webm")), "the older Czech files are listed");
    assert.equal(version, setVersion(join(s.root, "public/video"), after), "the files on disk are that version");
    assert.deepEqual(videoSetProblems(after, { root: s.root, duringMediaUse: true }), []);
  } finally { s.done(); }
});

test("--keep-rest: what media.json names and is in neither folder stops it, and nothing changes; the same for a date in the future or a poster of the wrong size", () => {
  for (const [what, spoil, expected] of [
    ["a file nobody delivered", (s) => rmSync(join(s.folder, "hero.cs.1440.60.mp4")), /hero\.cs\.1440\.60\.mp4: missing/],
    ["a recording date in the future", (s) => { const m = JSON.parse(s.json()); m.clips.hero.clip_date = "2026-12-24"; writeFileSync(join(s.root, "src/data/media.json"), JSON.stringify(m)); }, /hero: clip_date, 2026-12-24: in the future/],
    ["a poster of the wrong size", (s) => s.sizes.set("hero.cs.1920.webp", { width: 1440, height: 900 }), /hero\.cs\.1920\.webp: 1440×900, media\.json says 1920×1200/],
    ["a version over its budget", (s) => truncateSync(join(s.folder, "hero.cs.1440.60.mp4"), 4600000), /hero\.cs\.1440\.60\.mp4: 4\.60 MB is over its budget of 4\.5 MB/],
  ]) {
    const s = oneClipLater();
    try {
      spoil(s);
      const before = fingerprint(s.root);
      const { problems, version } = s.one();
      assert.ok(problems.some((p) => expected.test(p)), `${what}: ${problems.join("; ")}`);
      assert.equal(version, undefined, what);
      assert.deepEqual(fingerprint(s.root), before, what);
      assert.deepEqual(leftovers(s.root), [], what);
    } finally { s.done(); }
  }
});

test("--keep-rest: a release check that fails puts everything back", () => {
  const s = oneClipLater();
  try {
    const before = fingerprint(s.root);
    const { problems, undone } = s.one({ verify: () => { throw new Error("the check says no"); } });
    assert.deepEqual(problems, ["the check says no"]);
    assert.equal(undone, true);
    assert.deepEqual(fingerprint(s.root), before);
    assert.ok(!existsSync(join(s.root, "public/video/hero.cs.2048.60.mp4")));
    assert.deepEqual(leftovers(s.root), []);
  } finally { s.done(); }
});

test("a whole set with --date writes the set's date and leaves a clip's own alone, as V6's", () => {
  const s = oneClipLater();
  try {
    const whole = s.folder;
    for (const f of expectedFiles(s.media)) if (!existsSync(join(whole, f.name))) writeFileSync(join(whole, f.name), f.name.endsWith(".vtt") ? "WEBVTT\n" : f.name.endsWith(".webp") ? fakePoster(f.name) : `fake ${f.name}`);
    writeFileSync(join(whole, "tour.chapters.json"), JSON.stringify(chapters()));
    const { problems } = s.one({ keepRest: false, date: "2026-11-02" });
    assert.deepEqual(problems, []);
    const after = JSON.parse(s.json());
    assert.equal(after.clip_date, "2026-11-02");
    assert.equal(after.clips.hero.clip_date, "2026-11-03");
  } finally { s.done(); }
});
