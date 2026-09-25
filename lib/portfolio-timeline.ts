// The fixed-stage / smoothstep-cue / all-intra video scrub architecture comes from
// cast-and-render.html. Unlike its raw-scroll paint(), every visual here consumes the
// eased master clock.
export type RenderMode = "nearest" | "blend";
export type SourceKind = "video" | "frames";
export const frameConfig = {
  // Primary source: the original 10 s / 24 fps render, re-encoded all-intra (every
  // frame a keyframe) so any scrub position decodes directly, as in cast-and-render.
  video: { src: "/video/avatar-intra.mp4", fps: 24, frames: 240, bytes: 10041452 },
  // Fallback: every 2nd source frame, so fallback index k is source frame 2k.
  directory: "/frames-120", prefix: "frame-", extension: "webp", count: 120, fps: 12,
  width: 1280, height: 720, background: "#d3cfc8",
  scrollVh: 700,
  renderMode: "nearest" as RenderMode,
  blendSteps: 64,
  smoothing: .16, // At 60 Hz; compensated for elapsed time at other refresh rates.
  catchUpSmoothing: .30,
  maxSettleMs: 300,
  settleEpsilon: .00001,
} as const;
// Seconds of source video for a zero-based frame at 24 fps. Sections are timed in
// video seconds, so any frame density (240, 120, ...) lands on the same moment.
const at = (sourceFrame: number) => sourceFrame / frameConfig.video.fps;
export const sequenceEnd = at(238); // last frame present in both the video and the fallback
// The source contains one hard cut (facing away -> facing camera) between frames 156 and 157.
export const sourceCut = at(156.5);
export const sourceFps = (kind: SourceKind) => kind === "video" ? frameConfig.video.fps : frameConfig.fps;
export const sourceCount = (kind: SourceKind) => kind === "video" ? frameConfig.video.frames : frameConfig.count;

// Horizontal centre of the character (source px, 1280 wide) every 0.25 s of video,
// measured from the suit colour. Portrait screens use it to pan the full-bleed stage.
export const subjectTrack = {
  step: .25,
  x: [502,500,495,488,485,496,515,529,533,530,523,523,531,544,561,575,576,571,569,576,588,599,607,618,629,632,632,619,628,639,655,668,668,664,646,621,603,596,594,593,594],
} as const;
export function getSubjectX(time: number) {
  const position = clamp(time / subjectTrack.step, 0, subjectTrack.x.length - 1);
  const lower = Math.floor(position), upper = Math.min(lower + 1, subjectTrack.x.length - 1);
  return subjectTrack.x[lower] + (subjectTrack.x[upper] - subjectTrack.x[lower]) * (position - lower);
}

export const getFramePath = (index: number) =>
  `${frameConfig.directory}/${frameConfig.prefix}${String(index + 1).padStart(3, "0")}.${frameConfig.extension}`;

