#!/usr/bin/env node
/**
 * Puts a set of clips on the site in one step, without touching any code:
 *
 *   npm run media:use -- ~/Documents/tr-web-media/public/video --date 2026-11-03
 *   npm run media:use -- --recover     (only undoes a run that was interrupted)
 *   npm run media:use -- --force-recover     (the same when --recover refuses, see below)
 *
 * It is one transaction, and one run at a time: a lock comes first. Then the set is checked:
 * all files media.json names for both languages, the sizes in pixels of videos and posters and
 * the lengths (ffprobe), the budgets, the tour's five chapters, the date. Then public/, media.json
 * and what the build writes are copied to .media-use/ (outside public/, so nothing of it can be
 * published), the files go in place,
 * media.json gets the three things that go with a set of clips (clip_date, the tour's chapter
 * times, a version for the addresses), the site is rebuilt and checked for release. When
 * anything fails, all of it goes back to what it was, byte for byte. A process that is killed
 * leaves .media-use/ behind: the next run undoes it first, and check:release fails until then.
 * Undoing refuses while the run's process is alive, and when commits were made after the copy was
 * taken, because it would overwrite them; --force-recover goes ahead all the same.
 * V6 keeps its own date (clips.ats.clip_date): it is not retaken with the rest.
 *
 * Only the files media.json names and tour.chapters.json are copied. Anything else in the
 * folder, or already in public/video, is left where it is and listed as a warning.
 *
 * While the clips are not in git (a working set on a branch that must not be merged),
 * public/video/.gitignore keeps them out of every commit: it ignores itself as well,
 * lives only in this worktree, and git still sees the tracked files next to it.
 */

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, rmdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { MEDIA_WORK, clipBytes, expectedFiles, mediaUseOwner, setVersion, videoBudget } from "./check-site.mjs";

export { expectedFiles, setVersion };

const REPO = fileURLToPath(new URL("..", import.meta.url));
const LANGS = ["cs", "en"];
const CHAPTER_IDS = ["rano", "detail", "komu-zavolat", "kandidat", "ats"];
const CLIP_FILE = /\.(mp4|webm|webp|jpg|vtt|json)$/;
const CHAPTER_FILE = "tour.chapters.json";
/** Besides public/: what a build writes outside it, and media.json. */
const ROOT_FILES = ["src/data/media.json", "build-manifest.json", "worker-routes.gen.js"];
/**
 * How far tour.chapters.json's length may be from the real one, in seconds. It is rounded up by
 * the recording script: 0.01-0.02 s on the clips of 1. 11. 2026. Half a second is well above
 * that and well below any cut that would put a chapter somewhere else.
 */
export const LENGTH_TOLERANCE = 0.5;
/** A poster smaller than this is no picture of the app: one flat colour is 1.2-2.4 kB, the smallest real poster 28 kB (1. 11. 2026). */
export const POSTER_MIN_BYTES = 5000;

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

