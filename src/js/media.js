/**
 * Which cut of a clip a video element plays. A chapter tab carries its clip as
 * JSON (build: {{media:<id>:json}}): { id, poster, sources: [{ src, type, media? }], mobile }
 * where mobile is the 4:5 phone cut ({ poster, sources }) or null. The desktop
 * video takes the main cut; the phone video takes the phone cut when there is
 * one. A source's media is the screen it is for (a version by pixel density); the
 * first source that fits wins, so their order is the clip's. tests/site.test.js runs
 * this against a clip with two formats and a phone cut.
 */
export function clipFor(clip, phone) {
  const cut = phone && clip.mobile ? { ...clip, ...clip.mobile } : clip;
  return { poster: cut.poster, sources: cut.sources.map((s) => ({ src: s.src, type: s.type, ...(s.media ? { media: s.media } : {}) })) };
}

/** When a line under a video comes on this cut of the clip (data-at, on the phone cut data-at-mobile): NaN when not on it ("none"). */
export function cueTime(line, phoneCut) {
  return Number(phoneCut && line.dataset.atMobile !== undefined ? line.dataset.atMobile : line.dataset.at);
}

/**
 * The line under a video at this moment of the clip: the last one whose time has come, the first before that.
 * lines: elements with data-at and maybe data-at-mobile, the time on the phone cut ("none": not on that cut).
 */
export function cueNow(lines, time, phoneCut) {
  const at = (l) => cueTime(l, phoneCut);
  let now = lines.find((l) => Number.isFinite(at(l))) || lines[0];
  for (const l of lines) {
    if (at(l) <= time) now = l;
  }
  return now;
}

/** A key that changes whenever the sources of a cut change (to skip a needless reload). */
export function clipKey(cut) {
  return cut.sources.map((s) => s.src).join("|");
}

/** A video on screen takes over from the one playing only when this many times larger: equal areas never flick between them. */
export const VIDEO_SWITCH_AT = 1.25;

/**
 * Which of the videos on screen plays: never more than one (a tall window shows the hero and the next
 * video together), the largest. current keeps playing until another is clearly larger.
 */
export function largestVideo(videos, areaOf, current) {
  if (videos.length < 2) return videos[0] || null;
  const best = videos.reduce((a, b) => (areaOf(b) > areaOf(a) ? b : a));
  return videos.includes(current) && areaOf(best) < areaOf(current) * VIDEO_SWITCH_AT ? current : best;
}

/** The visitor saves data or is on a slow network: videos stay on their poster until asked for. No API, no opinion. */
export function savesData(connection) {
  if (!connection) return false;
  return !!connection.saveData || /^(slow-)?[23]g$/.test(connection.effectiveType || "");
}

/*
 * The line under a loop is read along with the clip (Kryštof, 11. 11. 2026): the word being "said" in the accent,
 * the ones said before it in full, the rest dimmer. The clips have no sound, so "said" is a reading pace: a short
 * word READ_MIN s, one of READ_LONG letters or more READ_MAX s, and the whole line read by READ_SHARE of the time it
 * is on screen at the latest (faster when it is short of time). Then the accent goes and the line stands whole.
 */
export const READ_MIN = 0.28;
export const READ_MAX = 0.4;
export const READ_LONG = 10;
export const READ_SHARE = 0.7;

/** How long one word takes to read: by its letters and digits (a word glued to "v" by a no-break space counts both). */
export function wordPace(word) {
  const letters = (String(word).match(/[\p{L}\p{N}]/gu) || []).length;
  return READ_MIN + (READ_MAX - READ_MIN) * Math.min(1, Math.max(0, (letters - 2) / (READ_LONG - 2)));
}

/**
 * When each word of a line starts to be read, in seconds from the line's start, and when the reading ends.
 * span: how long the line is on screen (Infinity while the clip's length is not known: then at the plain pace).
 */
export function wordSchedule(words, span) {
  const paces = words.map(wordPace);
  const total = paces.reduce((a, b) => a + b, 0);
  const limit = READ_SHARE * span;
  const scale = total > limit && limit > 0 ? limit / total : 1;
  const starts = [];
  let at = 0;
  for (const p of paces) {
    starts.push(at);
    at += p * scale;
  }
  return { starts, end: at };
}

/** The word being read this many seconds into the line: its index, words.length once the line is read (no accent then). */
export function wordAt(schedule, elapsed) {
  if (!(elapsed < schedule.end)) return schedule.starts.length;
  let i = 0;
  while (i + 1 < schedule.starts.length && schedule.starts[i + 1] <= elapsed) i++;
  return i;
}

/**
 * How far into its line the clip is, and how long that line is on screen: { elapsed, span } in seconds.
 * times: when this cut's lines come on (in order), time: the clip's time, duration: its length (NaN until known).
 * seam: the last line says what the first says, so a loop runs over it as one line (build.mjs: nothing changes there);
 * wrapped: the clip has come round at least once, so the first line is the rest of the last one (on the first run it starts here).
 */
export function cueSpan(times, time, duration, seam, wrapped) {
  const end = Number.isFinite(duration) && duration > 0 ? duration : Infinity;
  let i = 0;
  for (let j = 0; j < times.length; j++) if (times[j] <= time) i = j;
  const last = times.length - 1;
  const across = seam && last > 1 && end !== Infinity ? end - times[last] + times[1] : NaN;
  if (Number.isFinite(across) && i === last) return { elapsed: time - times[last], span: across };
  if (Number.isFinite(across) && i === 0 && wrapped) return { elapsed: time + end - times[last], span: across };
  const next = i < last ? times[i + 1] : end;
  return { elapsed: Math.max(0, time - times[i]), span: next - times[i] };
}
