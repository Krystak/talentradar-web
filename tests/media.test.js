// The real clips on the site: what media.json has to say about them, the addresses and
// dates the build makes of it, the release check's new rows, and tools/media-use.mjs,
// the one step that swaps a set of clips. Run with `npm test`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, truncateSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { buildSite, loadSite } from "../build.mjs";
import { answer, checkSite, dataClipFiles, ignoredNames, siteFiles, videoBudget, workerFirstPatterns } from "../tools/check-site.mjs";
import { chapterProblems, dateProblem, expectedFiles, setProblems, setVersion, useSet } from "../tools/media-use.mjs";
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

test("the marker and the chapter times are not published", () => {
  const names = ignoredNames();
  assert.ok(names.has(".gitignore"));
  assert.ok(names.has("tour.chapters.json"));
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
/** A made-up set: every file media.json names, a few bytes each, and sizes that a fake ffprobe reads back. */
function fakeSet(dir, media) {
  mkdirSync(dir, { recursive: true });
  for (const f of expectedFiles(media)) writeFileSync(join(dir, f.name), f.name.endsWith(".vtt") ? "WEBVTT\n" : `fake ${f.name}`);
  writeFileSync(join(dir, "tour.chapters.json"), JSON.stringify(chapters()));
}
function sandbox() {
  const root = mkdtempSync(join(tmpdir(), "media-use-"));
  mkdirSync(join(root, "src/data"), { recursive: true });
  mkdirSync(join(root, "public/video"), { recursive: true });
  const media = JSON.parse(readFileSync(REAL, "utf8"));
  writeFileSync(join(root, "src/data/media.json"), JSON.stringify(media));
  const sizes = new Map(expectedFiles(media).filter((f) => f.width).map((f) => [f.name, { width: f.width, height: f.height }]));
  const probe = (path) => sizes.get(path.split(/[\\/]/).pop());
  const source = join(root, "set");
  fakeSet(source, media);
  const use = (extra = {}) => useSet({ source, date: "2026-11-03", root, today: TODAY, probe, tracked: [], ...extra });
  const json = () => readFileSync(join(root, "src/data/media.json"), "utf8");
  return { root, media, source, sizes, probe, use, json, done: () => rmSync(root, { recursive: true, force: true }) };
}

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

for (const [what, spoil, expected] of [
  ["a missing file", (s) => rmSync(join(s.source, "detail-mobile.en.webm")), /detail-mobile\.en\.webm: missing/],
  ["four chapters", (s) => { const c = chapters(); c.en.pop(); writeFileSync(join(s.source, "tour.chapters.json"), JSON.stringify(c)); }, /en: 4 chapters, not 5/],
  ["no chapter file", (s) => rmSync(join(s.source, "tour.chapters.json")), /tour\.chapters\.json: missing/],
  ["a file over its budget", (s) => truncateSync(join(s.source, "hero-mobile.cs.mp4"), 900000), /hero-mobile\.cs\.mp4: 0\.90 MB is over its budget of 0\.8 MB/],
  ["other pixels than media.json", (s) => s.sizes.set("rano.cs.webm", { width: 1440, height: 900 }), /rano\.cs\.webm: 1440×900, media\.json says 1280×800/],
  ["a subtitle file that is none", (s) => writeFileSync(join(s.source, "tour.en.vtt"), "nope"), /tour\.en\.vtt: not a WebVTT file/],
]) {
  test(`media:use refuses ${what} and changes nothing`, () => {
    const s = sandbox();
    try {
      spoil(s);
      const before = s.json();
      const { problems, version } = s.use();
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