/** What is wrong with the chapters against the tour's real lengths ({ "tour.cs.mp4": seconds, … }); an empty list when they fit. */
export function lengthProblems(chapters, lengths) {
  const problems = [];
  for (const lang of LANGS) {
    const declared = chapters[`${lang}_duration`];
    const own = Object.entries(lengths).filter(([name]) => name.startsWith(`tour.${lang}.`));
    for (const [name, seconds] of own) {
      if (!Number.isFinite(seconds)) problems.push(`${name}: ffprobe gives no length`);
      else if (Math.abs(declared - seconds) > LENGTH_TOLERANCE) problems.push(`${lang}_duration is ${declared} s, ${name} is ${seconds.toFixed(2)} s long (tolerance ${LENGTH_TOLERANCE} s)`);
    }
    const real = own.map(([, seconds]) => seconds).filter(Number.isFinite);
    if (!real.length || !Array.isArray(chapters[lang])) continue;
    const shortest = Math.min(...real);
    for (const c of chapters[lang]) if (c.start >= shortest) problems.push(`${lang}: chapter ${c.id} starts at ${c.start} s, the video is ${shortest.toFixed(2)} s long`);
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

/** width × height of a video or a poster and the length of a video by ffprobe (the tool the clips were made with; not an npm dependency). */
export function ffprobeInfo(path) {
  const out = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", path], { encoding: "utf8", timeout: 60000 });
  const { streams, format } = JSON.parse(out);
  return { width: streams[0].width, height: streams[0].height, duration: Number(format.duration) };
}

/** Everything wrong with a set of clips against media.json; an empty list when it can be used. */
export function setProblems(source, media, { probe = ffprobeInfo } = {}) {
  const problems = [];
  const lengths = {};
  for (const file of expectedFiles(media)) {
    const path = join(source, file.name);
    if (!existsSync(path)) {
      problems.push(`${file.name}: missing`);
      continue;
    }
    const budget = videoBudget(file.name);
    const size = statSync(path).size;
    if (size === 0) {
      problems.push(`${file.name}: empty (0 B)`);
      continue;
    }
    if (file.name.endsWith(".webp") && size < POSTER_MIN_BYTES) problems.push(`${file.name}: ${size} B is too small for a poster (at least ${POSTER_MIN_BYTES} B)`);
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
      if (/^tour\..*\.(mp4|webm)$/.test(file.name)) lengths[file.name] = got.duration;
    }
  }
  const chaptersPath = join(source, CHAPTER_FILE);
  if (!existsSync(chaptersPath)) problems.push(`${CHAPTER_FILE}: missing`);
  else {
    try {
      const chapters = JSON.parse(readFileSync(chaptersPath, "utf8"));
      problems.push(...chapterProblems(chapters).map((p) => `${CHAPTER_FILE}: ${p}`));
      problems.push(...lengthProblems(chapters, lengths).map((p) => `${CHAPTER_FILE}: ${p}`));
    } catch (err) {
      problems.push(`${CHAPTER_FILE}: ${err.message}`);
    }
  }
  return problems;
}

/** Files of public/video in the last commit, other than the placeholder (null outside a repository). */
function trackedClips(root) {
  try {
    const out = execFileSync("git", ["ls-tree", "-r", "--name-only", "HEAD", "--", "public/video"], { cwd: root, encoding: "utf8", timeout: 30000, stdio: ["ignore", "pipe", "ignore"] });
    return out.split("\n").filter((f) => CLIP_FILE.test(f) && !f.includes("ukazka-v0"));
  } catch {
    return null;
  }
}

/** Clips staged for a commit. Once the last commit has clips (after the merge), staging a new set is legitimate. */
function stagedClips(root, tracked) {
  if (tracked && tracked.length) return [];
  try {
    const out = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=AM", "--", "public/video"], { cwd: root, encoding: "utf8", timeout: 30000, stdio: ["ignore", "pipe", "ignore"] });
    return out.split("\n").filter((f) => CLIP_FILE.test(f));
  } catch {
    return [];
  }
}

// ── The transaction ─────────────────────────────────────────────────────────
//
// .media-use/ while a run goes:
//   pid             the lock, created exclusively before anything else: the process that holds it
//   backup.tmp/     the copy being made; nothing has changed yet
//   backup/         the whole copy with its before.json (the files that existed, and HEAD):
//                   from here on, an interrupted run must be undone
//   incoming/       the new files, before they go in place
//   media.json.tmp  the new media.json, before it goes in place
//   done/           the run succeeded or was undone (backup/ renamed in one step); only to be deleted

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const firstLine = (message) => String(message).split("\n")[0];
const running = (owner) => `another media:use is running (process ${owner}): wait for it. If that process is something else (process numbers get reused), run npm run media:use -- --force-recover`;

/** A rename that waits for a moment when Windows holds the file (an antivirus, a server reading it). */
function move(from, to) {
  for (let attempt = 0; ; attempt++) {
    try {
      renameSync(from, to);
      return;
    } catch (err) {
      if (attempt >= 20 || !["EPERM", "EBUSY", "EACCES"].includes(err.code)) throw err;
      sleep(250);
    }
  }
}

const removeAll = (path) => rmSync(path, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });

/** Files a run may change, relative to root with forward slashes: everything under public/ and ROOT_FILES. */
function liveFiles(root) {
  const out = ROOT_FILES.filter((f) => existsSync(join(root, f)));
  const walk = (dir) => {
    for (const name of readdirSync(join(root, dir))) {
      const rel = `${dir}/${name}`;
      if (statSync(join(root, rel)).isDirectory()) walk(rel);
      else out.push(rel);
    }
  };
  if (existsSync(join(root, "public"))) walk("public");
  return out;
}

/** Folders under public/ that are empty once files are gone (a build that made a new one); public/video always stays. */
function removeEmptyFolders(root, dir = "public") {
  for (const name of readdirSync(join(root, dir))) {
    const rel = `${dir}/${name}`;
    if (!statSync(join(root, rel)).isDirectory()) continue;
    removeEmptyFolders(root, rel);
    if (rel !== "public/video" && !readdirSync(join(root, rel)).length) rmdirSync(join(root, rel));
  }
}

