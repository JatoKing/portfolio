import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Assets, Kit, INK, canvasTexture } from "./kit";

/*
 * The nine landmarks around the core: five data sources and four outcome facilities.
 * Each is built in its own frame on a lot centred at the origin, front (+z) toward the
 * core; the world places and turns it. Static parts go on the kit's root and are merged
 * later; anything that moves goes on `kit.live`.
 */

export interface Landmark {
  kit: Kit;
  /** Height above the lot where its label sits. */
  top: number;
  /** From the landmark's centre to the front of its lot, where its route begins. */
  reach: number;
  tick?: (t: number, dt: number, camera: THREE.Camera) => void;
  /** A data packet has arrived from, or for, this landmark. */
  ping?: () => void;
}

/** Top of a lot. */
const G = 0.14;
const TAU = Math.PI * 2;

/** A 2D outline extruded along z, centred on z = 0. */
function prism(a: Assets, key: string, pts: [number, number][], depth: number) {
  return a.geo(`p${key}`, () =>
    new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), { depth, bevelEnabled: false })
      .translate(0, 0, -depth / 2));
}

const gable = (a: Assets, w: number, h: number, d: number) =>
  prism(a, `gable${w},${h},${d}`, [[-w / 2, 0], [w / 2, 0], [0, h]], d);

/**
 * Translucent hologram material. Single pass: three would otherwise draw a transparent
 * double-sided material twice (back faces, then front), recompiling-checking its shader
 * on each pass, every frame. These shapes are thin, so one pass looks the same.
 */
const holo = (k: Kit, color: number, opacity = 0.5, p: THREE.MeshBasicMaterialParameters = {}) =>
  k.basic(color, { transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true, ...p });

/** Status lamp: a steady blink, and a flash when data moves. */
function blinker(lamp: THREE.Object3D, phase: number) {
  let flash = 0;
  return {
    tick(t: number, dt: number) {
      flash = Math.max(0, flash - dt * 2.2);
      lamp.scale.setScalar((Math.sin(t * 2.4 + phase) > 0.1 ? 1 : 0.55) + flash * 0.8);
    },
    ping() { flash = 1; },
  };
}

/* ─── Data sources ────────────────────────────────────────── */

function flagTexture(a: Assets) {
  // Jalur Gemilang: 14 stripes, the canton over the top eight, crescent and 14-point star.
  return canvasTexture(a, 280, 140, ctx => {
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 ? "#ffffff" : "#cc0001";
      ctx.fillRect(0, i * 10, 280, 10);
    }
    ctx.fillStyle = "#010066";
    ctx.fillRect(0, 0, 140, 80);
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath(); ctx.arc(54, 40, 27, 0, TAU); ctx.fill();
    ctx.fillStyle = "#010066";
    ctx.beginPath(); ctx.arc(62, 40, 23, 0, TAU); ctx.fill();
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath();
    for (let i = 0; i < 28; i++) {
      const r = i % 2 ? 9 : 22, ang = -Math.PI / 2 + (i * Math.PI) / 14;
      ctx.lineTo(100 + r * Math.cos(ang), 40 + r * Math.sin(ang));
    }
    ctx.closePath(); ctx.fill();
  });
}

