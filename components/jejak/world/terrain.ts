import * as THREE from "three";
import type { Trail } from "./story";
import { cliffCoords, streamDistance, type Stream, type Waters } from "./water";

/*
 * The ground: a low-poly valley that follows the trail, built in two passes.
 *
 * First the land as it would be without the path: hills rising to either side
 * and dissolving into the fog, higher and closer in around the river, which
 * runs through its own valley between them; the falls on a raised plateau
 * with a cliff face, a pool in a basin at their foot, the outflow cutting a
 * channel down the valley; the ground falling away around the summit.
 *
 * Then the path is cut through it: a level bench a few metres wide that
 * follows the trail's own smooth gradient, with the land easing back to its
 * natural shape beside it (a gentle verge on low ground, a longer cut bank
 * where the path climbs past higher land). The path never rises and falls
 * with the hills; only the river cuts across it, where the bridge carries it.
 * Steep faces are tinted as rock, everything else as grass.
 */

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
const fbm = (x: number, y: number) => vnoise(x, y) * 0.6 + vnoise(x * 2.1, y * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3) * 0.1;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/*
 * Grass along the climb, as two greens per stretch (a deep and a light one) that the ground
 * blends between in soft patches: lush meadow at the start, deeper green in the forest, fresh
 * by the river, olive on the rocky climb, pale alpine grass near the top.
 */
const GREENS: [number, string, string][] = [
  [0, "#6f9a4f", "#9dbd6c"],
  [0.16, "#5d8a46", "#86ab5c"],
  [0.34, "#62914c", "#8fb46a"],
  [0.42, "#6e9852", "#97b873"],
  [0.5, "#7a9058", "#a3ae7a"],
  [0.7, "#80985f", "#a9b783"],
  [0.85, "#93a678", "#bcc69e"],
  [1, "#a3b08a", "#c9d0b0"],
];

export type Ground = {
  mesh: THREE.Mesh;
  heightAt: (x: number, z: number) => number;
  /** Nearest point of the trail: its height, position along it (0..1) and plan distance. */
  nearest: (x: number, z: number) => { y: number; s: number; d: number };
  /** How far (x, z) is from open water, in metres; negative inside it. */
  dryness: (x: number, z: number) => number;
  /** 0 on level ground … 1 on a rock face. */
  steepness: (x: number, z: number) => number;
  dispose: () => void;
};

const ROCK = new THREE.Color("#c3c2b7");

