#!/usr/bin/env node
/**
 * Puts a set of clips on the site in one step, without touching any code:
 *
 *   npm run media:use -- ~/Documents/tr-web-media/public/video --date 2026-11-03
 *
 * First everything is checked and nothing changes on a failure: all files media.json
 * names for both languages, their sizes in pixels (ffprobe) and their budgets, the
 * tour's five chapters, the date. Then the files are copied to public/video, and
 * media.json gets the three things that go with a set of clips: clip_date, the tour's
 * chapter times and a version for the addresses. V6 keeps its own date (clips.ats.clip_date):
 * it is not retaken with the rest. Finally the site is rebuilt and checked for release.
 *
 * While the clips are not in git (a working set on a branch that must not be merged),
 * public/video/.gitignore keeps them out of every commit: it ignores itself as well,
 * lives only in this worktree, and git still sees the tracked files next to it.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, copyFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { videoBudget } from "./check-site.mjs";

const REPO = fileURLToPath(new URL("..", import.meta.url));
const LANGS = ["cs", "en"];
const CHAPTER_IDS = ["rano", "detail", "komu-zavolat", "kandidat", "ats"];
const COPIED = /\.(mp4|webm|webp|jpg|vtt|json)$/;

/** Every file media.json names, one row per language: { name, width?, height? } (a size only for videos). */
export function expectedFiles(media) {
  const rows = new Map();
  const add = (path, size) => {
    for (const lang of LANGS) {
      const name = path.replace("{lang}", lang).replace(/^\/video\//, "");
      rows.set(name, { name, ...size });
    }
  };
  for (const clip of Object.values(media.clips)) {
    for (const cut of [clip, clip.mobile && { ...clip, ...clip.mobile }]) {
      if (!cut) continue;
      add(cut.poster);
      for (const s of cut.sources) add(s.src, { width: cut.width, height: cut.height });
    }
    for (const track of clip.tracks || []) add(track.src);
  }
  return [...rows.values()];
}

/** What is wrong with tour.chapters.json; an empty list when it is fine. */
export function chapterProblems(chapters) {
  const problems = [];
  for (const lang of LANGS) {
    const list = chapters[lang];
    if (!Array.isArray(list) || list.length !== CHAPTER_IDS.length) {
      problems.push(`${lang}: ${Array.isArray(list) ? list.length : "no"} chapters, not ${CHAPTER_IDS.length}`);
      continue;
    }
    if (list.map((c) => c.id).join() !== CHAPTER_IDS.join()) problems.push(`${lang}: chapters are ${list.map((c) => c.id).join(", ")}, not ${CHAPTER_IDS.join(", ")}`);
    if (list[0].start !== 0) problems.push(`${lang}: the first chapter starts at ${list[0].start}, not 0`);
    list.forEach((c, i) => {
      if (!Number.isFinite(c.start) || (i > 0 && c.start <= list[i - 1].start)) problems.push(`${lang}: chapter ${c.id} starts at ${c.start}, not after the one before`);
    });
    const duration = chapters[`${lang}_duration`];
    if (!Number.isFinite(duration) || list[list.length - 1].start >= duration) problems.push(`${lang}: the last chapter starts past the video (${duration})`);
  }
  return problems;
}

/** What is wrong with a recording date; null when it is a real day that is not in the future. */
export function dateProblem(date, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return `--date ${date}: expected YYYY-MM-DD`;
  const [y, m, d] = date.split("-").map(Number);
  const day = new Date(y, m - 1, d);
  if (day.getFullYear() !== y || day.getMonth() !== m - 1 || day.getDate() !== d) return `--date ${date}: no such day`;
  if (day > today) return `--date ${date}: in the future`;
  return null;
}

/** width × height of a video by ffprobe (the tool the clips were made with; not an npm dependency). */
export function ffprobeSize(path) {
  const out = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", path], { encoding: "utf8", timeout: 60000 });
  const [width, height] = out.trim().split(",").map(Number);
  return { width, height };
}

/** Everything wrong with a set of clips against media.json; an empty list when it can be used. */
export function setProblems(source, media, { probe = ffprobeSize } = {}) {
  const problems = [];
  for (const file of expectedFiles(media)) {
    const path = join(source, file.name);
    if (!existsSync(path)) {
      problems.push(`${file.name}: missing`);
      continue;
    }
    const budget = videoBudget(file.name);
    const size = statSync(path).size;
    if (budget && size > budget) problems.push(`${file.name}: ${(size / 1e6).toFixed(2)} MB is over its budget of ${budget / 1e6} MB`);
    if (file.name.endsWith(".vtt") && !readFileSync(path, "utf8").startsWith("WEBVTT")) problems.push(`${file.name}: not a WebVTT file`);
    if (file.width) {
      let got;
      try {
        got = probe(path);
      } catch (err) {
        problems.push(`${file.name}: ffprobe failed (${String(err.message).split("\n")[0]})`);
        continue;
      }
      if (got.width !== file.width || got.height !== file.height) problems.push(`${file.name}: ${got.width}×${got.height}, media.json says ${file.width}×${file.height}`);
    }
  }
  const chaptersPath = join(source, "tour.chapters.json");
  if (!existsSync(chaptersPath)) problems.push("tour.chapters.json: missing");
  else {
    try {
      problems.push(...chapterProblems(JSON.parse(readFileSync(chaptersPath, "utf8"))).map((p) => `tour.chapters.json: ${p}`));
    } catch (err) {
      problems.push(`tour.chapters.json: ${err.message}`);
    }
  }
  return problems;
}

/** A short hash of the set: a new cut of any file is a new address for all of them. */
export function setVersion(source, media) {
  const hash = createHash("sha256");
  for (const name of expectedFiles(media).map((f) => f.name).sort()) hash.update(name).update(readFileSync(join(source, name)));
  return hash.digest("hex").slice(0, 10);
}

/** Files of public/video that git tracks, other than the placeholder (null outside a repository). */
function trackedClips(root) {
  try {
    const out = execFileSync("git", ["ls-files", "--", "public/video"], { cwd: root, encoding: "utf8", timeout: 30000, stdio: ["ignore", "pipe", "ignore"] });
    return out.split("\n").filter((f) => COPIED.test(f) && !f.includes("ukazka-v0"));
  } catch {
    return null;
  }
}

/**
 * Checks the set and, when it is fine, puts it in place under root. Returns
 * { problems } with nothing changed, or { problems: [], version, note }.
 */
export function useSet({ source, date, root = REPO, today, probe, tracked = trackedClips(root) }) {
  const mediaPath = join(root, "src/data/media.json");
  const media = JSON.parse(readFileSync(mediaPath, "utf8"));
  const from = resolve(source);
  const video = join(root, "public/video");
  const problems = [];
  const bad = dateProblem(date, today);
  if (bad) problems.push(bad);
  if (!existsSync(from) || !statSync(from).isDirectory()) problems.push(`${source}: not a folder`);
  else problems.push(...setProblems(from, media, { probe }));
  if (problems.length) return { problems };

  const chapters = JSON.parse(readFileSync(join(from, "tour.chapters.json"), "utf8"));
  const version = setVersion(from, media);

  // into a folder beside the files first: a copy that fails half way changes nothing
  if (from !== resolve(video)) {
    const incoming = join(video, ".incoming");
    rmSync(incoming, { recursive: true, force: true });
    mkdirSync(incoming, { recursive: true });
    try {
      const names = readdirSync(from).filter((n) => COPIED.test(n) && statSync(join(from, n)).isFile());
      for (const name of names) copyFileSync(join(from, name), join(incoming, name));
      for (const name of names) renameSync(join(incoming, name), join(video, name));
    } finally {
      rmSync(incoming, { recursive: true, force: true });
    }
  }

  const marker = join(video, ".gitignore");
  let note = "the clips are kept out of git by public/video/.gitignore";
  if (tracked && tracked.length) {
    rmSync(marker, { force: true });
    note = "the clips are tracked by git: no public/video/.gitignore";
  } else {
    writeFileSync(marker, "# Local to this worktree: a working set of clips is never committed from here (tools/media-use.mjs)\n*\n");
  }

  media.clip_date = date;
  media.version = version;
  media.clips.tour.chapters = Object.fromEntries(LANGS.map((lang) => [lang, chapters[lang].map((c) => ({ id: c.id, start: c.start }))]));
  const tmp = `${mediaPath}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(media, null, 2)}\n`);
  renameSync(tmp, mediaPath);
  return { problems: [], version, note };
}