/** Federal / State Government: a domed administrative complex behind a colonnade. */
export function government(a: Assets): Landmark {
  const k = new Kit(a, 0x2a4fa8);
  const { m } = k;
  const gold = k.std(INK.gold, { roughness: 0.3, metalness: 0.5 });
  k.lot(8.4, 7.2);

  k.box(7.4, 0.5, 4.8, m.wall2, 0, G, -0.5);
  for (let i = 0; i < 3; i++) k.box(3.4, (0.5 * (3 - i)) / 3, 0.26, m.wall2, 0, G, 2.03 + i * 0.26);
  const y1 = G + 0.5;

  // Hall behind a colonnade, crowned by a drum and dome
  k.box(3.4, 2.1, 2.8, m.wall, 0, y1, -0.7);
  for (let i = 0; i < 6; i++) k.cyl(0.1, 1.8, m.wall, -1.5 + i * 0.6, y1, 1.05, { seg: 10 });
  k.box(3.7, 0.3, 0.75, m.wall, 0, y1 + 1.8, 0.95);
  const y2 = y1 + 2.1;
  k.cyl(1.25, 0.62, m.wall2, 0, y2, -0.7, { seg: 32 });
  k.cyl(1.38, 0.1, m.trim, 0, y2 + 0.62, -0.7, { seg: 32 });
  const domeY = y2 + 0.72;
  k.mesh(a.geo("govDome", () => new THREE.SphereGeometry(1.25, 32, 12, 0, TAU, 0, Math.PI / 2)), m.accent, 0, domeY, -0.7, { edges: false });
  k.cyl(0.05, 0.5, gold, 0, domeY + 1.2, -0.7, { seg: 8, edges: false });
  k.mesh(a.geo("finial", () => new THREE.SphereGeometry(0.13, 12, 8)), gold, 0, domeY + 1.78, -0.7, { edges: false });

  // Wings with ribbon windows
  for (const s of [-1, 1]) {
    const x = s * 2.75;
    k.box(2.0, 1.5, 3.4, m.wall, x, y1, -0.8);
    for (const r of [0.3, 0.85]) k.box(1.6, 0.32, 0.06, m.glass, x, y1 + r, 0.93, { edges: false });
    k.box(2.1, 0.12, 3.5, m.trim, x, y1 + 1.5, -0.8);
  }

  // Flag on a tall mast, waving
  k.cyl(0.03, 3.3, m.trim, -3.5, G, 2.7, { seg: 6, edges: false });
  const flagGeo = a.own(new THREE.PlaneGeometry(0.9, 0.45, 10, 3).translate(0.45, 0, 0));
  const rest = Float32Array.from(flagGeo.attributes.position.array);
  const flag = k.mesh(flagGeo, k.basic(0xffffff, { map: flagTexture(a), side: THREE.DoubleSide }), -3.47, G + 3.04, 2.7, { edges: false, parent: k.live });

  const lamp = blinker(k.beacon(2.75, y1 + 1.62, -1.9), 0);
  for (const [x, z] of [[-3.6, -2.9], [3.6, -2.9], [3.5, 2.7], [-2.4, 2.9]]) k.tree(x, z, 1.1);

  return {
    kit: k, top: domeY + 2.2, reach: 3.6,
    tick(t, dt) {
      lamp.tick(t, dt);
      const pos = flag.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const x = rest[i * 3];
        pos.setZ(i, Math.sin(x * 5.5 - t * 3.4) * 0.08 * x);
      }
      pos.needsUpdate = true;
    },
    ping: lamp.ping,
  };
}

/** Local Authorities: a council hall with a clock tower and a fountain plaza. */
export function localAuthority(a: Assets): Landmark {
  const k = new Kit(a, 0x3a63e6);
  const { m } = k;
  k.lot(8, 7);

  k.box(5.2, 0.3, 3.4, m.wall2, -0.8, G, -0.7);
  const roof = k.bands(4.8, 3, 2, -0.8, G + 0.3, -0.7, { floorH: 0.62 });
  k.box(1.9, 0.1, 1.0, m.wall, -0.8, G + 1.02, 1.25);
  for (const x of [-1.55, -0.05]) k.cyl(0.05, 0.88, m.wall, x, G + 0.14, 1.6, { seg: 8 });

  // Clock tower
  const tx = 2.3, tz = -0.9;
  k.box(1.2, 4.4, 1.2, m.wall, tx, G, tz);
  k.box(0.3, 3.3, 0.04, m.glass, tx, G + 0.7, tz + 0.61, { edges: false });
  k.box(1.38, 0.95, 1.38, m.wall2, tx, G + 4.4, tz);
  k.mesh(a.cyl(0, 1.02, 1.0, 4), m.accent, tx, G + 5.35, tz).rotation.y = Math.PI / 4;
  const faceGeo = a.geo("clockFace", () => new THREE.CircleGeometry(0.34, 32));
  const hourGeo = a.box(0.05, 0.19, 0.02), minGeo = a.box(0.035, 0.28, 0.02);
  const hands: { h: THREE.Mesh; mn: THREE.Mesh }[] = [];
  for (const [nx, nz] of [[0, 1], [1, 0], [-1, 0]]) {
    const face = new THREE.Group();
    face.position.set(tx + nx * 0.7, G + 4.87, tz + nz * 0.7);
    face.rotation.y = Math.atan2(nx, nz);
    k.live.add(face);
    k.mesh(faceGeo, m.wall, 0, 0, 0, { parent: face, shadow: false });
    const h = k.mesh(hourGeo, m.navy, 0, 0, 0.01, { parent: face, edges: false, shadow: false });
    const mn = k.mesh(minGeo, m.navy, 0, 0, 0.02, { parent: face, edges: false, shadow: false });
    hands.push({ h, mn });
  }

  // Fountain plaza
  k.cyl(0.8, 0.2, m.wall2, -2.9, G, 2.1, { seg: 28 });
  k.cyl(0.66, 0.04, m.water, -2.9, G + 0.17, 2.1, { seg: 28, edges: false });
  const jet = k.cyl(0.05, 0.5, k.basic(0xbfe2ff, { transparent: true, opacity: 0.8 }), -2.9, G + 0.2, 2.1, { seg: 8, edges: false, parent: k.live });

  const lamp = blinker(k.beacon(-2.6, roof, -1.7), 1.3);
  for (const [x, z] of [[-3.5, -2.8], [3.5, 2.6], [1.1, 2.7], [3.6, -2.7]]) k.tree(x, z);

  return {
    kit: k, top: G + 6.6, reach: 3.5,
    tick(t, dt) {
      lamp.tick(t, dt);
      const d = new Date();
      const mins = d.getMinutes() + d.getSeconds() / 60;
      for (const { h, mn } of hands) {
        mn.rotation.z = -(mins / 60) * TAU;
        h.rotation.z = -(((d.getHours() % 12) + mins / 60) / 12) * TAU;
      }
      jet.scale.y = 0.85 + Math.sin(t * 5) * 0.15;
    },
    ping: lamp.ping,
  };
}