/** The commit the worktree is at; null outside a repository. */
function gitHead(root) {
  try {
    return execFileSync("git", ["rev-parse", "--verify", "-q", "HEAD"], { cwd: root, encoding: "utf8", timeout: 30000, stdio: ["ignore", "pipe", "ignore"] }).trim() || null;
  } catch {
    return null;
  }
}

/**
 * Takes the lock: only one process can create the file (flag wx). A lock whose process is gone
 * is moved aside first, and only one process can do that, so two runs never both replace it.
 * Returns null when this process has it, or the process number that does.
 */
function takeLock(root, { force = false } = {}) {
  const work = join(root, MEDIA_WORK);
  const path = join(work, "pid");
  for (let attempt = 0; attempt < 40; attempt++) {
    mkdirSync(work, { recursive: true });
    try {
      writeFileSync(path, String(process.pid), { flag: "wx" });
      return null;
    } catch (err) {
      if (err.code === "ENOENT" || err.code === "EPERM" || err.code === "EACCES") {
        sleep(25); // the owner has just removed it, or the folder
        continue;
      }
      if (err.code !== "EEXIST") throw err;
    }
    const owner = mediaUseOwner(root);
    if (owner && !force) return owner;
    let held = "";
    try {
      held = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    if (!held && attempt < 20) {
      sleep(25); // created by another process a moment ago, its number is on the way
      continue;
    }
    const aside = `${path}.${process.pid}`;
    try {
      renameSync(path, aside);
    } catch {
      sleep(25);
      continue;
    }
    // what was moved is not what was looked at: another process took the lock in between, it stays
    if (readFileSync(aside, "utf8") !== held) {
      renameSync(aside, path);
      continue;
    }
    rmSync(aside, { force: true });
  }
  throw new Error(`could not take the lock ${MEDIA_WORK}/pid`);
}

/** Gives the lock up, when it is still this process's; the folder goes with it unless something is left to undo. */
function releaseLock(root) {
  const work = join(root, MEDIA_WORK);
  const path = join(work, "pid");
  try {
    if (readFileSync(path, "utf8") === String(process.pid)) rmSync(path, { force: true, maxRetries: 10, retryDelay: 200 });
    rmdirSync(work);
  } catch {
    // no lock any more, or a backup next to it: both stay as they are
  }
}

/** Empties the work folder except for the lock. */
function clearWork(work) {
  if (!existsSync(work)) return;
  for (const name of readdirSync(work)) if (name !== "pid") removeAll(join(work, name));
}

/** What the backup says, or an error that tells what to do: a state this tool cannot go back from on its own. */
function readBefore(work) {
  try {
    return JSON.parse(readFileSync(join(work, "backup", "before.json"), "utf8"));
  } catch {
    throw new Error(`${MEDIA_WORK}/backup has no readable before.json, so it is not known which files belonged to the state before the run. Nothing was changed. Compare ${MEDIA_WORK}/backup with git status, copy back what you need, then delete ${MEDIA_WORK}/`);
  }
}

/**
 * Undoes what the work folder says. Safe to repeat: what has gone back is no longer in backup/, and
 * what the run added is removed again. Refuses a copy older than the last commit: it would overwrite
 * what was committed since (force: go back all the same). Returns true when it put files back.
 */
function undoRun(root, { force = false, step = () => {} } = {}) {
  const work = join(root, MEDIA_WORK);
  const backup = join(work, "backup");
  const undo = existsSync(backup);
  if (undo) {
    const { head, files } = readBefore(work);
    const now = gitHead(root);
    if (head !== now && !force) {
      throw new Error(`the copy in ${MEDIA_WORK}/ was taken at commit ${head ? head.slice(0, 7) : "(none)"}, this worktree is at ${now ? now.slice(0, 7) : "(none)"}: going back would overwrite what was committed since. Nothing was changed. To keep the files as they are, delete ${MEDIA_WORK}/. To go back to the copy all the same, run npm run media:use -- --force-recover`);
    }
    const keep = new Set(files);
    for (const rel of liveFiles(root)) if (!keep.has(rel)) rmSync(join(root, rel), { force: true, maxRetries: 10, retryDelay: 200 });
    for (const rel of files) {
      const saved = join(backup, rel);
      if (!existsSync(saved)) continue;
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      move(saved, join(root, rel));
      step(rel);
    }
    removeEmptyFolders(root);
    // one rename: killed while deleting, there is no half a backup to undo from
    move(backup, join(work, "done"));
  }
  removeAll(join(root, "public/video/.incoming")); // the place older versions of this tool used
  rmSync(join(root, "src/data/media.json.tmp"), { force: true }); // and this one
  clearWork(work);
  return undo;
}

/**
 * Undoes a run that did not finish (--recover). Throws, with what to do, while its process still
 * runs and when the copy is older than the last commit; force goes ahead in both cases
 * (--force-recover). Returns true when something had to be put back.
 * The step is called after each file put back (tests).
 */
export function recoverInterrupted(root = REPO, { force = false, step } = {}) {
  if (!existsSync(join(root, MEDIA_WORK))) {
    removeAll(join(root, "public/video/.incoming"));
    return false;
  }
  const owner = takeLock(root, { force });
  if (owner) throw new Error(running(owner));
  try {
    return undoRun(root, { force, step });
  } finally {
    releaseLock(root);
  }
}

/** Copies what a run may change. Only the last rename makes it count: killed before that, nothing has changed. */
function takeBackup(root, step) {
  const work = join(root, MEDIA_WORK);
  const tmp = join(work, "backup.tmp");
  const files = liveFiles(root);
  for (const rel of files) {
    mkdirSync(dirname(join(tmp, rel)), { recursive: true });
    copyFileSync(join(root, rel), join(tmp, rel));
  }
  step("backup copied");
  writeFileSync(join(tmp, "before.json"), JSON.stringify({ head: gitHead(root), files }));
  move(tmp, join(work, "backup"));
}

/** Puts the checked set in place. Text files get LF, so one version means the same bytes on every machine. */
function placeSet({ from, root, media, version, step }) {
  const video = join(root, "public/video");
  const incoming = join(root, MEDIA_WORK, "incoming");
  mkdirSync(incoming, { recursive: true });
  const names = [...expectedFiles(media).map((f) => f.name), CHAPTER_FILE];
  for (const name of names) {
    if (/\.(vtt|json)$/.test(name)) writeFileSync(join(incoming, name), clipBytes(join(from, name)));
    else copyFileSync(join(from, name), join(incoming, name));
  }
  if (setVersion(incoming, media) !== version) throw new Error("the copy of the set differs from the set");
  step("copied");
  mkdirSync(video, { recursive: true });
  names.forEach((name, i) => {
    move(join(incoming, name), join(video, name));
    if (i === 0) step("first file in place");
  });
  step("all files in place");
}

/** The build and the release check on root, as a step of a run: it throws when they fail. */
export function releaseCheck(root = REPO, stdio = "inherit") {
  return () => {
    const run = (args) => execFileSync(process.execPath, args, { cwd: root, stdio });
    run(["build.mjs"]);
    run(["build.mjs", "--check"]);
    run(["tools/check-site.mjs", "--release", "--during-media-use"]);
  };
}

/** Files that are not part of the set, in its folder and in public/video: not copied, not removed, not in the version. */
function foreignFiles(from, video, media) {
  const known = new Set([...expectedFiles(media).map((f) => f.name), CHAPTER_FILE, ".gitignore", ".gitkeep"]);
  const foreign = (dir) => (existsSync(dir) ? readdirSync(dir).filter((n) => !known.has(n) && !n.includes("ukazka-v0") && statSync(join(dir, n)).isFile()) : []);
  const warnings = [];
  const inSource = foreign(from);
  const inVideo = foreign(video);
  if (inSource.length) warnings.push(`not part of the set, not copied: ${inSource.join(", ")}`);
  if (inVideo.length) warnings.push(`in public/video but not part of the set, left there (and published): ${inVideo.join(", ")}`);
  return warnings;
}

/**
 * Takes the lock, checks the set and, when it is fine, puts it in place under root and runs verify.
 * Returns { problems, recovered } with nothing changed, or { problems: [], version, note, warnings, recovered }.
 * undone is false when a failed run could not put everything back. verify throws when the result
 * must not stay. step is called between the stages (tests).
 */
export function useSet({ source, date, root = REPO, today, probe, tracked = trackedClips(root), staged = stagedClips(root, tracked), verify = () => {}, step = () => {} }) {
  const owner = takeLock(root);
  if (owner) return { problems: [running(owner)], recovered: false };
  step("lock");
  let recovered;
  try {
    recovered = undoRun(root);
  } catch (err) {
    releaseLock(root);
    return { problems: [err.message], recovered: false };
  }

  const mediaPath = join(root, "src/data/media.json");
  const video = join(root, "public/video");
  const work = join(root, MEDIA_WORK);
  let media, from, chapters, version, warnings;
  try {
    media = JSON.parse(readFileSync(mediaPath, "utf8"));
    from = resolve(source);
    const problems = [];
    const bad = dateProblem(date, today);
    if (bad) problems.push(bad);
    if (!existsSync(from) || !statSync(from).isDirectory()) problems.push(`${source}: not a folder`);
    else problems.push(...setProblems(from, media, { probe }));
    if (staged.length) problems.push(`clips staged for a commit: ${staged.join(", ")}`);
    if (problems.length) {
      releaseLock(root);
      return { problems, recovered };
    }
    chapters = JSON.parse(readFileSync(join(from, CHAPTER_FILE), "utf8"));
    version = setVersion(from, media);
    warnings = foreignFiles(from, video, media);
  } catch (err) {
    releaseLock(root);
    return { problems: [firstLine(err.message)], recovered };
  }

  const backup = join(work, "backup");
  let backedUp = false;
  let note;
  try {
    takeBackup(root, step);
    backedUp = true;
    step("backup");
    placeSet({ from, root, media, version, step });

    const marker = join(video, ".gitignore");
    note = "the clips are kept out of git by public/video/.gitignore";
    if (tracked && tracked.length) {
      rmSync(marker, { force: true });
      note = "the clips are tracked by git: no public/video/.gitignore";
    } else {
      writeFileSync(marker, "# Local to this worktree: a working set of clips is never committed from here (tools/media-use.mjs)\n*\n");
    }

    media.clip_date = date;
    media.version = version;
    media.clips.tour.chapters = Object.fromEntries(LANGS.map((lang) => [lang, chapters[lang].map((c) => ({ id: c.id, start: c.start }))]));
    const tmp = join(work, "media.json.tmp");
    writeFileSync(tmp, `${JSON.stringify(media, null, 2)}\n`);
    step("media.json written");
    move(tmp, mediaPath);
    step("media.json");
    verify();
  } catch (err) {
    const why = firstLine(err.message);
    let back;
    try {
      back = undoRun(root);
    } catch (undo) {
      releaseLock(root);
      return { problems: [why, `could not put everything back (${firstLine(undo.message)}): the copy is in ${MEDIA_WORK}/, run npm run media:use -- --recover`], recovered, undone: false };
    }
    releaseLock(root);
    if (backedUp && !back) return { problems: [why, `the copy of the state before this run is gone (--force-recover from another process?), so nothing was put back: see what npm run check:release says`], recovered, undone: false };
    return { problems: [why], recovered, undone: true };
  }
  // one rename: from here on nothing is undone, whatever happens to the deleting
  try {
    move(backup, join(work, "done"));
  } catch (err) {
    releaseLock(root);
    if (!existsSync(backup)) return { problems: [`the copy of the state before this run is gone (--force-recover from another process?), so this run is not what is in place: see what npm run check:release says`], recovered, undone: false };
    return { problems: [`the new set is in place, but the run could not be finished (${firstLine(err.message)}): run npm run media:use -- --recover to go back`], recovered, undone: false };
  }
  try {
    clearWork(work);
    releaseLock(root);
  } catch (err) {
    warnings.push(`the set is in place, but ${MEDIA_WORK}/ could not be deleted (${firstLine(err.message)}): run npm run media:use -- --recover`);
  }
  return { problems: [], version, note, warnings, recovered };
}

function main(argv) {
  const force = argv.includes("--force-recover");
  if (force || argv.includes("--recover")) {
    try {
      console.log(recoverInterrupted(REPO, { force }) ? "the interrupted run was undone: everything is as it was before it" : "nothing to undo");
      return 0;
    } catch (err) {
      console.error(`error: ${err.message}`);
      return 1;
    }
  }
  const dateAt = argv.indexOf("--date");
  const date = dateAt >= 0 ? argv[dateAt + 1] : undefined;
  const source = argv.find((a, i) => !a.startsWith("--") && i !== dateAt + 1);
  if (!source || !date) {
    console.error("usage: npm run media:use -- <folder with the clips> --date YYYY-MM-DD");
    return 2;
  }
  const { problems, version, note, warnings, recovered, undone } = useSet({ source, date, verify: releaseCheck() });
  if (recovered) console.log("an interrupted run was undone first");
  if (problems.length) {
    for (const p of problems) console.error(`error: ${p}`);
    console.error(undone === false ? `${problems.length} problems, NOT everything was put back` : `${problems.length} problems, nothing changed`);
    return 1;
  }
  for (const w of warnings) console.warn(`warning: ${w}`);
  console.log(`clips in place: clip_date ${date}, version ${version}; ${note}`);
  try {
    const status = execFileSync("git", ["status", "--short", "--", "public/video", "src/data/media.json"], { cwd: REPO, encoding: "utf8", timeout: 30000 });
    console.log(status || "git status: no change in public/video or media.json");
  } catch {
    console.log("git status: not available");
  }
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exit(main(process.argv.slice(2)));
}