function main(argv) {
  const dateAt = argv.indexOf("--date");
  const date = dateAt >= 0 ? argv[dateAt + 1] : undefined;
  const source = argv.find((a, i) => !a.startsWith("--") && i !== dateAt + 1);
  if (!source || !date) {
    console.error("usage: npm run media:use -- <folder with the clips> --date YYYY-MM-DD");
    return 2;
  }
  const { problems, version, note } = useSet({ source, date });
  if (problems.length) {
    for (const p of problems) console.error(`error: ${p}`);
    console.error(`${problems.length} problems, nothing changed`);
    return 1;
  }
  console.log(`clips in place: clip_date ${date}, version ${version}; ${note}`);
  const node = process.execPath;
  const run = (args) => execFileSync(node, args, { cwd: REPO, stdio: "inherit" });
  try {
    run(["build.mjs"]);
    run(["build.mjs", "--check"]);
    run(["tools/check-site.mjs", "--release"]);
  } catch {
    console.error("the clips are in place, but the build or the release check failed (see above)");
    return 1;
  }
  const git = (args) => execFileSync("git", args, { cwd: REPO, encoding: "utf8", timeout: 30000 });
  const status = git(["status", "--short", "--", "public/video", "src/data/media.json"]);
  console.log(status || "git status: no change in public/video or media.json");
  const staged = git(["diff", "--cached", "--name-only", "--diff-filter=AM", "--", "public/video"]).trim();
  if (staged) {
    console.error(`error: clips staged for a commit:\n${staged}`);
    return 1;
  }
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exit(main(process.argv.slice(2)));
}