/** Statutory Bodies: a finned glass rotunda with an office annex. */
export function statutory(a: Assets): Landmark {
  const k = new Kit(a, 0x7b6cf0);
  const { m } = k;
  k.lot(8, 7);

  k.box(6.4, 0.36, 4.6, m.wall2, 0, G, -0.4);
  const cx = 1.0, cz = -0.5, R = 1.9, H = 3.6, y0 = G + 0.36;
  k.cyl(R - 0.1, H, m.glass, cx, y0, cz, { seg: 40, edges: false });
  for (let i = 0; i <= 4; i++) k.cyl(R + 0.02, 0.1, m.wall, cx, y0 + i * 0.9 - (i ? 0.1 : 0), cz, { seg: 40 });
  // Vertical fins around the drum, as one mesh
  const fins = a.geo("fins", () => mergeGeometries(Array.from({ length: 28 }, (_, i) => {
    const ang = (i / 28) * TAU;
    return new THREE.BoxGeometry(0.05, H, 0.3)
      .translate(0, H / 2, R + 0.08)
      .rotateY(ang);
  })));
  k.mesh(fins, m.wall, cx, y0, cz, { edges: false });
  k.cyl(R + 0.45, 0.22, m.accent, cx, y0 + H, cz, { seg: 40 });
  k.cyl(0.6, 0.32, m.wall2, cx, y0 + H + 0.22, cz, { seg: 20 });
  const dish = new THREE.Group();
  dish.position.set(cx, y0 + H + 0.54, cz);
  k.live.add(dish);
  k.cyl(0.03, 0.3, m.trim, 0, 0, 0, { parent: dish, edges: false, shadow: false, seg: 6 });
  const bowl = k.mesh(a.geo("dish", () => new THREE.SphereGeometry(0.32, 16, 6, 0, TAU, 0, 1.0)), m.wall, 0, 0.62, 0, { parent: dish, edges: false, shadow: false });
  bowl.rotation.x = Math.PI * 0.75;

  // Annex, joined to the rotunda by an entrance canopy
  const annexTop = k.bands(2.6, 3.2, 3, -2.0, y0, -0.3, { floorH: 0.5 });
  k.box(1.8, 0.12, 1.4, m.wall, -0.4, y0 + 1.0, 1.0);
  k.box(1.2, 0.08, 0.05, m.accent, -0.4, y0 + 0.9, 1.72, { edges: false });

  const lamp = blinker(k.beacon(-2.6, annexTop, -1.3), 2.1);
  for (const [x, z] of [[-3.4, 2.6], [3.4, 2.6], [3.5, -2.8], [-3.5, -2.8]]) k.tree(x, z);

  return {
    kit: k, top: y0 + H + 1.6, reach: 3.5,
    tick(t, dt) {
      lamp.tick(t, dt);
      dish.rotation.y = t * 0.35;
    },
    ping: lamp.ping,
  };
}