// Section spans are in video SECONDS. Shared endpoints are intentional: a gap between
// adjacent segments would introduce a discontinuity in video time.
// Each range includes its trailing frame-only gap. The final chapter stays held.
export const chapters = [
  { id: "hero", label: "Introduction", progressStart: 0, progressEnd: .16, timeStart: 0, timeEnd: at(28), start: 0, enterEnd: 0, holdEnd: .10, exitEnd: .135, pose: "Opening stance" },
  { id: "about", label: "About", progressStart: .16, progressEnd: .31, timeStart: at(28), timeEnd: at(66), start: .16, enterEnd: .19, holdEnd: .26, exitEnd: .285, pose: "First steps" },
  { id: "experience", label: "Experience", progressStart: .31, progressEnd: .48, timeStart: at(66), timeEnd: at(109), start: .31, enterEnd: .335, holdEnd: .43, exitEnd: .455, pose: "Walking forward" },
  { id: "projects", label: "Projects", progressStart: .48, progressEnd: .75, timeStart: at(109), timeEnd: at(162), start: .48, enterEnd: .505, holdEnd: .665, exitEnd: .695, pose: "Approach and turn; source cut in the empty gap" },
  { id: "skills", label: "Skills", progressStart: .75, progressEnd: .88, timeStart: at(162), timeEnd: at(196), start: .75, enterEnd: .78, holdEnd: .825, exitEnd: .85, pose: "Taking a seat" },
  { id: "contact", label: "Contact", progressStart: .88, progressEnd: 1, timeStart: at(196), timeEnd: sequenceEnd, start: .88, enterEnd: .925, holdEnd: 1, exitEnd: null, pose: "Phone and final seated pose" },
] as const;
export type Chapter = typeof chapters[number];
export type ChapterId = Chapter["id"];
export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export const smoothstep = (t: number) => t * t * (3 - 2 * t);
export function getLocalProgress(progress: number, start: number, end: number) {
  return end <= start ? Number(progress >= end) : clamp((progress - start) / (end - start));
}
export function ramp(progress: number, start: number, end: number) {
  return smoothstep(getLocalProgress(progress, start, end));
}
export function chapterStyle(progress: number, cue: Chapter) {
  // Derive cue phases in the chapter's local coordinate system.
  const local = getLocalProgress(progress, cue.progressStart, cue.progressEnd);
  const point = (p: number) => getLocalProgress(p, cue.progressStart, cue.progressEnd);
  if (progress < cue.progressStart || progress > cue.progressEnd) return { opacity: 0, y: 18, local };
  const enter = ramp(local, point(cue.start), point(cue.enterEnd));
  const leave = cue.exitEnd === null ? 0 : ramp(local, point(cue.holdEnd), point(cue.exitEnd));
  return { opacity: enter * (1 - leave), y: (1 - enter - leave) * 18, local };
}
export function getVideoTime(masterProgress: number) {
  const p = clamp(masterProgress);
  const segment = chapters.find(cue => p < cue.progressEnd) ?? chapters[chapters.length - 1];
  const local = getLocalProgress(p, segment.progressStart, segment.progressEnd);
  return segment.timeStart + local * (segment.timeEnd - segment.timeStart);
}
// Floating-point position within whichever source is active; never rounded here.
export function getFramePosition(masterProgress: number, kind: SourceKind = "frames") {
  return getVideoTime(masterProgress) * sourceFps(kind);
}
export function getFrameSample(framePosition: number, count: number = frameConfig.count) {
  const position = clamp(framePosition, 0, count - 1);
  const lower = Math.floor(position), upper = Math.ceil(position);
  return { lower, upper, mix: position - lower, nearest: Math.round(position) };
}
export function getActiveChapter(masterProgress: number) {
  // No highlighted section in an empty zone; fades and navigation agree exactly.
  return chapters.find(cue => chapterStyle(masterProgress, cue).opacity > .001) ?? null;
}
export function getChapterDestination(id: ChapterId) {
  return chapters.find(cue => cue.id === id)!.enterEnd;
}
export function itemProgress(id: "experience" | "projects", index: number, count: number) {
  const cue = chapters.find(chapter => chapter.id === id)!;
  return cue.enterEnd + ((index + .5) / count) * (cue.holdEnd - cue.enterEnd);
}
export function itemIndex(progress: number, id: "experience" | "projects", count: number) {
  const cue = chapters.find(chapter => chapter.id === id)!;
  return Math.min(count - 1, Math.floor(getLocalProgress(progress, cue.enterEnd, cue.holdEnd) * count));
}

export type MasterClock = { targetProgress: number; currentProgress: number; lastInputTime: number };
export function advanceMaster(clock: MasterClock, dt: number, now: number, reducedMotion: boolean) {
  const gap = clock.targetProgress - clock.currentProgress;
  if (reducedMotion || Math.abs(gap) <= frameConfig.settleEpsilon) return clock.targetProgress;
  const smoothing = frameConfig.smoothing + (frameConfig.catchUpSmoothing - frameConfig.smoothing) * clamp(Math.abs(gap) / .12);
  const elapsed = Math.max(0, now - clock.lastInputTime);
  const remaining = Math.max(dt, frameConfig.maxSettleMs - elapsed);
  // Exponential response while input is moving, then a bounded, continuous finish.
  // This avoids a long exponential tail or a delayed threshold snap at the endpoint.
  const alpha = Math.max(1 - Math.pow(1 - smoothing, dt / (1000 / 60)), dt / remaining);
  return clamp(clock.currentProgress + gap * clamp(alpha));
}
