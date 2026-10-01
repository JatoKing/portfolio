/*
 * Choreography for the "See it in action" stage, as plain math: given scroll progress p (0…1
 * across the pinned stage), where is each of the eight phones? Experience.tsx renders the result.
 *
 *   0.00 – 0.30   phones slide in from outside, each along its own vector
 *   0.05 – 0.88   one phone at a time takes the focal slot, in order (holds, then hand-overs)
 *   0.35 – 0.75   the loose constellation draws tighter
 *   0.90 – 1.00   satellites leave the way they came; the last screen shrinks toward the trail
 *
 * Desktop arranges the satellites in a ring around the focal slot, clockwise in screen order,
 * so the gap left by the active phone travels around the ring like a walker on a loop trail.
 * Narrow screens use a vertical reel instead: previous above, active, next below.
 */

export const SCREEN_COUNT = 8;
const FOCUS_START = 0.05;
const FOCUS_END = 0.88;
const EXIT_START = 0.9;
const MOVE = 0.55; // each hand-over lasts 55% of a hold

/* Ring slots, clockwise from the upper left: Splash … Downloads. */
const RING: [number, number][] = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
/* A little 2D tilt while travelling, so no two phones move alike. Settles to 0. */
const TILT = [-5, 3, 6, -4, 5, -6, 4, -3];

export type Pose = { x: number; y: number; scale: number; rotate: number; opacity: number; z: number; focus: number };
export type ReelMetrics = {
  /** Stage size in px. */
  vw: number;
  vh: number;
  /** Phone size at scale 1, in px. */
  pw: number;
  ph: number;
  layout: "ring" | "reel";
  /** Reel only: how many screens away a preview stays visible. */
  reach: number;
  /** Ring only: free space above/below the reel centre before the nav or the journey strip. */
  room: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Which screen is in focus, as a continuous index: whole numbers during holds. */
export function focusAt(p: number) {
  const units = SCREEN_COUNT + (SCREEN_COUNT - 1) * MOVE;
  const u = clamp01((p - FOCUS_START) / (FOCUS_END - FOCUS_START)) * units;
  const period = 1 + MOVE;
  const i = Math.floor(u / period);
  if (i >= SCREEN_COUNT - 1) return SCREEN_COUNT - 1;
  const r = u - i * period;
  return r < 1 ? i : i + smooth((r - 1) / MOVE);
}

/** 0 until the closing beat, then 1 as the stage clears. */
export const exitAt = (p: number) => smooth((p - EXIT_START) / (1 - EXIT_START));

function ringPose(k: number, p: number, f: number, m: ReelMetrics): Pose {
  const [sx, sy] = RING[k];
  const focus = clamp01(1 - Math.abs(f - k));
  const exit = exitAt(p);
  const tight = smooth((p - 0.35) / 0.4);
  const enter = smooth((p - k * 0.02) / 0.14);

  // Satellite slot, pulled in as the composition tightens.
  const sat = lerp(0.44, 0.42, tight);
  const slotX = sx * m.pw * lerp(1.06, 0.84, tight);
  // Rows stay clear of the nav and the journey strip on short screens.
  const slotY = sy * Math.min(m.ph * lerp(0.58, 0.5, tight), m.room - (m.ph * sat) / 2);
  // Off-stage along the slot's own direction; satellites go back out the same way.
  const away = (1 - enter) + exit * (1 - focus);
  const x = lerp(slotX, 0, focus) + sx * m.vw * 0.62 * away - exit * focus * m.vw * 0.05;
  const y = lerp(slotY, 0, focus) + sy * m.vh * 0.78 * away + exit * focus * m.vh * 0.08;

  return {
    x,
    y,
    scale: lerp(sat, 1, focus) * lerp(1, 0.62, exit * focus),
    rotate: TILT[k] * Math.max(1 - enter, exit) * (1 - focus * (1 - exit)),
    opacity: lerp(0.86, 1, focus) * lerp(0.3, 1, enter) * (1 - exit),
    z: Math.round(focus * 10) + 1,
    focus,
  };
}

function reelPose(k: number, p: number, f: number, m: ReelMetrics): Pose {
  const d = k - f; // < 0: already seen (above); > 0: coming up (below)
  const near = Math.min(1, Math.abs(d));
  const exit = exitAt(p);
  const enter = smooth(p / 0.12);
  const visible = Math.abs(d) <= 1
    ? lerp(1, 0.55, near)
    : lerp(0.55, 0, clamp01((Math.abs(d) - 1) / (m.reach - 1)));

  return {
    x: (k % 2 ? 1 : -1) * near * m.pw * 0.2,
    y: d * m.ph * 0.62 + (1 - enter) * m.vh * 0.6 - exit * m.vh * 0.08,
    scale: (1 - 0.42 * near) * lerp(1, 0.7, exit),
    rotate: 0,
    opacity: visible * (1 - exit),
    z: Math.round((1 - near) * 10) + 1,
    focus: 1 - near,
  };
}

export function posesAt(p: number, m: ReelMetrics): Pose[] {
  const f = focusAt(p);
  return Array.from({ length: SCREEN_COUNT }, (_, k) => (m.layout === "ring" ? ringPose(k, p, f, m) : reelPose(k, p, f, m)));
}