/** Organisations: a corporate campus of two glass towers on a podium. */
export function organisations(a: Assets): Landmark {
  const k = new Kit(a, 0x14a3b8);
  const { m } = k;
  k.lot(8, 7);

  const pod = k.bands(5.8, 3.4, 2, 0, G, -0.5, { floorH: 0.52 });
  const aTop = k.bands(2.2, 2.2, 8, -1.3, pod, -0.9, { floorH: 0.54, glass: m.glassDeep });
  k.box(1.5, 0.55, 1.5, m.wall, -1.3, aTop, -0.9);
  k.cyl(0.035, 1.1, m.trim, -1.3, aTop + 0.55, -0.9, { seg: 6, edges: false });
  const bTop = k.bands(1.9, 1.9, 5, 1.5, pod, -0.6, { floorH: 0.54 });
  k.box(0.6, 0.28, 0.5, m.trim, 1.2, bTop, -0.8);
  k.box(0.5, 0.28, 0.5, m.trim, 1.9, bTop, -0.4);
  k.box(2.4, 0.3, 0.06, m.accent, 0, G + 0.62, 1.23, { edges: false });

  const staff = k.std(0x6c7fa8);
  k.person(staff, -2.6, 2.2);
  k.person(m.accent, -2.2, 2.5);
  k.person(m.navy, 2.4, 2.1);

  const lamp = blinker(k.beacon(1.5, bTop + 0.28, -1.2), 0.7);
  for (const [x, z] of [[-3.5, 2.7], [3.5, 2.7], [3.5, -2.8], [-3.5, -2.8], [0.6, 2.8]]) k.tree(x, z, 0.95);

  return { kit: k, top: aTop + 2.1, reach: 3.5, tick: lamp.tick, ping: lamp.ping };
}