export function buildGround(trail: Trail, waters: Waters, lowPower: boolean): Ground {
  const { samples } = trail;
  const n = samples.length - 1;

  /** Nearest trail sample in plan view. The trail runs steadily toward -z, so search near z. */
  const nearest = (x: number, z: number) => {
    let lo = 0, hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (samples[mid].z > z) lo = mid + 1;
      else hi = mid;
    }
    let best = Infinity, bi = 0;
    for (let i = Math.max(0, lo - 160); i <= Math.min(n, lo + 160); i++) {
      const dx = samples[i].x - x, dz = samples[i].z - z;
      const d = dx * dx + dz * dz;
      if (d < best) { best = d; bi = i; }
    }
    return { y: samples[bi].y, s: bi / n, d: Math.sqrt(best) };
  };

  // Streams only matter near their own bounding box.
  const box = (st: Stream) => {
    const pad = st.width / 2 + st.bank;
    const xs = st.pts.map(p => p.x), zs = st.pts.map(p => p.z);
    return { st, x0: Math.min(...xs) - pad, x1: Math.max(...xs) + pad, z0: Math.min(...zs) - pad, z1: Math.max(...zs) + pad };
  };
  const streams = [waters.river, waters.upper, waters.lower].map(box);
  const near = (b: ReturnType<typeof box>, x: number, z: number) => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1;

  /**
   * Ease the ground into a stream's channel: a shallow bed, a low bank, then the land again.
   * The bank only ever lowers the land (it never heaps ground up over a path that runs lower).
   */
  const carve = (h: number, st: Stream, x: number, z: number) => {
    const { d, level } = streamDistance(st, x, z);
    // The bed runs a metre past the water's edge, so the coarse ground mesh never laps over it.
    const half = st.width / 2 + 1;
    if (d > half + st.bank) return h;
    if (d < half) return level - 0.15 - 0.45 * (1 - (d / half) ** 2);
    const bank = level + 0.22;
    return Math.min(h, bank + (h - bank) * smoothstep(half, half + st.bank, d));
  };

  /** Path bench: half-width of the level ground the path runs on, in metres. */
  const BENCH = 3.2;

  const { cliff } = waters;
  /** The land as it would be without the path. */
  const natural = (x: number, z: number, y: number, s: number, d: number) => {
    const top = smoothstep(0.84, 0.99, s);
    let h = y - 0.06;
    h += smoothstep(3, 30, d) * (2.5 + 12 * fbm(x * 0.024, z * 0.024)) * (1 - 0.85 * top);
    // A gentle swell on the valley floor itself, so the meadow rolls instead of lying flat.
    h += smoothstep(2.2, 7, d) * (fbm(x * 0.09 + 3.1, z * 0.09) - 0.42) * 1.1 * (1 - top);
    h -= top * Math.max(0, d - 3.5) * 0.5;

    // Around the river the land is hillier: rounded hills close in on both sides of the path
    // (it threads between them down to the crossing), falling away into the river's own valley.
    const riverLand = smoothstep(0.27, 0.32, s) * (1 - smoothstep(0.4, 0.45, s));
    if (riverLand > 0) {
      const knolls = 3.5 + 9 * fbm(x * 0.05 + 5.3, z * 0.05 - 2.1) + 3 * fbm(x * 0.13, z * 0.13);
      let hills = riverLand * smoothstep(6, 20, d) * knolls;
      if (near(streams[0], x, z)) {
        // The valley sides: the hills slope down to the banks.
        const { d: dr } = streamDistance(waters.river, x, z);
        hills *= smoothstep(waters.river.width / 2 + 2, waters.river.width / 2 + 20, dr);
      }
      h += hills;
    }

    // The river's own valley.
    if (near(streams[0], x, z)) h = carve(h, waters.river, x, z);

    // The falls: a basin for the pool, then the plateau with its cliff face behind it.
    const { a, l, r } = cliffCoords(cliff, x, z);
    if (r < cliff.poolR + 9 && a < cliff.foot + 0.5) {
      const bed = r < cliff.poolR ? cliff.pool.y - 0.7 * (1 - (r / cliff.poolR) ** 2) - 0.05 : cliff.pool.y + 0.25;
      h = bed + (h - bed) * smoothstep(cliff.poolR, cliff.poolR + 9, r);
    }
    const shoulder = 1 - smoothstep(cliff.span, cliff.span + 16, Math.abs(l));
    if (shoulder > 0 && a > -26) {
      const floor = cliff.pool.y + 0.25;
      if (a < cliff.foot) {
        // The apron between the trail and the pool: open, level ground so nothing hides the falls.
        const apron = shoulder * smoothstep(-26, -19, a);
        h += (Math.min(h, floor + 0.15) - h) * apron;
      } else {
        // The cliff itself: exactly its own profile near the face, the hills allowed back in only
        // well behind the lip.
        const face = smoothstep(cliff.foot, cliff.lip, a) + 0.06 * (fbm(l * 0.3, a * 0.2) - 0.5);
        const shaped = floor + cliff.drop * face;
        const behind = smoothstep(cliff.lip + 6, cliff.lip + 24, a);
        h += (shaped + (Math.max(shaped, h) - shaped) * behind - h) * shoulder;
      }
    }
    if (near(streams[1], x, z)) h = carve(h, waters.upper, x, z);
    if (near(streams[2], x, z)) h = carve(h, waters.lower, x, z);
    return h;
  };

  const heightAt = (x: number, z: number) => {
    const { y, s, d } = nearest(x, z);
    const land = natural(x, z, y, s, d);
    // The path's bench: level across, following the trail's own smooth gradient along.
    const bench = y - 0.1;
    // The land eases back over a verge a few metres wide, or a longer bank where it stands
    // well above or below the path, so a cut never turns into a wall.
    const reach = 6 + Math.min(24, Math.abs(land - bench) * 2);
    let h = bench + (land - bench) * smoothstep(BENCH, BENCH + reach, d);
    // Only the river crosses the path (the bridge carries the path over it).
    if (near(streams[0], x, z)) {
      const { d: dr, level } = streamDistance(waters.river, x, z);
      const half = waters.river.width / 2 + 1;
      if (dr < half) h = Math.min(h, level - 0.15 - 0.45 * (1 - (dr / half) ** 2));
      else if (dr < half + 2.5) h = Math.min(h, level + 0.22 + (h - level - 0.22) * smoothstep(half, half + 2.5, dr));
    }
    return h;
  };

  const dryness = (x: number, z: number) => {
    let dry = Infinity;
    for (const b of streams) if (near(b, x, z)) dry = Math.min(dry, streamDistance(b.st, x, z).d - b.st.width / 2);
    const { a, r } = cliffCoords(cliff, x, z);
    if (a < cliff.foot + 1) dry = Math.min(dry, r - cliff.poolR);
    return dry;
  };
  const steepness = (x: number, z: number) => {
    const e = 0.8;
    const gx = heightAt(x + e, z) - heightAt(x - e, z);
    const gz = heightAt(x, z + e) - heightAt(x, z - e);
    return smoothstep(0.5, 1.4, Math.hypot(gx, gz) / (2 * e));
  };

  const step = lowPower ? 3.2 : 2.1;
  const x0 = -170, x1 = 170, z0 = 40, z1 = -380;
  const cols = Math.ceil((x1 - x0) / step);
  const rows = Math.ceil((z0 - z1) / step);
  const heights = new Float32Array((cols + 1) * (rows + 1));
  const tints = new Float32Array((cols + 1) * (rows + 1) * 3);
  const color = new THREE.Color();
  const deep = new THREE.Color();
  const light = new THREE.Color();
  const tmp = new THREE.Color();
  /** Grass colour at trail position s, `mix` 0 = deep green … 1 = light green. */
  const tint = (s: number, mix: number) => {
    let i = 0;
    while (i < GREENS.length - 2 && s > GREENS[i + 1][0]) i++;
    const [sa, da, la] = GREENS[i];
    const [sb, db, lb] = GREENS[i + 1];
    const t = smoothstep(sa, sb, s);
    deep.set(da).lerp(tmp.set(db), t);
    light.set(la).lerp(tmp.set(lb), t);
    return color.copy(deep).lerp(light, mix);
  };
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const x = x0 + c * step, z = z0 - r * step;
      const k = r * (cols + 1) + c;
      heights[k] = heightAt(x, z);
      const { s, d } = nearest(x, z);
      // Soft patches of deeper and lighter grass, a richer verge along the trail, and a fleck
      // of variation per vertex so the facets read as a meadow, not a flat fill.
      const patch = smoothstep(0.3, 0.72, fbm(x * 0.045 + 11, z * 0.045 - 7));
      const verge = 1 - smoothstep(1.2, 5, d);
      tint(s, patch * (1 - 0.55 * verge));
      color.multiplyScalar(0.95 + 0.09 * hash(c * 0.37, r * 0.71));
      tints.set([color.r, color.g, color.b], k * 3);
    }
  }

  // Flat-shaded: every triangle gets its own vertices and one colour.
  const pos: number[] = [];
  const col: number[] = [];
  const vtx = (c: number, r: number) => [x0 + c * step, heights[r * (cols + 1) + c], z0 - r * step];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const flip = (r + c) % 2 === 0;
      // Counter-clockwise seen from above (rows run toward -z), so every face points at the sky.
      const quads = flip
        ? [[[c, r], [c + 1, r], [c, r + 1]], [[c + 1, r], [c + 1, r + 1], [c, r + 1]]]
        : [[[c, r], [c + 1, r + 1], [c, r + 1]], [[c, r], [c + 1, r], [c + 1, r + 1]]];
      for (const tri of quads) {
        let cr = 0, cg = 0, cb = 0;
        for (const [tc, tr] of tri) {
          pos.push(...vtx(tc, tr));
          const k = (tr * (cols + 1) + tc) * 3;
          cr += tints[k]; cg += tints[k + 1]; cb += tints[k + 2];
        }
        // Steep faces are rock, not grass.
        const [p0, p1, p2] = tri.map(([tc, tr]) => vtx(tc, tr));
        const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2];
        const vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        const up = Math.abs(ny) / Math.hypot(nx, ny, nz);
        const rock = smoothstep(0.72, 0.5, up);
        color.setRGB(cr / 3, cg / 3, cb / 3).lerp(ROCK, rock);
        for (let i = 0; i < 3; i++) col.push(color.r, color.g, color.b);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const mesh = new THREE.Mesh(geometry, material);

  return {
    mesh,
    heightAt,
    nearest,
    dryness,
    steepness,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
