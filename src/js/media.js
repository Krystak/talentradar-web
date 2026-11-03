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

/**
 * The line under a video at this moment of the clip: the last one whose time has come, the first before that.
 * lines: elements with data-at and maybe data-at-mobile, the time on the phone cut ("none": not on that cut).
 */
export function cueNow(lines, time, phoneCut) {
  const at = (l) => Number(phoneCut && l.dataset.atMobile !== undefined ? l.dataset.atMobile : l.dataset.at);
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