/** Citizens: a neighbourhood of flats, terrace and detached houses, a park and a road. */
export function citizens(a: Assets): Landmark {
  const k = new Kit(a, 0xec8a6f);
  const { m } = k;
  k.lot(9.6, 7.8);
  const tile = m.accent, tile2 = k.std(0xd9735e, { roughness: 0.6 }), teal = k.std(0x57b5ae, { roughness: 0.6 });

  // Flats with balconies
  const flatsTop = k.bands(2.2, 1.5, 5, -3.2, G, -2.1, { floorH: 0.44 });
  for (let i = 1; i <= 4; i++) k.box(1.9, 0.06, 0.3, m.wall, -3.2, G + i * 0.44, -1.2);

  // Terrace row: four units under alternating roofs
  for (let i = 0; i < 4; i++) {
    const x = -0.9 + i * 0.98;
    k.box(0.96, 0.72, 1.3, m.wall, x, G, -2.3);
    k.box(0.22, 0.42, 0.04, m.navy, x - 0.2, G, -1.63, { edges: false });
    k.box(0.32, 0.22, 0.04, m.glass, x + 0.2, G + 0.3, -1.63, { edges: false });
    k.mesh(gable(a, 1.5, 0.46, 1.02), i % 2 ? tile2 : tile, x, G + 0.72, -2.3).rotation.y = Math.PI / 2;
  }

  // Detached houses
  for (const [x, z, r] of [[1.6, 0.6, 0.2], [2.9, -0.4, -0.1]] as const) {
    const g = new THREE.Group();
    g.position.set(x, G, z);
    g.rotation.y = r;
    k.root.add(g);
    k.box(1.1, 0.75, 1.0, m.wall, 0, 0, 0, { parent: g });
    k.mesh(gable(a, 1.3, 0.5, 1.22), teal, 0, 0.75, 0, { parent: g });
    k.box(0.22, 0.42, 0.04, m.navy, 0.2, 0, 0.51, { parent: g, edges: false });
  }

  // Park with a footpath loop and a gazebo
  const park = new THREE.Vector3(-2.2, 0, 1.6);
  k.mesh(a.slab(3.8, 2.8, 0.04, 0.6), k.std(0xd5ecd9, { roughness: 1 }), park.x, G, park.z, { edges: false, shadow: false }).receiveShadow = true;
  const loop = new THREE.EllipseCurve(park.x, park.z, 1.5, 1.0, 0, TAU, false, 0);
  const path = a.geo("parkPath", () => new THREE.RingGeometry(0.93, 1.07, 48).scale(1.5, 1, 1).rotateX(-Math.PI / 2));
  k.mesh(path, k.std(0xf6f1e6, { roughness: 1 }), park.x, G + 0.045, park.z, { edges: false, shadow: false }).receiveShadow = true;
  k.cyl(0.05, 0.4, m.wall, park.x, G, park.z, { seg: 6, edges: false });
  k.mesh(a.cyl(0, 0.55, 0.3, 6), tile, park.x, G + 0.4, park.z);
  for (const [x, z] of [[-3.9, 0.6], [-3.7, 2.8], [-0.5, 2.6], [-0.7, 0.4], [0.4, 2.9]]) k.tree(x, z, 0.9);

  // Road down the side, with cars both ways
  k.box(1.0, 0.02, 7.6, k.std(0xd8deeb, { roughness: 0.9 }), 4.25, G, 0, { edges: false });
  k.box(0.04, 0.025, 7.4, k.basic(0xffffff), 4.25, G, 0, { edges: false, shadow: false });

  const walkers = [0x2f6bff, 0xec8a6f, 0x14a3b8, 0x1a2f6e, 0xf2bf2a, 0x7b6cf0].map((c, i) => ({
    g: k.person(k.std(c, { roughness: 0.7 }), 0, 0, G, k.live),
    off: i / 6,
    speed: (i % 2 ? 1 : -1) * (0.035 + (i % 3) * 0.008),
  }));
  const cars = [
    { color: 0x2f6bff, x: 4.05, dir: 1, off: 0 },
    { color: 0xffffff, x: 4.45, dir: -1, off: 0.5 },
  ].map(c => {
    const g = new THREE.Group();
    k.live.add(g);
    k.box(0.34, 0.15, 0.64, k.std(c.color, { roughness: 0.4, metalness: 0.2 }), 0, 0.05, 0, { parent: g, shadow: false });
    k.box(0.28, 0.13, 0.34, m.glassDeep, 0, 0.2, -0.02, { parent: g, edges: false, shadow: false });
    g.rotation.y = c.dir > 0 ? 0 : Math.PI;
    return { ...c, g };
  });

  const lamp = blinker(k.beacon(-3.2, flatsTop, -2.6), 2.8);
  const p = new THREE.Vector2(), ahead = new THREE.Vector2();
  return {
    kit: k, top: flatsTop + 1.4, reach: 3.9,
    tick(t, dt) {
      lamp.tick(t, dt);
      for (const w of walkers) {
        const u = (((w.off + t * w.speed) % 1) + 1) % 1;
        loop.getPoint(u, p);
        w.g.position.set(p.x, G + Math.abs(Math.sin(t * 7 + w.off * 9)) * 0.025, p.y);
        loop.getPoint((u + Math.sign(w.speed) * 0.01 + 1) % 1, ahead);
        w.g.rotation.y = Math.atan2(ahead.x - p.x, ahead.y - p.y);
      }
      for (const c of cars) {
        const u = (c.off + t * 0.07) % 1;
        c.g.position.set(c.x, G, c.dir * (-3.5 + u * 7));
        c.g.scale.setScalar(Math.min(1, u * 12, (1 - u) * 12));
      }
    },
    ping: lamp.ping,
  };
}

/* ─── Outcomes ────────────────────────────────────────────── */

