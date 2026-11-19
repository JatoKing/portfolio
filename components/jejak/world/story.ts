import * as THREE from "three";

/*
 * The story in numbers: the trail's shape, where each stage sits on it, how
 * the camera frames each stage, and the light of each stage.
 *
 * Everything is indexed by σ (sigma), a continuous stage number: 0 is the
 * trailhead, 7 the summit, 8 the ending frame. Scroll position maps onto σ
 * (see WorldLayer), and every value below is blended between whole stages.
 */

/* ── The trail: one path climbing from the valley floor to the summit ───────── */

const POINTS: [number, number, number][] = [
  [0, 0, 6], [0, 0, 0], [2, 0.4, -20], [-2.5, 1, -40], [-8, 3, -68], [-3, 4.6, -98],
  [6, 8, -126], [13, 15, -150], [9, 21, -176], [-2, 28, -202], [-9, 36, -230],
  [-4, 44, -258], [2, 50, -280], [3, 52, -292],
];

/** Where each stage sits on the trail (0..1 of its length); index 8 is the ending. */
export const STAGE_S = [0.02, 0.105, 0.24, 0.355, 0.5, 0.635, 0.8, 0.975, 1];

/** Story beats placed relative to the stages. */
export const MARKS = {
  gate: 0.118,
  /** The forest: from just past the gate to beyond the river crossing. */
  forest: [0.13, 0.48] as [number, number],
  river: 0.372,
  rocks: [[0.44, 0.6], [0.74, 0.93]] as [number, number][],
  falls: 0.645,
  cairns: [0.78, 0.86, 0.93],
  flag: 0.996,
};

/*
 * The footbridge over the river: half its length (metres, along the trail), how high its deck
 * stands at the ends, and how much it arches in the middle. The deck ramps down to the path at
 * both ends, so the route runs straight on and over.
 */
export const BRIDGE = { half: 5.2, deck: 0.2, arch: 0.28 };

/** Height of the bridge deck above the trail line at trail position s (0 off the bridge). */
export function bridgeLift(trail: Trail, s: number) {
  const t = Math.abs(s - MARKS.river) * trail.length;
  if (t >= BRIDGE.half) return 0;
  const ramp = Math.min(1, (BRIDGE.half - t) / 0.9);
  return (BRIDGE.deck + BRIDGE.arch * (1 - (t / BRIDGE.half) ** 2)) * ramp * (2 - ramp);
}

export function makeTrail() {
  const curve = new THREE.CatmullRomCurve3(POINTS.map(p => new THREE.Vector3(...p)), false, "centripetal");
  curve.arcLengthDivisions = 3000;
  const count = 900;
  const samples = curve.getSpacedPoints(count);
  return { curve, samples, length: curve.getLength() };
}
export type Trail = ReturnType<typeof makeTrail>;

/** Point, horizontal forward and right vectors at trail position s. */
export function frameAt(trail: Trail, s: number) {
  const t = Math.min(1, Math.max(0, s));
  const p = trail.curve.getPointAt(t);
  const tan = trail.curve.getTangentAt(t);
  const forward = new THREE.Vector3(tan.x, 0, tan.z).normalize();
  const right = new THREE.Vector3(-forward.z, 0, forward.x);
  return { p, tan, forward, right };
}

/* ── Camera: how each stage is framed ───────────────────────────────────────── */

/*
 * Offsets in the hiker's own frame. side: + to the hiker's right. up: height.
 * back: + behind the hiker, − in front. ahead/lookUp: the point looked at,
 * along the trail from the hiker. pan: slides the frame sideways (− puts the
 * hiker right of centre). Panels sit left on most stages, so the camera
 * mostly stands to the hiker's left to put them right of centre.
 */
export type Shot = { side: number; up: number; back: number; ahead: number; lookUp: number; fov: number; pan?: number };

export const SHOTS: Shot[] = [
  // 01 Trailhead: close, low, over the shoulder, tilted up so the title sits on open sky.
  { side: -1.25, up: 1.45, back: 5.6, ahead: 40, lookUp: 8.6, fov: 40 },
  // 02 Gate: pulled back so the arch frames the path.
  { side: -2.6, up: 2.6, back: 9, ahead: 16, lookUp: 1.6, fov: 44 },
  // 03 Forest: from the other side, the trees closing in.
  { side: 3.2, up: 3, back: 8.5, ahead: 16, lookUp: 1.2, fov: 46 },
  // 04 River: high and back, the water crossing the frame, the bridge clear of the panel.
  { side: -3.4, up: 5, back: 11, ahead: 12, lookUp: -0.6, fov: 46, pan: -2.4 },
  // 05 Climb: low and in front, looking back down at the climb.
  { side: -4.6, up: 0.9, back: -6.5, ahead: -2, lookUp: 2.2, fov: 44 },
  // 06 Falls: wide, the falls to the hiker's right.
  { side: -4.2, up: 3.8, back: 12, ahead: 12, lookUp: 5.2, fov: 54, pan: 2.6 },
  // 07 Ascent: high and wide, the open ridge.
  { side: -7, up: 9, back: 16, ahead: 26, lookUp: 4, fov: 52 },
  // 08 Summit: in front, three-quarter, the pole raised.
  { side: 5.4, up: 1.7, back: -6.4, ahead: 0, lookUp: 2.2, fov: 40, pan: -3.4 },
  // Ending: low behind the hiker, the far ranges in golden light.
  { side: -2.4, up: 1.1, back: 5.6, ahead: 70, lookUp: 9, fov: 38 },
];

