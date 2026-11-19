import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/*
 * The hiker, built from primitives in units where the figure is 1 tall
 * (feet at y = 0). It faces -Z, into the painting, so the camera mostly sees
 * the backpack. Cel shading (MeshToonMaterial with a three-step ramp) keeps it
 * in the same visual language as the painted scenes.
 *
 * Joint pivots are plain Groups, so the pose code only ever sets rotations:
 *
 *   root ─ body (bob, lean, twist)
 *            ├─ hips ─ thigh.L/R ─ shin.L/R ─ boot.L/R
 *            └─ torso ─ head (hat)
 *                     ├─ pack
 *                     └─ upperArm.L/R ─ forearm.L/R ─ hand (pole on the right)
 */

export type HikerRig = {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  thigh: [THREE.Group, THREE.Group];
  shin: [THREE.Group, THREE.Group];
  upperArm: [THREE.Group, THREE.Group];
  forearm: [THREE.Group, THREE.Group];
  pole: THREE.Group;
  shadow: THREE.Mesh;
  materials: THREE.Material[];
  dispose: () => void;
};

const PALETTE = {
  jacket: "#2f5866",
  jacketDark: "#1f3c47",
  pants: "#3b4038",
  boot: "#4b3324",
  sole: "#231a14",
  skin: "#c68d69",
  hat: "#b7a27a",
  pack: "#d06f2c",
  packDark: "#9c4e1e",
  roll: "#5d7046",
  strap: "#2a2b27",
  hair: "#2a1d16",
  pole: "#c9ccc8",
  grip: "#202326",
};

