import * as THREE from "three";
import { MARKS, frameAt, type Trail } from "./story";

/*
 * Where water runs, and why. Everything here is laid out from the trail so the
 * terrain can be carved to fit it (terrain.ts) and the meshes drawn on it
 * (buildWater below):
 *
 *   river   meanders across the valley at the river stage, falling gently to
 *           one side; the trail crosses it on stepping stones
 *   falls   a stream runs across a raised plateau to the lip of a cliff, drops
 *           down the rock face into a pool, and leaves the pool as a stream
 *           winding down the valley
 */

export type Stream = {
  /** Centre line, with y at the water surface. */
  pts: THREE.Vector3[];
  width: number;
  /** Flow speed along the line (+ = toward the end of `pts`). */
  speed: number;
  /** Width of the bank the terrain eases back over. */
  bank: number;
};

export type Cliff = {
  /** Pool centre, at the water surface. */
  pool: THREE.Vector3;
  poolR: number;
  /** Unit vector from the trail out toward the cliff, and along the cliff face. */
  away: THREE.Vector3;
  along: THREE.Vector3;
  /** Height of the drop. */
  drop: number;
  /** Distance from the pool centre (along `away`) to the foot and to the lip of the face. */
  foot: number;
  lip: number;
  /** Half-width of the plateau along the face. */
  span: number;
};

export type Waters = { river: Stream; upper: Stream; lower: Stream; cliff: Cliff };

const smoothstep01 = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

export function layoutWaters(trail: Trail): Waters {
  // River: across the trail, meandering, falling gently toward the hiker's right.
  const r = frameAt(trail, MARKS.river);
  const river: Stream = { pts: [], width: 5.4, speed: 0.9, bank: 16 };
  for (let t = -160; t <= 160; t += 4) {
    const wander = Math.sin(t * 0.024) * 6 + Math.sin(t * 0.063) * 2.2;
    river.pts.push(new THREE.Vector3(
      r.p.x + r.right.x * t + r.forward.x * wander,
      r.p.y - 0.42 - t * 0.012,
      r.p.z + r.right.z * t + r.forward.z * wander,
    ));
  }

  // Falls: a cliff ahead and to the right of the trail, its face turned back toward the hiker
  // coming up the path, so the falls are seen face-on on the approach.
  const f = frameAt(trail, MARKS.falls);
  const away = f.right.clone().multiplyScalar(0.55).addScaledVector(f.forward, 0.83).normalize();
  const along = new THREE.Vector3(-away.z, 0, away.x);
  const pool = f.p.clone().addScaledVector(away, 21);
  pool.y = f.p.y - 0.45;
  const cliff: Cliff = { pool, poolR: 6.2, away, along, drop: 14, foot: 5, lip: 8.6, span: 30 };

  // Above the falls: a stream crossing the plateau to the lip.
  const upper: Stream = { pts: [], width: 3.2, speed: 1.1, bank: 6 };
  for (let t = 110; t >= 0; t -= 4) {
    const wander = Math.sin(t * 0.05) * 3 * Math.min(1, t / 30);
    upper.pts.push(pool.clone()
      .addScaledVector(away, cliff.lip + t)
      .addScaledVector(along, wander)
      .setY(pool.y + cliff.drop - 0.1 + t * 0.03));
  }

  // Below the falls: out of the pool on the trail side, then down the valley beside the path,
  // falling a little faster than the trail does so it always runs downhill.
  const lower: Stream = { pts: [], width: 4, speed: 1, bank: 8 };
  const back = f.forward.clone().multiplyScalar(-1);
  for (let t = 0; t <= 160; t += 4) {
    const turn = smoothstep01(t / 30);
    const p = pool.clone()
      .addScaledVector(away, -cliff.poolR * 0.5 - 6 * turn)
      .addScaledVector(back, t * turn)
      .addScaledVector(f.right, (6 + Math.sin(t * 0.045) * 2.5) * turn);
    lower.pts.push(p.setY(pool.y - 0.12 - t * 0.075));
  }

  return { river, upper, lower, cliff };
}

/** Distance in plan view from (x, z) to a stream's centre line, and the water level there. */
export function streamDistance(st: Stream, x: number, z: number) {
  let best = Infinity;
  let level = st.pts[0].y;
  for (let i = 0; i < st.pts.length - 1; i++) {
    const a = st.pts[i], b = st.pts[i + 1];
    const abx = b.x - a.x, abz = b.z - a.z;
    const t = Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / (abx * abx + abz * abz)));
    const dx = a.x + abx * t - x, dz = a.z + abz * t - z;
    const d = dx * dx + dz * dz;
    if (d < best) { best = d; level = a.y + (b.y - a.y) * t; }
  }
  return { d: Math.sqrt(best), level };
}

/** Pool-relative coordinates: distance out toward the cliff (a), along the face (l), from the pool centre (r). */
export function cliffCoords(c: Cliff, x: number, z: number) {
  const dx = x - c.pool.x, dz = z - c.pool.z;
  return { a: dx * c.away.x + dz * c.away.z, l: dx * c.along.x + dz * c.along.z, r: Math.hypot(dx, dz) };
}

/* ── Meshes ─────────────────────────────────────────────────────────────────── */