/* ── Light: the colour of each stage ────────────────────────────────────────── */

/*
 * top/ground: the sky and bounce light that fall on the world (hemisphere light).
 * sky: the colour of the open sky overhead, painted behind the world; horizon: the haze it
 * fades into at the horizon (and the colour of the fog).
 */
export type Light = { sky: string; top: string; horizon: string; ground: string; sun: string; sunPower: number; range: string };

export const LIGHTS: Light[] = [
  { sky: "#7db4e3", top: "#cdd8da", horizon: "#e2edf2", ground: "#c9d1bd", sun: "#fff3df", sunPower: 1.7, range: "#a9b9bd" },
  { sky: "#82b7e2", top: "#d0dcd9", horizon: "#e4eef1", ground: "#c7d1bb", sun: "#fff4e2", sunPower: 1.8, range: "#a8b9ba" },
  { sky: "#88b9d9", top: "#c6d6cb", horizon: "#e1ebe6", ground: "#bccab0", sun: "#fff1d8", sunPower: 1.6, range: "#9fb4a8" },
  { sky: "#7cb3e0", top: "#c8dcde", horizon: "#e3eef1", ground: "#c2cfbb", sun: "#f4f8ff", sunPower: 1.8, range: "#a2b8bf" },
  { sky: "#88b5dc", top: "#d2d7d6", horizon: "#e9eeee", ground: "#cac8bd", sun: "#fff4e4", sunPower: 1.9, range: "#adb5b8" },
  { sky: "#7ab1df", top: "#c9dce2", horizon: "#e4eff2", ground: "#c4cec2", sun: "#f6fbff", sunPower: 1.8, range: "#a3b9c3" },
  { sky: "#70a8dc", top: "#c3d5e6", horizon: "#e6eef5", ground: "#d2d6d0", sun: "#ffffff", sunPower: 2, range: "#a7b8c9" },
  { sky: "#6aa3da", top: "#bed2e8", horizon: "#e8eff4", ground: "#d8dad4", sun: "#ffffff", sunPower: 2.1, range: "#a4b6cb" },
  { sky: "#efc39f", top: "#efc39f", horizon: "#fbe6cf", ground: "#d9c2ab", sun: "#ffc187", sunPower: 2.3, range: "#d39c86" },
];

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Blend two neighbouring stages at σ. */
export function between<T>(list: T[], sigma: number): [T, T, number] {
  const max = list.length - 1;
  const s = Math.min(max, Math.max(0, sigma));
  const i = Math.min(max - 1, Math.floor(s));
  return [list[i], list[i + 1], smooth(s - i)];
}

export function shotAt(sigma: number): Shot {
  const [a, b, t] = between(SHOTS, sigma);
  const out = {} as Shot;
  for (const k of ["side", "up", "back", "ahead", "lookUp", "fov", "pan"] as const) out[k] = (a[k] ?? 0) + ((b[k] ?? 0) - (a[k] ?? 0)) * t;
  return out;
}

const ca = new THREE.Color();
const cb = new THREE.Color();
export function lightAt(sigma: number) {
  const [a, b, t] = between(LIGHTS, sigma);
  const mixc = (k: "sky" | "top" | "horizon" | "ground" | "sun" | "range") => ca.set(a[k]).lerp(cb.set(b[k]), t).clone();
  return {
    sky: mixc("sky"), top: mixc("top"), horizon: mixc("horizon"), ground: mixc("ground"), sun: mixc("sun"), range: mixc("range"),
    sunPower: a.sunPower + (b.sunPower - a.sunPower) * t,
    /** 0..1: how far into the golden ending. */
    gold: Math.max(0, Math.min(1, sigma - 7)),
  };
}

/** Trail position at σ: steady walking between stage positions. */
export function trailAt(sigma: number) {
  const max = STAGE_S.length - 1;
  const s = Math.min(max, Math.max(0, sigma));
  const i = Math.min(max - 1, Math.floor(s));
  return STAGE_S[i] + (STAGE_S[i + 1] - STAGE_S[i]) * (s - i);
}
