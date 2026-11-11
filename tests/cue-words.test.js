// The line under a loop read along with the clip, word by word (Kryštof, 11. 11. 2026): the pace of the
// words and where the clip is in its line (js/media.js), the script and the styles that show it, and that
// the HTML without the script is the sentence as it was. Run with `npm test`.

import { test } from "node:test";
import assert from "node:assert/strict";

import { buildSite, loadSite, nbspCs } from "../build.mjs";
import { clipIn } from "../tools/check-site.mjs";
import { READ_MAX, READ_MIN, READ_SHARE, cueSpan, cueTime, wordAt, wordPace, wordSchedule } from "../src/js/media.js";

const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg || ""} ${a} != ${b}`);
/** The words of a line as site.js splitWords makes them: at plain spaces, a no-break space keeps two words in one. */
const wordsOf = (text) => text.trim().split(/[ \t\r\n]+/);

test("wordPace: a short word quicker, a long one slower, between READ_MIN and READ_MAX; punctuation does not count", () => {
  assert.equal(READ_MIN, 0.28);
  assert.equal(READ_MAX, 0.4);
  near(wordPace("a"), READ_MIN);
  near(wordPace("Co"), READ_MIN);
  near(wordPace("specializujete."), READ_MAX);
  near(wordPace("Každé"), wordPace("Každé,"), "a comma is no letter");
  assert.ok(wordPace("ráno") < wordPace("otevřené") && wordPace("otevřené") < READ_MAX);
  // "S odkazem" (build.mjs nbspCs) is one span, and it takes as long as its letters
  near(wordPace("S odkazem"), wordPace("Sodkazem"));
  near(wordPace("45"), READ_MIN, "digits are read too");
});

test("wordSchedule: the first word at once, each next after the one before, at its own pace while there is time", () => {
  const words = ["Každé", "ráno,", "co", "přibylo."];
  const plain = wordSchedule(words, Infinity);
  assert.equal(plain.starts[0], 0);
  near(plain.starts[1], wordPace("Každé"));
  near(plain.starts[3], wordPace("Každé") + wordPace("ráno,") + wordPace("co"));
  near(plain.end, words.reduce((a, w) => a + wordPace(w), 0));
  assert.deepEqual(wordSchedule(words, 10), plain, "plenty of time: the plain pace");
  // short of time: all of it read by READ_SHARE of the line's time, in the same proportions
  const tight = wordSchedule(words, 1.5);
  near(tight.end, READ_SHARE * 1.5);
  near(tight.starts[2] / tight.end, plain.starts[2] / plain.end);
  assert.deepEqual(wordSchedule([], 2), { starts: [], end: 0 });
});

test("wordAt: the word being read, the first one from the line's start, words.length once read (the accent goes)", () => {
  const s = wordSchedule(["Proč", "se", "ozvat."], Infinity);
  assert.equal(wordAt(s, 0), 0);
  assert.equal(wordAt(s, -0.2), 0, "a moment before its time: the first word");
  assert.equal(wordAt(s, s.starts[1] - 0.001), 0);
  assert.equal(wordAt(s, s.starts[1]), 1);
  assert.equal(wordAt(s, s.starts[2] + 0.01), 2);
  assert.equal(wordAt(s, s.end), 3);
  assert.equal(wordAt(s, 60), 3);
  assert.equal(wordAt(wordSchedule([], 2), 0), 0, "nothing to read: read");
});

test("cueSpan: the time into the line and the line's time on screen, to the next line or the end of the clip", () => {
  const times = [0, 4.2, 8.6];
  assert.deepEqual(cueSpan(times, 1, 12, false, false), { elapsed: 1, span: 4.2 });
  assert.deepEqual(cueSpan(times, 5, 12, false, false), { elapsed: 5 - 4.2, span: 8.6 - 4.2 });
  near(cueSpan(times, 9, 12, false, false).span, 12 - 8.6);
  assert.equal(cueSpan(times, 9, NaN, false, false).span, Infinity, "the clip's length not known yet: the plain pace");
  assert.deepEqual(cueSpan([2, 5], 1, 8, false, false), { elapsed: 0, span: 3 }, "before the first line's time: its start");
});

test("cueSpan over the seam of a loop: a last line that says what the first does is read once across the end", () => {
  // the hero: Každé ráno at 0, three more, Každé ráno again at 10.3, the clip 13 s long
  const times = [0, 2.1, 4.6, 10.3];
  const across = 13 - 10.3 + 2.1;
  const atEnd = cueSpan(times, 11, 13, true, false);
  near(atEnd.elapsed, 0.7);
  near(atEnd.span, across);
  // round again: 0.5 s into the clip is 3.2 s into that line, read on, not started again
  const after = cueSpan(times, 0.5, 13, true, true);
  near(after.elapsed, 13 - 10.3 + 0.5);
  near(after.span, across);
  // the first run of the clip: the line starts at 0, it has only up to the next line
  assert.deepEqual(cueSpan(times, 0.5, 13, true, false), { elapsed: 0.5, span: 2.1 });
  // its middle lines are as without the seam
  assert.deepEqual(cueSpan(times, 5, 13, true, true), cueSpan(times, 5, 13, false, false));
  // the length not known: no seam to read across
  assert.equal(cueSpan(times, 11, NaN, true, false).span, Infinity);
});

test("cueTime: the phone cut's own time, \"none\" where the cut does not have the line", () => {
  const line = (at, atMobile) => ({ dataset: { at: String(at), ...(atMobile === undefined ? {} : { atMobile: String(atMobile) }) } });
  assert.equal(cueTime(line(4.2, 5), false), 4.2);
  assert.equal(cueTime(line(4.2, 5), true), 5);
  assert.equal(cueTime(line(4.2), true), 4.2, "no phone time: the clip's");
  assert.ok(Number.isNaN(cueTime(line(8.6, "none"), true)));
  assert.ok(Number.isNaN(cueTime(line("none", 10), false)));
});

test("every line of the real clips, Czech and English, wide and phone cut, is read by 70 % of its time, no word slower than READ_MAX", () => {
  const site = loadSite();
  let checked = 0;
  for (const lang of ["cs", "en"]) {
    for (const [id, raw] of Object.entries(site.media.clips)) {
      const clip = clipIn(raw, lang);
      for (const phoneCut of [false, true]) {
        const cues = (clip.cues || [])
          .map((c) => ({ key: c.key, at: phoneCut && c.at_mobile !== undefined ? c.at_mobile : c.at }))
          .filter((c) => c.at !== null)
          .sort((a, b) => a.at - b.at);
        for (let i = 0; i + 1 < cues.length; i++) {
          const said = site.i18n[lang][cues[i].key];
          const words = wordsOf(lang === "cs" ? nbspCs(said) : said);
          const span = cues[i + 1].at - cues[i].at;
          const s = wordSchedule(words, span);
          assert.ok(s.end <= READ_SHARE * span + 1e-9, `${lang} ${id} ${phoneCut ? "phone" : "wide"} ${cues[i].key}: ${s.end.toFixed(2)} s of ${span} s`);
          for (let w = 1; w < s.starts.length; w++) assert.ok(s.starts[w] - s.starts[w - 1] <= READ_MAX + 1e-9);
          checked++;
        }
      }
    }
  }
  assert.ok(checked > 20, `${checked} lines`);
});

test("the build: the HTML keeps each line as one sentence (no script, reduced motion), the script splits a playing loop's lines", () => {
  const files = buildSite(loadSite());
  for (const path of ["public/index.html", "public/en/index.html"]) {
    const html = String(files.get(path));
    assert.match(html, /<span class="video__cue-line[^"]*" data-cues="hero" data-at="[^"]*"(?: data-at-mobile="[^"]*")?>[^<]+<\/span>/, path);
    assert.doesNotMatch(html, /video__word|is-reading/, `${path}: the words are the script's, never the page's`);
  }
  const js = String(files.get("public/js/site.js"));
  assert.match(js, /import \{[^}]*\bcueSpan\b[^}]*\bwordAt\b[^}]*\bwordSchedule\b[^}]*\} from "\.\/media\.js\?v=[0-9a-f]+"/);
  // the words shown are aria-hidden, a screen reader reads the sentence once from the visually hidden copy
  assert.match(js, /whole\.className = "visually-hidden";\s*whole\.textContent = text;/);
  assert.match(js, /shown\.setAttribute\("aria-hidden", "true"\);/);
  assert.match(js, /text\.split\(\/\[ \\t\\r\\n\]\+\/\)/, "split at plain spaces only, a no-break space keeps its words together");
  // only the loops that play by themselves (never with reduced motion: live leaves them out), and the poster shows the line whole
  assert.match(js, /const live = figures\.filter\(\(fig\) => fig\.querySelector\("\.video__toggle"\) && !stillPref\.matches\);\s*\/\/[^\n]*\n\s*for \(const fig of live\) fig\.querySelectorAll\("\.video__cue-line"\)\.forEach\(splitWords\);/);
  assert.match(js, /if \(stillPref\.matches \|\| \(v\.paused && !v\.currentTime\)\) return markWord\(line, -1\);/);
  // the same time as the line: every frame shown and timeupdate call showCue, which picks the line and then reads it
  assert.match(js, /const showCue = \(fig\) => \{\s*pickCue\(fig\);\s*readCue\(fig\);\s*\};/);
  // the classes change only when the word does
  assert.match(js, /if \(w\.k === k\) return;/);
  const mediaJs = String(files.get("public/js/media.js"));
  assert.match(mediaJs, /export function wordSchedule\(/);
});

test("the styles: colour and opacity only (the line keeps its width and height), the accent a token, none with reduced motion", () => {
  const css = String(loadSite().css);
  const rules = css.match(/\.video__word[^{]*\{[^}]*\}/g) || [];
  assert.ok(rules.length >= 4, rules.join("\n"));
  for (const r of rules) assert.doesNotMatch(r.slice(r.indexOf("{")), /font|weight|letter-spacing|padding|margin|border|width|transform|background/, r);
  assert.match(css, /\.video__cue-line\.is-reading \.video__word \{ opacity: 0\.6; \}/);
  assert.match(css, /\.video__cue-line\.is-reading \.video__word\.is-now \{ opacity: 1; color: var\(--frame-accent\); \}/);
  assert.match(css, /--frame-accent: var\(--c-accent-text\)/, "on the board and on a light band the band's accent text");
  assert.match(css, /--frame-text: #fff; --frame-line: rgba\(255, 255, 255, 0\.34\); --frame-accent: var\(--orange\);/, "the strip over the window");
  assert.match(css, /\.hero__media \.frame \{ --frame-text: var\(--ink\); --frame-line: var\(--steel\); --frame-accent: var\(--orange-ink\); \}/, "the hero's line on the light band on a phone");
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.video__cue-line\.is-reading \.video__word, \.video__cue-line\.is-reading \.video__word\.is-now \{ opacity: 1; color: inherit; transition: none; \}/);
});