/** A flat ribbon along a stream's course, uv.x in metres along it. */
function streamGeometry(st: Stream) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  let run = 0;
  st.pts.forEach((p, i) => {
    const prev = st.pts[Math.max(0, i - 1)], next = st.pts[Math.min(st.pts.length - 1, i + 1)];
    const dir = new THREE.Vector3(next.x - prev.x, 0, next.z - prev.z).normalize();
    const side = new THREE.Vector3(-dir.z, 0, dir.x);
    if (i > 0) run += Math.hypot(p.x - st.pts[i - 1].x, p.z - st.pts[i - 1].z);
    for (const k of [0, 1]) {
      const off = (k - 0.5) * st.width;
      pos.push(p.x + side.x * off, p.y + 0.02, p.z + side.z * off);
      uv.push(run, k);
    }
    if (i < st.pts.length - 1) {
      // Counter-clockwise seen from above, so the surface faces the sky.
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

/** The falling sheet: from the lip it curves out and drops into the pool. uv.y 0 at the lip. */
function sheetGeometry(c: Cliff, width: number) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const rows = 28;
  for (let i = 0; i <= rows; i++) {
    const f = 1 - i / rows;                                   // 1 at the lip … 0 at the foot
    // Arcs clear of the rock: leaves the lip, lands well out from the foot of the face.
    const land = c.foot - 2;
    const a = land + (c.lip - 0.7 - land) * Math.pow(f, 2.4);
    const y = c.pool.y + (c.drop - 0.1) * f + 0.02;
    // A little wider as it falls.
    const w = width * (1 + 0.25 * (1 - f));
    for (const k of [0, 1]) {
      const l = (k - 0.5) * w;
      const p = c.pool.clone().addScaledVector(c.away, a).addScaledVector(c.along, l);
      pos.push(p.x, y, p.z);
      uv.push(k, 1 - f);
    }
    if (i < rows) {
      const b = i * 2;
      idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

export type WaterMeshes = { group: THREE.Group; update: (time: number) => void; dispose: () => void };

export function buildWater(w: Waters, materials: {
  stream: (speed: number) => THREE.ShaderMaterial;
  falls: () => THREE.ShaderMaterial;
  pool: (impact: THREE.Vector2) => THREE.ShaderMaterial;
  puff: () => THREE.Texture;
}, heightAt: (x: number, z: number) => number): WaterMeshes {
  const group = new THREE.Group();
  const timed: THREE.ShaderMaterial[] = [];
  const trash: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (trash.push(x), x);

  for (const st of [w.river, w.upper, w.lower]) {
    const mat = keep(materials.stream(st.speed));
    timed.push(mat);
    const mesh = new THREE.Mesh(keep(streamGeometry(st)), mat);
    mesh.renderOrder = 2;
    group.add(mesh);
  }

  const c = w.cliff;
  // The sheet, drawn from both sides (the camera can sit either side of it).
  const fallsMat = keep(materials.falls());
  fallsMat.side = THREE.DoubleSide;
  timed.push(fallsMat);
  const sheet = new THREE.Mesh(keep(sheetGeometry(c, 3.4)), fallsMat);
  sheet.renderOrder = 3;
  group.add(sheet);

  // The pool, turned so its local +x points at the cliff; the falls land near that edge.
  const impactA = c.foot - 2;
  const poolMat = keep(materials.pool(new THREE.Vector2(0.5 + impactA / (2 * c.poolR), 0.5)));
  timed.push(poolMat);
  const pool = new THREE.Mesh(keep(new THREE.CircleGeometry(c.poolR, 36)), poolMat);
  pool.rotation.x = -Math.PI / 2;
  const holder = new THREE.Group();
  holder.add(pool);
  holder.position.copy(c.pool).setY(c.pool.y + 0.03);
  holder.rotation.y = Math.atan2(-c.away.z, c.away.x);
  pool.renderOrder = 2;
  group.add(holder);

  // Spray rising off the impact and drifting away.
  const puff = keep(materials.puff());
  const spray = Array.from({ length: 7 }, (_, i) => {
    const sp = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: puff, transparent: true, depthWrite: false, opacity: 0 })));
    group.add(sp);
    return { sp, phase: i / 7, l: (i % 3 - 1) * 1.2 };
  });
  const foot = c.pool.clone().addScaledVector(c.away, impactA);

  // Boulders around the pool's rim and at the foot of the face.
  const stone = keep(new THREE.MeshLambertMaterial({ color: "#a9a89d", flatShading: true }));
  const rock = keep(new THREE.DodecahedronGeometry(1, 0));
  [[-0.9, 1.1, 1.2], [-0.4, 1.25, 0.8], [0.55, 1.1, 1], [1.05, 1.2, 1.4], [2.1, 0.55, 1.1], [2.3, -0.7, 0.9], [-1.6, 0.4, 1]].forEach(([ang, rr, size]) => {
    const p = c.pool.clone()
      .addScaledVector(c.away, Math.cos(ang) * c.poolR * rr)
      .addScaledVector(c.along, Math.sin(ang) * c.poolR * rr);
    const m = new THREE.Mesh(rock, stone);
    m.position.set(p.x, heightAt(p.x, p.z) + 0.1, p.z);
    m.scale.set(size * 1.2, size * 0.7, size);
    m.rotation.y = ang * 3;
    group.add(m);
  });

  return {
    group,
    update: time => {
      timed.forEach(m => (m.uniforms.time.value = time));
      spray.forEach(({ sp, phase, l }) => {
        const t = (time * 0.18 + phase) % 1;
        sp.position.copy(foot).addScaledVector(c.along, l + t * 1.5).addScaledVector(c.away, -t * 2.5);
        sp.position.y = c.pool.y + 0.6 + t * 4.5;
        sp.scale.setScalar(2.4 + t * 5);
        sp.material.opacity = Math.sin(t * Math.PI) * 0.3;
      });
    },
    dispose: () => trash.forEach(t => t.dispose()),
  };
}
