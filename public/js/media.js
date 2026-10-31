/**
 * Which cut of a clip a video element plays. A chapter tab carries its clip as
 * JSON (build: {{media:<id>:json}}): { poster, sources: [{ src, type }], mobile }
 * where mobile is the 4:5 phone cut ({ poster, sources }) or null. The desktop
 * video takes the main cut; the phone video takes the phone cut when there is
 * one. tests/site.test.js runs this against a clip with WebM + MP4 and a phone cut.
 */
export function clipFor(clip, phone) {
  const cut = phone && clip.mobile ? { ...clip, ...clip.mobile } : clip;
  return { poster: cut.poster, sources: cut.sources.map((s) => ({ src: s.src, type: s.type })) };
}

/** A key that changes whenever the sources of a cut change (to skip a needless reload). */
export function clipKey(cut) {
  return cut.sources.map((s) => s.src).join("|");
}
