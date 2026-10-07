import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LETTERS, ORDER, TONES, type LetterDef } from "../FloatingLetters";
import { Assets, Kit, INK, canvasTexture } from "./kit";
import type { Landmark } from "./landmarks";
import { PARAMS, PROFILES, SOURCES, OUTCOMES } from "./data";

/*
 * The PADU data core: a stepped dais ringed with server racks, a stack of glass database
 * drums around a glowing column, counter-rotating rings, a ticker of the nine profile
 * parameters, and a sign carrying the PADU wordmark and the profile count. The nine
 * parameters float around it as tiles, turned to the viewer, that light up as data
 * comes in.
 */

export interface Core extends Landmark {
  /** Where each parameter tile floats (world space, index-aligned with PARAMS). */
  tiles: THREE.Vector3[];
  /** Highlight for each tile, 0–1, written by the world from hover and selection. */
  emphasis: number[];
  ping: () => void;
}

/** Radius of the dais, where the data routes connect. */
export const CORE_RADIUS = 6.4;
const TILE_R = 5.95, TILE_Y = 2.3;
const DB_BASE = 0.96, DB_H = 1.2, DB_GAP = 0.32, DB_R = 2.5;
const DB_TOP = DB_BASE + 3 * DB_H + 2 * DB_GAP;
const SIGN_Y = 9.3, SIGN_W = 8;
const TAU = Math.PI * 2;

/** Writes text with extra tracking; returns where it ends. */
function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, track: number) {
  for (const ch of text) {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + track;
  }
  return x - track;
}
function spacedWidth(ctx: CanvasRenderingContext2D, text: string, track: number) {
  return [...text].reduce((w, ch) => w + ctx.measureText(ch).width + track, -track);
}

/** The PADU wordmark from the hero's glyphs, in the logo's flat colours. */
function drawWordmark(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const advance: Record<LetterDef["key"], number> = { p: 0, a: 86, d: 178, u: 262 };
  const whole = [{ tone: "navy" as const, region: "-20,-20 120,-20 120,120 -20,120" }];
  for (const key of ORDER) {
    const l = LETTERS.find(g => g.key === key)!;
    const glyph = new Path2D(l.glyph);
    ctx.save();
    ctx.translate(x + advance[key] * s, y);
    ctx.scale(s, s);
    for (const sec of l.sections ?? whole) {
      const clip = new Path2D();
      sec.region.split(" ").forEach((pt, i) => {
        const [px, py] = pt.split(",").map(Number);
        if (i) clip.lineTo(px, py); else clip.moveTo(px, py);
      });
      ctx.save();
      ctx.clip(clip);
      ctx.fillStyle = TONES[sec.tone][2];
      ctx.fill(glyph, "evenodd");
      ctx.restore();
    }
    ctx.restore();
  }
}

function signTexture(a: Assets, sans: string, mono: string) {
  const W = 1700, H = 720;
  return canvasTexture(a, W, H, ctx => {
    ctx.beginPath();
    ctx.roundRect(10, 10, W - 20, H - 20, 56);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "rgba(255,255,255,0.95)");
    bg.addColorStop(1, "rgba(231,238,255,0.9)");
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(58,99,230,0.42)";
    ctx.stroke();

    // HUD corner ticks
    ctx.strokeStyle = "#3a63e6";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    for (const [cx, cy, sx, sy] of [[46, 46, 1, 1], [W - 46, 46, -1, 1], [46, H - 46, 1, -1], [W - 46, H - 46, -1, -1]]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy + sy * 44);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + sx * 44, cy);
      ctx.stroke();
    }

    ctx.textBaseline = "alphabetic";
    ctx.font = `600 32px ${mono}`;
    ctx.fillStyle = "#3a63e6";
    spaced(ctx, "PANGKALAN DATA UTAMA", 112, 128, 7);
    const live = "SISTEM AKTIF";
    const lw = spacedWidth(ctx, live, 6);
    ctx.fillStyle = "#1f9d5c";
    spaced(ctx, live, W - 112 - lw, 128, 6);
    ctx.beginPath();
    ctx.arc(W - 112 - lw - 26, 117, 10, 0, TAU);
    ctx.fill();

    drawWordmark(ctx, 112 - 17 * 2.3, 178, 2.3);
    ctx.font = `600 30px ${mono}`;
    ctx.fillStyle = "#5b6785";
    spaced(ctx, `${SOURCES.length} SUMBER  ·  ${PARAMS.length} PARAMETER  ·  ${OUTCOMES.length} KEBERHASILAN`, 114, 560, 4);

    ctx.fillStyle = "rgba(58,99,230,0.22)";
    ctx.fillRect(958, 180, 3, 400);

    ctx.fillStyle = "#0b1736";
    let size = 210;
    do ctx.font = `700 ${size}px ${sans}`; while (ctx.measureText(PROFILES.value).width > 590 && (size -= 6) > 90);
    ctx.fillText(PROFILES.value, 1012, 420);
    ctx.font = `600 38px ${mono}`;
    ctx.fillStyle = "#3a63e6";
    spaced(ctx, PROFILES.label.toUpperCase(), 1018, 500, 7);
  });
}