/** 01 Policy & Decision Centre: offices and a domed council chamber under a live chart. */
export function policyCentre(a: Assets): Landmark {
  const k = new Kit(a, 0x2f6bff);
  const { m } = k;
  k.lot(8, 7);

  k.box(5.8, 0.3, 3.8, m.wall2, 0, G, -0.4);
  const top1 = k.bands(5.2, 3.2, 2, 0, G + 0.3, -0.4, { floorH: 0.62 });
  k.cyl(1.35, 0.5, m.wall, -0.7, top1, -0.4, { seg: 36 });
  k.mesh(a.geo("chamber", () => new THREE.SphereGeometry(1.35, 36, 6, 0, TAU, 0, 0.36 * Math.PI).scale(1, 0.55, 1)), m.glass, -0.7, top1 + 0.5, -0.4, { edges: false });
  const slabTop = k.bands(1.4, 1.4, 6, 1.9, top1, -1.1, { floorH: 0.46 });
  for (let i = 0; i < 4; i++) k.box(0.5, 0.06, 0.3, m.accent, -2.1 + i * 0.6, G + 0.3, 1.25, { edges: false });

  // Hologram: a bar chart, always updating
  const chart = new THREE.Group();
  chart.position.set(-0.7, top1 + 1.75, -0.4);
  k.live.add(chart);
  const glow = holo(k, 0x2f6bff, 0.22);
  k.mesh(a.slab(2.2, 1.0, 0.03, 0.18), glow, 0, 0, 0, { parent: chart, edges: false, shadow: false });
  const barMat = holo(k, 0x2f6bff, 0.62);
  const bars = Array.from({ length: 5 }, (_, i) =>
    k.mesh(a.box(0.24, 1, 0.24), barMat, -0.72 + i * 0.36, 0.03, 0, { parent: chart, edges: false, shadow: false }));

  const lamp = blinker(k.beacon(1.9, slabTop, -1.5), 0.4);
  for (const [x, z] of [[-3.5, 2.6], [3.5, 2.6], [3.5, -2.8], [-3.5, -2.8]]) k.tree(x, z);

  return {
    kit: k, top: top1 + 3.2, reach: 3.5,
    tick(t, dt) {
      lamp.tick(t, dt);
      bars.forEach((b, i) => (b.scale.y = 0.3 + 0.75 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 1.25))));
      chart.position.y = top1 + 1.75 + Math.sin(t * 1.2) * 0.06;
    },
    ping: lamp.ping,
  };
}

function shieldGeometry() {
  const s = new THREE.Shape()
    .moveTo(0, 0.62).quadraticCurveTo(0.28, 0.5, 0.5, 0.52).lineTo(0.5, 0.05)
    .quadraticCurveTo(0.46, -0.42, 0, -0.64).quadraticCurveTo(-0.46, -0.42, -0.5, 0.05)
    .lineTo(-0.5, 0.52).quadraticCurveTo(-0.28, 0.5, 0, 0.62);
  return new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2 }).translate(0, 0, -0.04);
}

/** 02 Public Interest Centre: an open glass pavilion under a canopy, a shield above. */
export function publicCentre(a: Assets): Landmark {
  const k = new Kit(a, 0x0aa6c6);
  const { m } = k;
  k.lot(8, 7);

  k.box(6.2, 0.12, 4.6, m.wall2, 0, G, -0.3);
  const y0 = G + 0.12;
  const clear = k.std(0xc4dafc, { transparent: true, opacity: 0.42, roughness: 0.05, metalness: 0.1 });
  k.box(4.0, 1.5, 2.6, clear, 0, y0, -0.5, { shadow: false });
  k.box(5.4, 0.16, 3.8, m.wall, 0, y0 + 1.72, -0.5);
  for (const x of [-2.5, 0, 2.5]) for (const z of [-2.2, 1.2]) k.cyl(0.06, 1.72, m.wall, x, y0, z, { seg: 8 });
  k.box(5.0, 0.05, 0.05, m.accent, 0, y0 + 1.66, 1.38, { edges: false });

  const crowd = [0x2f6bff, 0x1a2f6e, 0x0aa6c6, 0xec8a6f, 0x6c7fa8].map(c => k.std(c, { roughness: 0.7 }));
  [[-1.2, -0.6], [-0.6, -0.9], [0.8, -0.3], [1.3, -0.9], [-2.6, 1.9], [2.2, 2.0], [0.3, 2.4]].forEach(([x, z], i) =>
    k.person(crowd[i % crowd.length], x, z, y0));

  // Hologram: a shield with a check, turning slowly
  const shield = new THREE.Group();
  const sy = y0 + 1.88 + 1.25;
  shield.position.set(0, sy, -0.5);
  k.live.add(shield);
  k.mesh(a.geo("shield", shieldGeometry), holo(k, 0x0aa6c6, 0.5), 0, 0, 0, { parent: shield, edges: false, shadow: false });
  const check = a.geo("check", () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.22, 0.02, 0), new THREE.Vector3(-0.07, -0.14, 0), new THREE.Vector3(0.24, 0.2, 0),
  ], false, "catmullrom", 0), 12, 0.04, 6));
  const white = k.basic(0xffffff);
  k.mesh(check, white, 0, 0, 0.09, { parent: shield, edges: false, shadow: false });
  k.mesh(check, white, 0, 0, -0.09, { parent: shield, edges: false, shadow: false });
  const ring = k.mesh(a.geo("shieldRing", () => new THREE.TorusGeometry(0.95, 0.015, 6, 64).rotateX(Math.PI / 2)), holo(k, 0x0aa6c6, 0.55), 0, sy - 0.85, -0.5, { edges: false, shadow: false, parent: k.live });

  const lamp = blinker(k.beacon(2.4, y0 + 1.88, -2.1), 1.7);
  for (const [x, z] of [[-3.5, 2.7], [3.5, 2.7], [3.6, -2.8], [-3.6, -2.8]]) k.tree(x, z);

  return {
    kit: k, top: sy + 1.1, reach: 3.5,
    tick(t, dt) {
      lamp.tick(t, dt);
      shield.rotation.y = t * 0.5;
      shield.position.y = sy + Math.sin(t * 1.3) * 0.07;
      ring.scale.setScalar(1 + Math.sin(t * 1.3) * 0.04);
    },
    ping: lamp.ping,
  };
}