function rampTexture() {
  const data = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(10,20,14,0.55)");
    grad.addColorStop(0.55, "rgba(10,20,14,0.22)");
    grad.addColorStop(1, "rgba(10,20,14,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildHiker(): HikerRig {
  const ramp = rampTexture();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const mats = new Map<string, THREE.MeshToonMaterial>();
  const mat = (color: string) => {
    let m = mats.get(color);
    if (!m) {
      m = new THREE.MeshToonMaterial({ color, gradientMap: ramp });
      mats.set(color, m);
      materials.push(m);
    }
    return m;
  };
  const geo = <G extends THREE.BufferGeometry>(g: G) => (geometries.push(g), g);
  const mesh = (g: THREE.BufferGeometry, color: string, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(g, mat(color));
    m.position.set(x, y, z);
    return m;
  };
  const pivot = (parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };
  /** A capsule hanging down from its pivot: radius r, overall length len. */
  const limb = (r: number, len: number, color: string, sx = 1, sz = 1) => {
    const m = mesh(geo(new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 4, 10)), color, 0, -len / 2 + r * 0.3);
    m.scale.set(sx, 1, sz);
    return m;
  };

  const root = new THREE.Group();
  const body = pivot(root, 0, 0);
  const hips = pivot(body, 0, 0.5);

  // Pelvis
  hips.add(mesh(geo(new RoundedBoxGeometry(0.17, 0.09, 0.11, 2, 0.035)), PALETTE.pants, 0, 0.01));

  // Legs: thigh → shin → boot
  const thigh: THREE.Group[] = [];
  const shin: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const t = pivot(hips, side * 0.052, -0.02);
    t.add(limb(0.04, 0.24, PALETTE.pants));
    const s = pivot(t, 0, -0.22);
    s.add(limb(0.033, 0.23, PALETTE.pants));
    // Gaiter cuff + boot
    s.add(mesh(geo(new THREE.CylinderGeometry(0.041, 0.043, 0.035, 10)), PALETTE.jacketDark, 0, -0.19));
    const boot = pivot(s, 0, -0.225);
    boot.add(mesh(geo(new RoundedBoxGeometry(0.072, 0.05, 0.13, 2, 0.02)), PALETTE.boot, 0, -0.01, -0.025));
    boot.add(mesh(geo(new RoundedBoxGeometry(0.076, 0.016, 0.136, 1, 0.006)), PALETTE.sole, 0, -0.034, -0.025));
    thigh.push(t);
    shin.push(s);
  }

  // Torso: a jacket with a little shape, collar, and a hip belt
  const torso = pivot(hips, 0, 0.03);
  const chest = mesh(geo(new THREE.CapsuleGeometry(0.1, 0.14, 4, 12)), PALETTE.jacket, 0, 0.15);
  chest.scale.set(1.08, 1, 0.66);
  torso.add(chest);
  torso.add(mesh(geo(new THREE.CylinderGeometry(0.05, 0.062, 0.04, 12)), PALETTE.jacketDark, 0, 0.3));
  const hem = mesh(geo(new THREE.CylinderGeometry(0.103, 0.1, 0.05, 14)), PALETTE.jacketDark, 0, 0.03);
  hem.scale.z = 0.7;
  torso.add(hem);

  // Head, neck, hat
  const head = pivot(torso, 0, 0.33);
  head.add(mesh(geo(new THREE.CylinderGeometry(0.026, 0.03, 0.04, 8)), PALETTE.skin, 0, 0.01));
  const skull = mesh(geo(new THREE.SphereGeometry(0.058, 16, 12)), PALETTE.skin, 0, 0.07);
  skull.scale.set(0.95, 1.05, 1);
  head.add(skull);
  // Hair: a slightly larger sphere set back, so the back of the head reads as hair, the face as skin.
  const hair = mesh(geo(new THREE.SphereGeometry(0.061, 16, 12)), PALETTE.hair, 0, 0.076, 0.012);
  hair.scale.set(0.98, 1.02, 1);
  head.add(hair);
  // Collar of a rolled hood behind the neck
  const hood = mesh(geo(new THREE.TorusGeometry(0.05, 0.018, 8, 16)), PALETTE.jacketDark, 0, 0.012, 0.012);
  hood.rotation.x = Math.PI / 2 - 0.25;
  head.add(hood);
  head.add(mesh(geo(new THREE.CylinderGeometry(0.105, 0.11, 0.008, 20)), PALETTE.hat, 0, 0.098));
  head.add(mesh(geo(new THREE.CylinderGeometry(0.056, 0.064, 0.05, 16)), PALETTE.hat, 0, 0.122));
  head.add(mesh(geo(new THREE.CylinderGeometry(0.0645, 0.0645, 0.012, 16)), PALETTE.packDark, 0, 0.104));

  // Backpack on the back (+Z): body, lid, front pocket, sleeping roll, side bottles, straps
  const pack = pivot(torso, 0, 0.16, 0.085);
  pack.add(mesh(geo(new RoundedBoxGeometry(0.2, 0.27, 0.12, 3, 0.04)), PALETTE.pack, 0, 0.02, 0.03));
  pack.add(mesh(geo(new RoundedBoxGeometry(0.19, 0.06, 0.13, 2, 0.025)), PALETTE.packDark, 0, 0.16, 0.035));
  pack.add(mesh(geo(new RoundedBoxGeometry(0.14, 0.12, 0.04, 2, 0.015)), PALETTE.packDark, 0, -0.03, 0.1));
  pack.add(mesh(geo(new THREE.BoxGeometry(0.12, 0.012, 0.004)), "#e8e1c8", 0, 0.02, 0.121));
  const roll = mesh(geo(new THREE.CylinderGeometry(0.045, 0.045, 0.24, 14)), PALETTE.roll, 0, -0.14, 0.04);
  roll.rotation.z = Math.PI / 2;
  pack.add(roll);
  for (const side of [-1, 1]) {
    pack.add(mesh(geo(new THREE.CylinderGeometry(0.024, 0.024, 0.09, 10)), PALETTE.jacketDark, side * 0.112, -0.05, 0.03));
    // Shoulder strap over the top of the shoulder
    const strap = mesh(geo(new RoundedBoxGeometry(0.03, 0.12, 0.05, 1, 0.01)), PALETTE.strap, side * 0.06, 0.15, -0.03);
    strap.rotation.x = 0.5;
    pack.add(strap);
  }
  pack.add(mesh(geo(new RoundedBoxGeometry(0.22, 0.03, 0.06, 1, 0.012)), PALETTE.strap, 0, -0.1, -0.055));

  // Arms: shoulder → upper arm → forearm → hand
  const upperArm: THREE.Group[] = [];
  const forearm: THREE.Group[] = [];
  let pole = new THREE.Group();
  for (const side of [-1, 1]) {
    const u = pivot(torso, side * 0.122, 0.25);
    u.add(limb(0.034, 0.17, PALETTE.jacket));
    const f = pivot(u, 0, -0.155);
    f.add(limb(0.029, 0.15, PALETTE.jacket));
    const hand = pivot(f, 0, -0.15);
    hand.add(mesh(geo(new THREE.SphereGeometry(0.027, 10, 8)), PALETTE.skin));
    if (side === 1) {
      // Trekking pole, held in the right hand
      pole = pivot(hand, 0, 0);
      pole.add(mesh(geo(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 8)), PALETTE.grip, 0, 0.005));
      pole.add(mesh(geo(new THREE.CylinderGeometry(0.0055, 0.0045, 0.5, 6)), PALETTE.pole, 0, -0.26));
      pole.add(mesh(geo(new THREE.CylinderGeometry(0.016, 0.016, 0.004, 10)), PALETTE.grip, 0, -0.46));
    }
    upperArm.push(u);
    forearm.push(f);
  }

  // Ink outline (inverted hull): a back-face copy of every part pushed out along its normals,
  // the same line the painted scenes are drawn with.
  const ink = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color("#18241f") }, thickness: { value: 0.0042 } },
    vertexShader: "uniform float thickness; void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * thickness, 1.0); }",
    fragmentShader: "uniform vec3 color; void main() { gl_FragColor = vec4(color, 1.0); }",
    side: THREE.BackSide,
  });
  materials.push(ink);
  const solids: THREE.Mesh[] = [];
  root.traverse(o => { if (o instanceof THREE.Mesh) solids.push(o); });
  for (const m of solids) m.add(new THREE.Mesh(m.geometry, ink));

  // Soft contact shadow, drawn under everything
  const shadowTex = shadowTexture();
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  materials.push(shadowMat);
  const shadow = new THREE.Mesh(geo(new THREE.PlaneGeometry(0.5, 0.5)), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  shadow.renderOrder = -1;
  root.add(shadow);

  return {
    root,
    body,
    torso,
    head,
    thigh: thigh as [THREE.Group, THREE.Group],
    shin: shin as [THREE.Group, THREE.Group],
    upperArm: upperArm as [THREE.Group, THREE.Group],
    forearm: forearm as [THREE.Group, THREE.Group],
    pole,
    shadow,
    materials,
    dispose: () => {
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      ramp.dispose();
      shadowTex.dispose();
    },
  };
}

