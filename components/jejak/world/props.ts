import * as THREE from "three";
import { BRIDGE, MARKS, bridgeLift, frameAt, type Trail } from "./story";
import type { Ground } from "./terrain";
import { cliffCoords, type Waters } from "./water";
import { puffTexture, rangeMaterial, signTexture } from "./materials";

/*
 * Everything that stands in the world besides the hiker, the ground and the
 * water. Landmarks (the gate, the summit flag) rise out of the ground as the
 * hiker reaches them; the forest and the rocks are simply there, laid out by
 * where they would grow: a real forest from just past the gate to beyond the
 * river, scattered trees elsewhere, rock on the steep stretches.
 */

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** How grown a thing at trail position s is, with the hiker at h. */
const grown = (s: number, h: number, reach = 0.085) => smoothstep(s - reach, s - reach + 0.045, h);

function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth 2D value noise, 0..1, for clumping trees into groves. */
function noise2(x: number, y: number) {
  const h = (a: number, b: number) => {
    const t = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return t - Math.floor(t);
  };
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = h(ix, iy), b = h(ix + 1, iy), c = h(ix, iy + 1), d = h(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

type Grower = (h: number) => void;

export type Props = {
  group: THREE.Group;
  update: (h: number, time: number, colors: { top: THREE.Color; horizon: THREE.Color; range: THREE.Color; gold: number }) => void;
  dispose: () => void;
};

export function buildProps(trail: Trail, ground: Ground, waters: Waters, lowPower: boolean): Props {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const growers: Grower[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);
  const lambert = (color: string) => keep(new THREE.MeshLambertMaterial({ color, flatShading: true }));
  const rand = rng(7);

  /** Place an object at trail position s, `side` to the right of the trail, facing along it. */
  const place = (obj: THREE.Object3D, s: number, side = 0, along = 0) => {
    const f = frameAt(trail, s);
    const x = f.p.x + f.right.x * side + f.forward.x * along;
    const z = f.p.z + f.right.z * side + f.forward.z * along;
    obj.position.set(x, side === 0 ? f.p.y : ground.heightAt(x, z), z);
    obj.rotation.y = Math.atan2(-f.forward.x, -f.forward.z);
    return f;
  };

  /* ── The gate: two posts, a beam, a hanging sign ── */
  {
    const gate = new THREE.Group();
    const wood = lambert("#8b6a4b");
    const dark = lambert("#6b4f37");
    for (const x of [-1.75, 1.75]) {
      gate.add(new THREE.Mesh(keep(new THREE.CylinderGeometry(0.17, 0.21, 4, 7)), wood).translateX(x).translateY(2));
    }
    const beam = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.17, 0.17, 4.7, 7)), dark);
    beam.rotation.z = Math.PI / 2;
    beam.position.y = 3.85;
    gate.add(beam);
    const sign = new THREE.Mesh(
      keep(new THREE.BoxGeometry(2.3, 0.8, 0.07)),
      [wood, wood, wood, wood, keep(new THREE.MeshLambertMaterial({ map: keep(signTexture("JEJAK", "DENAI · KM 0 · 560 M")) })), wood],
    );
    sign.position.set(0, 3.15, 0);
    gate.add(sign);
    place(gate, MARKS.gate);
    group.add(gate);
    growers.push(h => gate.scale.set(1, Math.max(0.001, grown(MARKS.gate, h, 0.075)), 1));
  }

  /* ── Forest ──
   * A jittered grid over the whole valley, each cell keeping a tree with a probability set by
   * where it is: full forest from just past the gate, through the river crossing and on into the
   * trees beyond it, thinning as the climb begins; a few trees elsewhere; none on the trail, in
   * water or on rock. Clumped by low-frequency noise so it reads as groves and clearings, with a
   * clear corridor along the path. Mostly two-tier conifers, some round broadleaf trees; bigger
   * the further they stand from the path.
   */
  {
    const density = (s: number) =>
      Math.max(
        smoothstep(MARKS.forest[0] - 0.02, MARKS.forest[0] + 0.03, s) * (1 - smoothstep(MARKS.forest[1] - 0.04, MARKS.forest[1] + 0.03, s)),
        0.07 + 0.18 * smoothstep(0.58, 0.63, s) * (1 - smoothstep(0.7, 0.76, s)),
      ) * (1 - smoothstep(0.8, 0.86, s));
    const cell = lowPower ? 4.4 : 3.1;
    type Tree = { x: number; y: number; z: number; h: number; r: number; kind: 0 | 1; tone: number; lean: number };
    const trees: Tree[] = [];
    for (let x = -150; x < 150; x += cell) {
      for (let z = 30; z > -330; z -= cell) {
        const tx = x + (rand() - 0.5) * cell * 0.9;
        const tz = z + (rand() - 0.5) * cell * 0.9;
        const { s, d } = ground.nearest(tx, tz);
        if (d > 85) continue;
        const corridor = 3.1 + 1.6 * rand();
        if (d < corridor) continue;
        const grove = 0.35 + 0.65 * smoothstep(0.25, 0.7, noise2(tx * 0.045, tz * 0.045));
        const fade = 1 - 0.65 * smoothstep(45, 85, d);
        if (rand() > density(s) * grove * fade) continue;
        if (ground.dryness(tx, tz) < 1.6 || ground.steepness(tx, tz) > 0.35) continue;
        // Keep the view from the trail to the falls open: a clearing around the pool and in front of the face.
        const fc = cliffCoords(waters.cliff, tx, tz);
        if (fc.r < 15 || (fc.a < waters.cliff.foot && Math.abs(fc.l) < 16 && fc.a > -26)) continue;
        const kind: 0 | 1 = rand() < 0.74 ? 0 : 1;
        const scale = (0.85 + rand() * 0.5) * (1 + 0.35 * smoothstep(6, 30, d));
        trees.push({
          x: tx, y: ground.heightAt(tx, tz), z: tz,
          h: (kind === 0 ? 4.6 : 3.4) * scale, r: (kind === 0 ? 1.25 : 1.35) * scale,
          kind, tone: Math.floor(rand() * 4), lean: (rand() - 0.5) * 0.06,
        });
      }
    }
    const conifers = trees.filter(t => t.kind === 0);
    const broad = trees.filter(t => t.kind === 1);
    const cone = keep(new THREE.ConeGeometry(1, 1, 7));
    const ball = keep(new THREE.IcosahedronGeometry(1, 0));
    const trunkGeo = keep(new THREE.CylinderGeometry(0.1, 0.16, 1, 5));
    const lower = new THREE.InstancedMesh(cone, lambert("#ffffff"), conifers.length);
    const upper = new THREE.InstancedMesh(cone, lambert("#ffffff"), conifers.length);
    const crowns = new THREE.InstancedMesh(ball, lambert("#ffffff"), broad.length);
    const trunks = new THREE.InstancedMesh(trunkGeo, lambert("#6e5844"), trees.length);
    const pines = ["#5f8a5c", "#517a52", "#6d9663", "#466d4b"].map(c => new THREE.Color(c));
    const leafy = ["#86a65c", "#7a9c55", "#93b066", "#6f9250"].map(c => new THREE.Color(c));
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();
    conifers.forEach((t, i) => {
      q.setFromEuler(e.set(t.lean, rand() * 6, t.lean));
      // Lower tier: broad, starting just above the trunk; upper tier: narrower, crowning it.
      m.compose(v.set(t.x, t.y + t.h * 0.18 + t.h * 0.3, t.z), q, sc.set(t.r, t.h * 0.6, t.r));
      lower.setMatrixAt(i, m);
      lower.setColorAt(i, pines[t.tone]);
      m.compose(v.set(t.x, t.y + t.h * 0.55 + t.h * 0.22, t.z), q, sc.set(t.r * 0.68, t.h * 0.45, t.r * 0.68));
      upper.setMatrixAt(i, m);
      upper.setColorAt(i, pines[(t.tone + 1) % 4]);
    });
    broad.forEach((t, i) => {
      q.setFromEuler(e.set(rand(), rand() * 6, rand()));
      m.compose(v.set(t.x, t.y + t.h * 0.45 + t.r * 0.8, t.z), q, sc.set(t.r, t.r * 0.95, t.r));
      crowns.setMatrixAt(i, m);
      crowns.setColorAt(i, leafy[t.tone]);
    });
    trees.forEach((t, i) => {
      m.compose(v.set(t.x, t.y + t.h * 0.22, t.z), q.identity(), sc.set(1 + t.r * 0.15, t.h * 0.45, 1 + t.r * 0.15));
      trunks.setMatrixAt(i, m);
    });
    group.add(lower, upper, crowns, trunks);
  }

  /* ── Rocks on the steep stretches, cairns on the ridge ── */
  {
    const spots: { x: number; z: number; sx: number; sy: number; sz: number; rot: number; tone: number; lift?: number }[] = [];
    for (const [from, to] of MARKS.rocks) {
      for (let i = 0; i < (lowPower ? 14 : 24); i++) {
        const f = frameAt(trail, from + rand() * (to - from));
        const side = (rand() < 0.5 ? -1 : 1) * (2.4 + rand() * 16);
        const big = rand() < 0.12 ? 1.8 : 1;
        const x = f.p.x + f.right.x * side, z = f.p.z + f.right.z * side;
        if (ground.dryness(x, z) < 1) continue;
        spots.push({ x, z, sx: (0.35 + rand() * 0.7) * big, sy: (0.25 + rand() * 0.45) * big, sz: (0.35 + rand() * 0.6) * big, rot: rand() * 6, tone: Math.floor(rand() * 3) });
      }
    }
    // Cairns: small stacks of three stones beside the trail.
    MARKS.cairns.forEach((s, c) => {
      const f = frameAt(trail, s);
      const side = c % 2 ? 1.9 : -1.9;
      const x = f.p.x + f.right.x * side, z = f.p.z + f.right.z * side;
      [0.42, 0.32, 0.22].forEach((r, k) => spots.push({ x, z, sx: r, sy: r * 0.6, sz: r, rot: k * 1.3, tone: 2, lift: k }));
    });
    const rocks = new THREE.InstancedMesh(keep(new THREE.DodecahedronGeometry(1, 0)), lambert("#ffffff"), spots.length);
    const tones = ["#a9a89e", "#b8b6ab", "#9d9c92"].map(c => new THREE.Color(c));
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();
    spots.forEach((t, i) => {
      const y = ground.heightAt(t.x, t.z) + (t.lift === undefined ? -0.25 * t.sy : [0.22, 0.6, 0.88][t.lift]);
      q.setFromEuler(e.set(0, t.rot, 0));
      m.compose(v.set(t.x, y, t.z), q, sc.set(t.sx, t.sy, t.sz));
      rocks.setMatrixAt(i, m);
      rocks.setColorAt(i, tones[t.tone]);
    });
    group.add(rocks);
  }

  /* ── The footbridge where the trail crosses the river ── */
  {
    // Planks across the path on two side beams, a post-and-rail on each side, the deck arching
    // a little over the water and ramping down onto the path at both ends.
    const plankW = 1.9, pitch = 0.36;
    const wood = ["#a77a4f", "#9a6d44", "#b2865a"].map(c => new THREE.Color(c));
    const beam = lambert("#7c5636");
    const at = (t: number) => {
      const sT = MARKS.river + t / trail.length;
      const f = frameAt(trail, sT);
      return { f, y: f.p.y + bridgeLift(trail, sT) };
    };
    const count = Math.floor((2 * BRIDGE.half) / pitch);
    const planks = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(plankW, 0.09, pitch * 0.86)), lambert("#ffffff"), count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const v = new THREE.Vector3();
    const one = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < count; i++) {
      const t = -BRIDGE.half + pitch * (i + 0.5);
      const { f, y } = at(t);
      q.setFromEuler(e.set(0, Math.atan2(-f.forward.x, -f.forward.z) + (rand() - 0.5) * 0.06, 0));
      planks.setMatrixAt(i, m.compose(v.set(f.p.x, y + 0.02, f.p.z), q, one));
      planks.setColorAt(i, wood[i % 3]);
    }
    group.add(planks);

    /** A straight timber from a to b. */
    const timber = keep(new THREE.BoxGeometry(1, 1, 1));
    const span = (a: THREE.Vector3, b: THREE.Vector3, thick: number, mat: THREE.Material) => {
      const bar = new THREE.Mesh(timber, mat);
      bar.position.copy(a).add(b).multiplyScalar(0.5);
      bar.scale.set(thick, thick, a.distanceTo(b));
      bar.lookAt(b);
      group.add(bar);
    };
    const posts = [-BRIDGE.half + 0.5, -BRIDGE.half / 3, BRIDGE.half / 3, BRIDGE.half - 0.5];
    for (const side of [-1, 1]) {
      const edge = (t: number, lift: number, out: number) => {
        const { f, y } = at(t);
        return new THREE.Vector3(f.p.x + f.right.x * side * out, y + lift, f.p.z + f.right.z * side * out);
      };
      // Side beam under the plank ends, in short runs so it follows the arch.
      for (let k = 0; k < 6; k++) {
        const t0 = -BRIDGE.half + 0.3 + (k / 6) * (2 * BRIDGE.half - 0.6);
        const t1 = -BRIDGE.half + 0.3 + ((k + 1) / 6) * (2 * BRIDGE.half - 0.6);
        span(edge(t0, -0.08, plankW / 2 - 0.15), edge(t1, -0.08, plankW / 2 - 0.15), 0.16, beam);
      }
      // Posts, and the hand rail along their tops.
      posts.forEach((t, k) => {
        span(edge(t, -0.05, plankW / 2 - 0.05), edge(t, 0.95, plankW / 2 - 0.05), 0.1, beam);
        if (k) span(edge(posts[k - 1], 0.92, plankW / 2 - 0.05), edge(t, 0.92, plankW / 2 - 0.05), 0.07, beam);
      });
    }
  }

  /* ── Summit flag ── */
  {
    const flag = new THREE.Group();
    flag.add(new THREE.Mesh(keep(new THREE.CylinderGeometry(0.04, 0.05, 2.8, 6)), lambert("#5b5f60")).translateY(1.4));
    const cloth = new THREE.Shape();
    cloth.moveTo(0, 0);
    cloth.lineTo(1.25, -0.32);
    cloth.lineTo(0, -0.66);
    const banner = new THREE.Mesh(keep(new THREE.ShapeGeometry(cloth)), keep(new THREE.MeshLambertMaterial({ color: "#d06f2c", side: THREE.DoubleSide })));
    banner.position.set(0.03, 2.75, 0);
    flag.add(banner);
    place(flag, MARKS.flag, 1.4);
    group.add(flag);
    growers.push(h => flag.scale.set(1, Math.max(0.001, grown(MARKS.flag, h, 0.08)), 1));
    growers.push(() => (banner.rotation.y = Math.sin(performance.now() / 420) * 0.25));
  }

  /* ── Cloud banks around the upper mountain ── */
  const clouds: { sprite: THREE.Sprite; x: number; speed: number }[] = [];
  {
    const tex = keep(puffTexture());
    const count = lowPower ? 14 : 30;
    for (let i = 0; i < count; i++) {
      const s = 0.42 + rand() * 0.56;
      const f = frameAt(trail, s);
      const side = (rand() < 0.5 ? -1 : 1) * (12 + rand() * 70);
      const mat = keep(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.5 + rand() * 0.3, depthWrite: false, fog: true }));
      const sp = new THREE.Sprite(mat);
      const x = f.p.x + f.right.x * side;
      sp.position.set(x, f.p.y + 3 + rand() * 14, f.p.z + f.right.z * side);
      sp.scale.set(26 + rand() * 30, 10 + rand() * 8, 1);
      group.add(sp);
      clouds.push({ sprite: sp, x, speed: 0.3 + rand() * 0.6 });
    }
  }

  /* ── Far ranges: three layers of peaks dissolving into the haze, one great peak at the centre ── */
  const ranges: THREE.ShaderMaterial[] = [];
  {
    const cone = keep(new THREE.ConeGeometry(1, 1, 6, 1));
    const layers = [
      { dist: 470, count: 13, h: [70, 150], lift: 0 },
      { dist: 600, count: 11, h: [110, 210], lift: 0.3 },
      { dist: 760, count: 9, h: [150, 260], lift: 0.55 },
    ];
    for (const L of layers) {
      const mat = keep(rangeMaterial(L.lift));
      ranges.push(mat);
      for (let i = 0; i < L.count; i++) {
        const a = -Math.PI / 2 + (i / (L.count - 1) - 0.5) * 2.6 + (rand() - 0.5) * 0.12;
        const hgt = L.h[0] + rand() * (L.h[1] - L.h[0]);
        const peak = new THREE.Mesh(cone, mat);
        peak.scale.set(hgt * (0.85 + rand() * 0.5), hgt, hgt * (0.85 + rand() * 0.5));
        peak.position.set(Math.cos(a) * L.dist, hgt / 2 - 60, -260 + Math.sin(a) * L.dist);
        peak.rotation.y = rand() * Math.PI;
        group.add(peak);
      }
    }
    // The great peak, straight ahead of the whole climb, snow on its crown.
    const mat = keep(rangeMaterial(0.15));
    mat.uniforms.snow.value = 1;
    ranges.push(mat);
    const great = new THREE.Mesh(cone, mat);
    great.scale.set(300, 340, 260);
    great.position.set(40, 340 / 2 - 70, -880);
    group.add(great);
  }

  return {
    group,
    update: (h, time, colors) => {
      growers.forEach(g => g(h));
      clouds.forEach(c => (c.sprite.position.x = c.x + Math.sin(time * 0.05 * c.speed) * 6));
      ranges.forEach(m => {
        m.uniforms.top.value.copy(colors.range);
        m.uniforms.horizon.value.copy(colors.horizon);
      });
    },
    dispose: () => disposables.forEach(d => d.dispose()),
  };
}