/** 03 Digital Government Innovation Hub: twisted glass floors with LED bands, apps in orbit. */
export function digitalHub(a: Assets): Landmark {
  const k = new Kit(a, 0x7b6cf0);
  const { m } = k;
  k.lot(8, 7);

  k.box(5.6, 0.2, 4.2, m.wall2, 0, G, -0.4);
  let y = G + 0.2;
  for (const L of [
    { w: 3.6, d: 2.6, r: 0, x: -0.2, z: -0.4 },
    { w: 3.2, d: 2.7, r: 0.32, x: 0.2, z: -0.5 },
    { w: 2.7, d: 2.2, r: -0.24, x: -0.1, z: -0.6 },
  ]) {
    const g = new THREE.Group();
    g.position.set(L.x, y, L.z);
    g.rotation.y = L.r;
    k.root.add(g);
    k.box(L.w, 0.14, L.d, m.wall, 0, 0, 0, { parent: g });
    k.box(L.w - 0.12, 0.78, L.d - 0.12, m.glass, 0, 0.14, 0, { parent: g, edges: false });
    k.box(L.w + 0.03, 0.05, L.d + 0.03, k.light, 0, 0.84, 0, { parent: g, edges: false });
    k.box(L.w, 0.12, L.d, m.wall, 0, 0.89, 0, { parent: g });
    y += 1.01;
  }
  k.cyl(0.04, 1.2, m.trim, 0.9, y, -1.0, { seg: 6, edges: false });
  k.mesh(a.geo("hubDish", () => new THREE.SphereGeometry(0.3, 14, 6, 0, TAU, 0, 1.1)), m.wall, 0.9, y + 1.0, -1.0, { edges: false }).rotation.x = Math.PI * 0.7;

  // Hologram: app tiles circling a glowing core
  const orbit = new THREE.Group();
  const oy = y + 1.35;
  orbit.position.set(-0.3, oy, -0.6);
  k.live.add(orbit);
  k.mesh(a.geo("hubCore", () => new THREE.IcosahedronGeometry(0.32, 0)), holo(k, 0x7b6cf0, 0.75, { side: THREE.FrontSide }), 0, 0, 0, { parent: orbit, edges: false, shadow: false });
  const tileGeo = a.geo("appTile", () => a.slab(0.44, 0.44, 0.05, 0.1).clone().rotateX(Math.PI / 2).translate(0, 0.22, 0));
  const tileMat = holo(k, 0x7b6cf0, 0.55);
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * TAU;
    const tl = k.mesh(tileGeo, tileMat, Math.sin(ang) * 1.05, -0.22 + (i % 2 ? 0.18 : -0.12), Math.cos(ang) * 1.05, { parent: orbit, edges: false, shadow: false });
    tl.rotation.y = ang;
  }

  const lamp = blinker(k.beacon(-1.4, y, -1.2), 2.4);
  for (const [x, z] of [[-3.5, 2.6], [3.5, 2.6], [3.5, -2.8], [-3.5, -2.8]]) k.tree(x, z);

  return {
    kit: k, top: oy + 1.0, reach: 3.5,
    tick(t, dt) {
      lamp.tick(t, dt);
      orbit.rotation.y = t * 0.45;
      orbit.position.y = oy + Math.sin(t * 1.1) * 0.06;
    },
    ping: lamp.ping,
  };
}