/** Everything the pose layer can ask of the figure. */
export type Pose = {
  /** Walk cycle phase, radians. */
  phase: number;
  /** 0 standing, 1 full stride. */
  stride: number;
  /** Forward lean for climbing, radians. */
  lean: number;
  /** 0..1: right arm raises the pole overhead. */
  cheer: number;
  /** 0..1: stands tall, left hand on hip, pole planted. */
  proud: number;
  /** Breathing clock, seconds. */
  breath: number;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function applyPose(rig: HikerRig, p: Pose) {
  const s = clamp01(p.stride);
  const swing = Math.sin(p.phase);
  const still = 1 - s;
  const breathe = Math.sin(p.breath * 1.6) * 0.006 * (0.4 + still);

  // Legs: thighs swing opposite; each knee bends as its leg passes under the body.
  for (let k = 0; k < 2; k++) {
    const ph = p.phase + (k === 0 ? 0 : Math.PI);
    rig.thigh[k].rotation.x = 0.48 * s * Math.sin(ph);
    rig.shin[k].rotation.x = -0.75 * s * Math.max(0, Math.sin(ph - 1.1)) - 0.05 * s;
    rig.thigh[k].rotation.z = 0;
  }
  // A proud stance: feet a little apart.
  rig.thigh[0].rotation.z = -0.07 * p.proud;
  rig.thigh[1].rotation.z = 0.07 * p.proud;

  // Body: bob twice per cycle, lean into the slope, a little counter-twist.
  rig.body.position.y = Math.abs(swing) * 0.014 * s + breathe;
  rig.body.rotation.x = -p.lean * 0.6;
  rig.torso.rotation.x = -p.lean * 0.5 - 0.04 * s + 0.05 * p.proud;
  rig.torso.rotation.y = 0.08 * swing * s;
  rig.head.rotation.x = p.lean * 0.7 + 0.05 * s - 0.12 * p.proud - 0.1 * p.cheer;
  rig.head.rotation.y = -0.06 * swing * s;

  // Arms swing against the legs. Left: walk swing → hand on hip. Right: swing → pole overhead.
  const armSwing = 0.42 * s * swing;
  const [ul, ur] = rig.upperArm;
  const [fl, fr] = rig.forearm;

  ul.rotation.x = -armSwing * (1 - p.proud);
  ul.rotation.z = -0.1 - 0.62 * p.proud;
  fl.rotation.x = 0.25 * s * (1 - p.proud) + 0.1;
  fl.rotation.z = 1.85 * p.proud;

  const up = clamp01(p.cheer);
  ur.rotation.x = armSwing * (1 - up) * (1 - p.proud) + 0.25 * p.proud;
  ur.rotation.z = 0.1 + 2.55 * up + 0.06 * p.proud;
  fr.rotation.x = 0.3 * s * (1 - up) + 0.15 - 0.15 * up;
  fr.rotation.z = 0.2 * up;

  // The pole trails behind the hand while walking, points skyward when cheering, plants when proud.
  rig.pole.rotation.x = -0.35 * s * (1 - up) + 0.1 * p.proud;
  rig.pole.rotation.z = -0.05 - 0.2 * p.proud;
}
