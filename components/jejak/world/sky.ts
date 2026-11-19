import * as THREE from "three";

/*
 * Clouds: soft low-poly cumulus far out in the sky, in the same faceted style
 * as the trees and rocks. Each cloud is a cluster of flattened puffs (a broad
 * base, smaller domes on top), all of them one instanced mesh. They sit far
 * beyond the fog and shade themselves: bright white on top and on the sun
 * side, a cool blue-grey underneath, so their shapes read clearly against the
 * blue. The whole bank drifts slowly around the valley.
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

/** Centre of the world the cloud ring turns around (the middle of the climb). */
const CENTRE = new THREE.Vector3(0, 0, -150);

/** Where the opening shot is taken from: the framed clouds are placed as seen from here. */
const EYE = new THREE.Vector3(0, 1.5, 5);

type CloudSpot = { centre: THREE.Vector3; dir: THREE.Vector3; size: number };

/** A cloud ring spot: angle round the valley (0 = up the climb, −z), distance and height. */
function ringSpot(angle: number, dist: number, y: number, size: number): CloudSpot {
  const dir = new THREE.Vector3(Math.sin(angle), 0, -Math.cos(angle));
  return { centre: dir.clone().multiplyScalar(dist).setY(y), dir, size };
}

/** A cloud placed as seen from the opening shot: heading (+ right) and elevation in degrees. */
function framedSpot(heading: number, elevation: number, dist: number, size: number): CloudSpot {
  const h = THREE.MathUtils.degToRad(heading), e = THREE.MathUtils.degToRad(elevation);
  const dir = new THREE.Vector3(Math.sin(h), 0, -Math.cos(h));
  const world = EYE.clone().addScaledVector(dir, dist * Math.cos(e)).setY(EYE.y + dist * Math.sin(e));
  return { centre: world.sub(CENTRE), dir, size };
}

export type Clouds = {
  group: THREE.Group;
  update: (time: number, light: { horizon: THREE.Color; sun: THREE.Color; gold: number }) => void;
  dispose: () => void;
};

export function buildClouds(lowPower: boolean): Clouds {
  const rand = rng(91);
  const group = new THREE.Group();
  group.position.copy(CENTRE);

  const spots: CloudSpot[] = [
    // The opening view: big clouds framing the title on both flanks, a long thin one high
    // above it, smaller ones lower down for depth, one bank resting on the far ridges.
    framedSpot(-30, 17, 720, 1.6),
    framedSpot(-40, 9, 600, 1.05),
    framedSpot(29, 19, 760, 1.5),
    framedSpot(41, 10, 620, 1.1),
    framedSpot(-6, 25, 980, 1.25),
    framedSpot(-17, 6.5, 900, 1.15),
    framedSpot(19, 5.5, 880, 1.2),
  ];
  // The rest of the sky all the way round, for the stages that look back or sideways.
  const more = lowPower ? 12 : 22;
  for (let i = 0; i < more; i++) {
    const angle = 0.9 + (i / more) * (Math.PI * 2 - 1.8) + (rand() - 0.5) * 0.2;
    spots.push(ringSpot(angle, 520 + rand() * 320, 110 + rand() * 170, 0.9 + rand() * 0.7));
  }

  // Puffs per cloud: a wide flat base of 3–5 then 2–4 smaller domes riding on it.
  const puffs: { p: THREE.Vector3; s: THREE.Vector3 }[] = [];
  for (const spot of spots) {
    const { dir, centre } = spot;
    const across = new THREE.Vector3(-dir.z, 0, dir.x);
    const width = (60 + rand() * 50) * spot.size;
    const base = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < base; i++) {
      const t = base === 1 ? 0 : i / (base - 1) - 0.5;
      const r = (16 + rand() * 9) * spot.size * (1 - Math.abs(t) * 0.55);
      puffs.push({
        p: centre.clone().addScaledVector(across, t * width).addScaledVector(dir, (rand() - 0.5) * 18).add(new THREE.Vector3(0, r * 0.15, 0)),
        s: new THREE.Vector3(r * 1.35, r * 0.62, r * 1.1),
      });
    }
    const domes = 2 + Math.floor(rand() * 3);
    for (let i = 0; i < domes; i++) {
      const t = (rand() - 0.5) * 0.6;
      const r = (14 + rand() * 10) * spot.size;
      puffs.push({
        p: centre.clone().addScaledVector(across, t * width).addScaledVector(dir, (rand() - 0.5) * 12).add(new THREE.Vector3(0, r * 0.55, 0)),
        s: new THREE.Vector3(r * 1.05, r * 0.8, r),
      });
    }
  }

  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      light: { value: new THREE.Color("#ffffff") },
      shade: { value: new THREE.Color("#b9cfe2") },
      haze: { value: new THREE.Color("#e4eef1") },
      sunDir: { value: new THREE.Vector3(0.35, 0.75, 0.55).normalize() },
    },
    vertexShader: /* glsl */ `
varying vec3 vW;
varying float vLow;
void main() {
  vec4 local = instanceMatrix * vec4(position, 1.0);
  // How far down the puff this point sits: the undersides fade toward the haze.
  vLow = clamp(-position.y, 0.0, 1.0);
  vec4 w = modelMatrix * local;
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`,
    fragmentShader: /* glsl */ `
uniform vec3 light, shade, haze, sunDir;
varying vec3 vW;
varying float vLow;
void main() {
  // Flat facets, like the rest of the world.
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));
  float up = n.y * 0.5 + 0.5;
  float sun = max(dot(n, sunDir), 0.0);
  float lit = clamp(up * 0.75 + sun * 0.45, 0.0, 1.0);
  vec3 c = mix(shade, light, smoothstep(0.25, 0.85, lit));
  c = mix(c, haze, vLow * 0.35);
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, puffs.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  puffs.forEach(({ p, s }, i) => {
    q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, rand() * Math.PI * 2);
    mesh.setMatrixAt(i, m.compose(p, q, s));
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  // Drawn first, behind everything else in the world.
  mesh.renderOrder = -1;
  group.add(mesh);

  const white = new THREE.Color("#ffffff");
  const cool = new THREE.Color("#b9cfe2");
  const warmShade = new THREE.Color("#e2b49c");

  return {
    group,
    update: (time, sky) => {
      // A slow drift round the valley: barely a degree a minute, enough to feel alive.
      group.rotation.y = time * 0.0012;
      material.uniforms.haze.value.copy(sky.horizon);
      material.uniforms.light.value.copy(white).lerp(sky.sun, 0.35 * sky.gold);
      material.uniforms.shade.value.copy(cool).lerp(warmShade, sky.gold);
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