/** 04 Research & Analytics Centre: a sawtooth-roofed lab, an observatory and a data globe. */
export function researchCentre(a: Assets): Landmark {
  const k = new Kit(a, 0x4458d8);
  const { m } = k;
  k.lot(8, 7);

  const lx = -1.1, lz = -0.4;
  k.box(4.3, 1.15, 2.6, m.wall, lx, G, lz);
  k.box(3.9, 0.38, 0.06, m.glass, lx, G + 0.42, lz + 1.31, { edges: false });
  const saw = prism(a, "saw", [[0, 0], [1.05, 0], [0, 0.5]], 2.6);
  for (let i = 0; i < 4; i++) {
    const x = lx - 2.1 + i * 1.05;
    k.mesh(saw, m.wall2, x, G + 1.15, lz);
    k.box(0.04, 0.46, 2.5, m.glass, x - 0.02, G + 1.15, lz, { edges: false });
  }

  // Observatory, its dome turning slowly
  const ox = 2.0, oz = -0.6;
  k.cyl(1.2, 1.0, m.wall2, ox, G, oz, { seg: 32 });
  const dome = new THREE.Group();
  dome.position.set(ox, G + 1.0, oz);
  k.live.add(dome);
  k.mesh(a.geo("obsDome", () => new THREE.SphereGeometry(1.2, 32, 12, 0, TAU, 0, Math.PI / 2)), m.wall, 0, 0, 0, { parent: dome, edges: false, shadow: false });
  k.mesh(a.geo("obsSlit", () => new THREE.SphereGeometry(1.215, 4, 12, -0.17, 0.34, 0, Math.PI / 2)), m.navy, 0, 0, 0, { parent: dome, edges: false, shadow: false });
  k.cyl(0.11, 1.5, m.trim, 0, 0, 0, { parent: dome, edges: false, shadow: false, seg: 12 }).rotation.z = Math.PI / 4;

  // Hologram: a wireframe globe with data points in orbit
  const globe = new THREE.Group();
  const gy = G + 1.65 + 1.25;
  globe.position.set(lx, gy, lz);
  k.live.add(globe);
  const color = 0x4458d8;
  k.mesh(a.geo("globe", () => new THREE.IcosahedronGeometry(0.72, 1)), holo(k, color, 0.7, { wireframe: true }), 0, 0, 0, { parent: globe, edges: false, shadow: false });
  k.mesh(a.geo("globeFill", () => new THREE.IcosahedronGeometry(0.7, 2)), holo(k, color, 0.12), 0, 0, 0, { parent: globe, edges: false, shadow: false });
  const orbit = new THREE.Group();
  orbit.rotation.x = 0.45;
  globe.add(orbit);
  k.mesh(a.geo("globeRing", () => new THREE.TorusGeometry(1.05, 0.012, 6, 72).rotateX(Math.PI / 2)), holo(k, color, 0.5), 0, 0, 0, { parent: orbit, edges: false, shadow: false });
  const dotGeo = a.geo("dot", () => new THREE.SphereGeometry(0.065, 10, 8));
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * TAU;
    k.mesh(dotGeo, k.light, Math.cos(ang) * 1.05, 0, Math.sin(ang) * 1.05, { parent: orbit, edges: false, shadow: false });
  }

  const lamp = blinker(k.beacon(lx + 1.7, G + 1.65, lz - 1.0), 0.9);
  for (const [x, z] of [[-3.5, 2.6], [3.5, 2.6], [3.6, -2.8], [-3.6, -2.8]]) k.tree(x, z);

  return {
    kit: k, top: gy + 1.2, reach: 3.5,
    tick(t, dt) {
      lamp.tick(t, dt);
      dome.rotation.y = t * 0.12;
      globe.rotation.y = t * 0.3;
      orbit.rotation.y = -t * 0.8;
      globe.position.y = gy + Math.sin(t * 1.0) * 0.06;
    },
    ping: lamp.ping,
  };
}

export const SOURCE_BUILDERS: Record<string, (a: Assets) => Landmark> = {
  gov: government, pbt: localAuthority, statutory, org: organisations, citizens,
};
export const OUTCOME_BUILDERS: Record<string, (a: Assets) => Landmark> = {
  policy: policyCentre, public: publicCentre, digital: digitalHub, research: researchCentre,
};