/** The nine parameters in Malay, round a band; returns the texture and its repeat. */
function tickerTexture(a: Assets, mono: string, circumferencePx: number) {
  const text = PARAMS.map(p => p.name.toUpperCase()).join("   ·   ") + "   ·   ";
  const font = `600 40px ${mono}`;
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = font;
  const w = Math.ceil(probe.measureText(text).width);
  const tex = canvasTexture(a, w, 72, ctx => {
    ctx.font = font;
    ctx.fillStyle = "#2f5be0";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, 38);
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.x = Math.max(1, Math.round(circumferencePx / w));
  return tex;
}

/** Short arcs round a circle, flat on the ground or in the air. */
function dashedRing(r: number, n: number, fill: number, tube: number) {
  return mergeGeometries(Array.from({ length: n }, (_, i) =>
    new THREE.TorusGeometry(r, tube, 4, 6, (TAU / n) * fill).rotateZ((i / n) * TAU).rotateX(Math.PI / 2)));
}

export function buildCore(a: Assets, fonts: { sans: string; mono: string }): Core {
  const k = new Kit(a, INK.flowIn);
  const { m } = k;
  const blue = INK.flowIn;

  // Rings painted on the ground round the dais
  const paint = k.basic(0xbccaf0);
  k.mesh(a.geo("coreRing", () => new THREE.RingGeometry(7.05, 7.13, 160).rotateX(-Math.PI / 2)), paint, 0, 0.012, 0, { edges: false });
  k.mesh(a.geo("coreDash", () => mergeGeometries(Array.from({ length: 64 }, (_, i) =>
    new THREE.RingGeometry(8.66, 8.76, 3, 1, (i / 64) * TAU, (TAU / 64) * 0.5).rotateX(-Math.PI / 2)))), paint, 0, 0.012, 0, { edges: false });

  // Dais: three tiers, each with a luminous rim
  const rim = k.basic(0x7ea0ff);
  let y = 0;
  for (const [r, h] of [[CORE_RADIUS, 0.34], [5.5, 0.32], [4.6, 0.3]]) {
    k.cyl(r, h, y ? m.wall : m.wall2, 0, y, 0, { seg: 72 });
    y += h;
    k.mesh(a.geo(`rim${r}`, () => new THREE.TorusGeometry(r, 0.03, 4, 144).rotateX(Math.PI / 2)), rim, 0, y, 0, { edges: false });
  }

  // Server racks on the middle tier, their LEDs blinking
  const RACKS = 12, LEDS = 8;
  const leds = new THREE.InstancedMesh(a.box(0.07, 0.05, 0.02), a.own(new THREE.MeshBasicMaterial()), RACKS * LEDS);
  const ledOn = new THREE.Color(0x4f8bff), ledLive = new THREE.Color(0x3ccf87), ledOff = new THREE.Color(0x30427a);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < RACKS; i++) {
    const ang = ((i + 0.5) / RACKS) * TAU;
    const pivot = new THREE.Group();
    pivot.position.set(Math.sin(ang) * 5.05, 0.66, Math.cos(ang) * 5.05);
    pivot.rotation.y = ang;
    k.root.add(pivot);
    k.box(0.62, 0.86, 0.4, m.wall2, 0, 0, 0, { parent: pivot });
    k.box(0.5, 0.7, 0.02, m.navy, 0, 0.08, 0.2, { parent: pivot, edges: false });
    pivot.updateMatrix();
    for (let j = 0; j < LEDS; j++) {
      dummy.position.set(-0.2 + (j % 4) * 0.135, 0.5 + Math.floor(j / 4) * 0.16, 0.225);
      dummy.updateMatrix();
      leds.setMatrixAt(i * LEDS + j, pivot.matrix.clone().multiply(dummy.matrix));
      leds.setColorAt(i * LEDS + j, ledOn);
    }
  }
  k.live.add(leds);

  // Database: three glass drums, light bands at their rims, white collars between
  const glass = k.std(0xdfe8ff, { transparent: true, opacity: 0.5, roughness: 0.06, metalness: 0.1 });
  const band = k.basic(blue);
  for (let i = 0; i < 3; i++) {
    const by = DB_BASE + i * (DB_H + DB_GAP);
    k.cyl(DB_R, DB_H, glass, 0, by, 0, { seg: 64, shadow: false });
    k.cyl(DB_R + 0.05, 0.07, band, 0, by + 0.07, 0, { seg: 64, edges: false });
    k.cyl(DB_R + 0.05, 0.07, band, 0, by + DB_H - 0.14, 0, { seg: 64, edges: false });
    if (i < 2) k.cyl(2.2, DB_GAP, m.wall, 0, by + DB_H, 0, { seg: 64 });
  }
  k.cyl(2.25, 0.28, m.wall, 0, DB_TOP, 0, { seg: 64 });
  k.cyl(1.3, 0.24, m.wall2, 0, DB_TOP + 0.28, 0, { seg: 48 });
  const capTop = DB_TOP + 0.52;

  // The glowing column inside, data rising through it, a scanner sweeping the drums
  const columnMat = a.own(new THREE.MeshBasicMaterial({ color: 0x5d8bff }));
  const columnBase = columnMat.color.clone(), columnHot = new THREE.Color(0xa9c3ff);
  k.cyl(0.85, DB_TOP - DB_BASE, columnMat, 0, DB_BASE, 0, { seg: 32, edges: false, parent: k.live });
  const emitter = k.cyl(0.55, 0.14, columnMat, 0, capTop, 0, { seg: 32, edges: false, parent: k.live });

  const N = 90;
  const seeds = Array.from({ length: N }, () => ({ a: Math.random() * TAU, r: 0.95 + Math.random() * 1.3, y: Math.random(), v: 0.5 + Math.random() * 0.7 }));
  const pts = new Float32Array(N * 3);
  const dotsGeo = a.own(new THREE.BufferGeometry());
  dotsGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  const dots = new THREE.Points(dotsGeo, a.own(new THREE.PointsMaterial({ color: 0x2f6bff, size: 0.11, transparent: true, opacity: 0.85, depthWrite: false })));
  dots.frustumCulled = false;
  k.live.add(dots);

  const scanner = k.mesh(
    a.geo("scanner", () => new THREE.CylinderGeometry(DB_R + 0.16, DB_R + 0.16, 0.1, 64, 1, true)),
    a.own(new THREE.MeshBasicMaterial({ color: blue, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true })),
    0, DB_BASE, 0, { edges: false, parent: k.live },
  );

  // Rings: gold and blue on tilted orbits, a dashed halo above
  const gold = a.own(new THREE.MeshBasicMaterial({ color: INK.gold }));
  const ringBlue = a.own(new THREE.MeshBasicMaterial({ color: 0x4f7dff }));
  const orbits = [
    { r: 3.3, tube: 0.055, mat: gold, tilt: 0.4, y: 3.0, speed: 0.32 },
    { r: 3.8, tube: 0.04, mat: ringBlue, tilt: -0.3, y: 3.4, speed: -0.22 },
  ].map(o => {
    const pivot = new THREE.Group();
    pivot.position.y = o.y;
    k.live.add(pivot);
    const ring = k.mesh(a.geo(`orbit${o.r}`, () => new THREE.TorusGeometry(o.r, o.tube, 8, 160)), o.mat, 0, 0, 0, { parent: pivot, edges: false, shadow: false });
    ring.rotation.x = Math.PI / 2 + o.tilt;
    return { pivot, speed: o.speed };
  });
  const halo = k.mesh(a.geo("halo", () => dashedRing(4.1, 36, 0.55, 0.045)), ringBlue, 0, capTop + 0.55, 0, { edges: false, shadow: false, parent: k.live });

  // Ticker of the nine parameters, round a band above the cap
  const TICK_R = 2.35, TICK_H = 0.36;
  const pxPerUnit = 72 / TICK_H;
  const ticker = tickerTexture(a, fonts.mono, TAU * TICK_R * pxPerUnit);
  k.mesh(
    a.geo("ticker", () => new THREE.CylinderGeometry(TICK_R, TICK_R, TICK_H, 96, 1, true)),
    a.own(new THREE.MeshBasicMaterial({ map: ticker, transparent: true, depthWrite: false })),
    0, capTop + 0.42, 0, { edges: false, shadow: false, parent: k.live },
  );

  // Projector light up to the sign, and the sign itself, turned to face the viewer
  k.mesh(
    a.geo("projector", () => new THREE.CylinderGeometry(2.4, 0.55, SIGN_Y - 1.7 - capTop - 0.3, 48, 1, true).translate(0, (SIGN_Y - 1.7 - capTop - 0.3) / 2, 0)),
    a.own(new THREE.MeshBasicMaterial({ color: blue, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true })),
    0, capTop + 0.3, 0, { edges: false, shadow: false, parent: k.live },
  );
  const signH = (SIGN_W * 720) / 1700;
  const sign = new THREE.Mesh(
    a.geo("sign", () => new THREE.PlaneGeometry(SIGN_W, signH)),
    a.own(new THREE.MeshBasicMaterial({ map: signTexture(a, fonts.sans, fonts.mono), transparent: true, depthWrite: false })),
  );
  sign.position.y = SIGN_Y;
  sign.rotation.order = "YXZ";
  k.live.add(sign);

  // Parameter tiles: hexagons on slim stems round the outer tier
  const hexGeo = a.geo("hex", () => new THREE.CylinderGeometry(0.5, 0.5, 0.14, 6).rotateX(Math.PI / 2).rotateZ(Math.PI / 6));
  const faceRing = a.geo("hexRing", () => new THREE.RingGeometry(0.19, 0.27, 32));
  const faceDot = a.geo("hexDot", () => new THREE.CircleGeometry(0.1, 24));
  const tiles: THREE.Vector3[] = [];
  const parts = PARAMS.map((_, i) => {
    const ang = ((110 - i * 40) * Math.PI) / 180;
    const pos = new THREE.Vector3(Math.cos(ang) * TILE_R, TILE_Y, -Math.sin(ang) * TILE_R);
    tiles.push(pos);
    k.cyl(0.2, 0.05, m.trim, pos.x, 0.34, pos.z, { seg: 16, edges: false });
    k.cyl(0.03, TILE_Y - 0.84, m.trim, pos.x, 0.34, pos.z, { seg: 6, edges: false });

    const pivot = new THREE.Group();
    pivot.position.copy(pos);
    k.live.add(pivot);
    const body = a.own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, emissive: blue, emissiveIntensity: 0 }));
    const edge = a.own(new THREE.LineBasicMaterial({ color: 0x9fb4ea, transparent: true }));
    const glow = a.own(new THREE.MeshBasicMaterial({ color: blue, transparent: true }));
    const hex = new THREE.Mesh(hexGeo, body);
    hex.add(new THREE.LineSegments(a.edgesOf(hexGeo), edge));
    const ring = new THREE.Mesh(faceRing, glow);
    const dot = new THREE.Mesh(faceDot, glow);
    ring.position.z = dot.position.z = 0.072;
    pivot.add(hex, ring, dot);

    // Link from the tile into the column, lit while the tile is active
    const beamGeo = a.own(new THREE.BufferGeometry().setFromPoints([pos, pos.clone().setLength(0.9).setY(TILE_Y)]));
    const beamMat = a.own(new THREE.LineBasicMaterial({ color: blue, transparent: true, opacity: 0 }));
    k.live.add(new THREE.Line(beamGeo, beamMat));
    return { pivot, body, edge, glow, beamMat, act: 0, phase: i * 0.7 };
  });

  const emphasis = PARAMS.map(() => 0);
  const edgeIdle = new THREE.Color(0x9fb4ea), edgeHot = new THREE.Color(blue);
  let pulse = 0, last = -1, ledClock = 0;

  return {
    kit: k,
    top: SIGN_Y + signH / 2 + 0.4,
    reach: CORE_RADIUS,
    tiles,
    emphasis,
    ping() {
      pulse = Math.min(1, pulse + 0.45);
      let i = Math.floor(Math.random() * parts.length);
      if (i === last) i = (i + 1) % parts.length;
      parts[(last = i)].act = 1;
    },
    tick(t, dt, camera) {
      pulse *= Math.exp(-dt * 2.2);
      columnMat.color.copy(columnBase).lerp(columnHot, pulse);
      emitter.scale.set(1 + pulse * 0.5, 1, 1 + pulse * 0.5);
      orbits.forEach(o => (o.pivot.rotation.y = t * o.speed));
      halo.rotation.y = t * 0.12;
      ticker.offset.x = (t * 0.012) % 1;
      scanner.position.y = DB_BASE + (0.5 - 0.5 * Math.cos(t * 0.8)) * (DB_TOP - DB_BASE - 0.1);

      // Data rising through the glass, between the column and the drum wall
      for (let i = 0; i < N; i++) {
        const s = seeds[i];
        s.y = (s.y + dt * s.v * (0.12 + pulse * 0.25)) % 1;
        pts[i * 3] = Math.cos(s.a + t * 0.3) * s.r;
        pts[i * 3 + 1] = DB_BASE + 0.05 + s.y * (DB_TOP - DB_BASE - 0.1);
        pts[i * 3 + 2] = Math.sin(s.a + t * 0.3) * s.r;
      }
      dotsGeo.attributes.position.needsUpdate = true;

      if ((ledClock += dt) > 0.14) {
        ledClock = 0;
        for (let n = 0; n < 10; n++) {
          const i = Math.floor(Math.random() * RACKS * LEDS);
          const r = Math.random();
          leds.setColorAt(i, r < 0.25 ? ledOff : r < 0.4 ? ledLive : ledOn);
        }
        leds.instanceColor!.needsUpdate = true;
      }

      parts.forEach((p, i) => {
        p.act = Math.max(0, p.act - dt * 0.8);
        const v = Math.max(p.act, emphasis[i]);
        p.body.emissiveIntensity = 0.06 + v * 0.75;
        p.edge.color.copy(edgeIdle).lerp(edgeHot, v);
        p.edge.opacity = 0.7 + v * 0.3;
        p.glow.opacity = 0.35 + v * 0.65;
        p.beamMat.opacity = v * 0.8;
        p.pivot.scale.setScalar(1 + v * 0.14);
        p.pivot.position.y = TILE_Y + Math.sin(t * 1.2 + p.phase) * 0.05;
        // Turn to the viewer, so the face (and its glow) always reads
        p.pivot.rotation.y = Math.atan2(camera.position.x - tiles[i].x, camera.position.z - tiles[i].z);
      });

      // Face the camera, leaning back a little as it rises
      sign.rotation.y = Math.atan2(camera.position.x, camera.position.z);
      const rise = Math.atan2(camera.position.y - SIGN_Y, Math.hypot(camera.position.x, camera.position.z));
      sign.rotation.x = -Math.max(0, rise) * 0.55;
      sign.position.y = SIGN_Y + Math.sin(t * 0.9) * 0.08;
    },
  };
}
