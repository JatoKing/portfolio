import * as THREE from "three";
import { frameAt, type Trail } from "./story";
import type { Ground } from "./terrain";

/*
 * Stylized grass over the meadow: thousands of small low-poly tufts (three
 * blades each), densest along the trail's edges so the path sits in the grass,
 * thinning out into the hills. One instanced mesh, one draw call. Each tuft
 * sways in the wind, roots still, tips moving, and slow gusts roll across the
 * field; walking stirs the wind a little more.
 */

function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One tuft: three slim blades fanned around the root, dark at the base, light at the tip. 1 unit tall. */
function tuftGeometry() {
  const pos: number[] = [];
  const col: number[] = [];
  const base = new THREE.Color("#4d7a3a");
  const tip = new THREE.Color("#c3d98e");
  const blades: [number, number, number][] = [[0, 1, 0.08], [2.1, 0.78, -0.12], [4.2, 0.88, 0.16]];
  for (const [angle, height, lean] of blades) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const w = 0.07;
    // Root left, root right, tip (leaning out from the tuft's centre).
    const pts = [[-w, 0, 0], [w, 0, 0], [lean, height, lean * 0.5]];
    for (const [x, y, z] of pts) {
      pos.push(x * c - z * s, y, x * s + z * c);
      const k = y / height;
      col.push(base.r + (tip.r - base.r) * k, base.g + (tip.g - base.g) * k, base.b + (tip.b - base.b) * k);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  // Lit like the ground beneath it, from above, so blades never flip dark as they turn.
  g.setAttribute("normal", new THREE.Float32BufferAttribute(pos.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  return g;
}

export type Grass = { mesh: THREE.InstancedMesh; update: (time: number, wind: number) => void; dispose: () => void };

export function buildGrass(trail: Trail, ground: Ground, lowPower: boolean): Grass {
  const rand = rng(23);
  const geometry = tuftGeometry();
  const material = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const uniforms = { uTime: { value: 0 }, uWind: { value: 1 } };
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `uniform float uTime;\nuniform float uWind;\n${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      /* glsl */ `#include <begin_vertex>
      // Where this tuft stands: sways out of phase with its neighbours, gusts roll across the field.
      vec3 root = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      float bend = position.y * position.y;
      float sway = sin(uTime * 1.8 + root.x * 0.41 + root.z * 0.29) * 0.55;
      float gust = sin(dot(root.xz, vec2(0.07, 0.05)) - uTime * 1.1) * 0.5 + 0.5;
      transformed.x += (sway + gust * 0.9) * bend * 0.22 * uWind;
      transformed.z += cos(uTime * 1.3 + root.z * 0.37) * bend * 0.08 * uWind;`,
    );
  };

  const count = lowPower ? 4200 : 11000;
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const sc = new THREE.Vector3();
  const tone = new THREE.Color();
  let placed = 0;

  for (let guard = 0; placed < count && guard < count * 3; guard++) {
    const s = rand() * 0.965;
    // Thinner on the rocky climb and high up; none in the river, none on the bare summit.
    const sparse = (s > 0.44 && s < 0.6) || s > 0.84 ? 0.45 : 1;
    if (rand() > sparse) continue;
    const near = rand() < 0.52;
    const lateral = near ? 1.2 + Math.pow(rand(), 1.4) * 7 : 8 + rand() * 34;
    const side = rand() < 0.5 ? -1 : 1;
    const f = frameAt(trail, s);
    const x = f.p.x + f.right.x * side * lateral + f.forward.x * (rand() - 0.5) * 2;
    const z = f.p.z + f.right.z * side * lateral + f.forward.z * (rand() - 0.5) * 2;
    if (ground.dryness(x, z) < 0.6 || ground.steepness(x, z) > 0.5) continue;
    const y = ground.heightAt(x, z);
    // Taller, fuller tufts right at the trail's edge; finer ones out in the field.
    const size = (near ? 0.3 + rand() * 0.32 : 0.28 + rand() * 0.3) * (lateral < 2.4 ? 1.15 : 1);
    q.setFromEuler(e.set(0, rand() * Math.PI * 2, 0));
    m.compose(v.set(x, y - 0.02, z), q, sc.set(size * (0.9 + rand() * 0.4), size, size * (0.9 + rand() * 0.4)));
    mesh.setMatrixAt(placed, m);
    // A little colour drift per tuft: some sun-bleached, some deeper.
    const k = rand();
    mesh.setColorAt(placed, tone.setRGB(0.88 + k * 0.2, 0.92 + k * 0.14, 0.86 + k * 0.12));
    placed++;
  }
  mesh.count = placed;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  // Tufts are spread over the whole trail; skip per-frame bounds checks.
  mesh.frustumCulled = false;

  return {
    mesh,
    update: (time, wind) => {
      uniforms.uTime.value = time;
      uniforms.uWind.value = wind;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
