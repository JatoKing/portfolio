import * as THREE from "three";
import { applyPose, buildHiker, type Pose } from "../hiker/model";
import { BRIDGE, MARKS, bridgeLift, frameAt, lightAt, makeTrail, shotAt, trailAt } from "./story";
import { buildGround } from "./terrain";
import { buildGrass } from "./grass";
import { buildProps } from "./props";
import { buildClouds } from "./sky";
import { fallsMaterial, poolMaterial, puffTexture, streamMaterial, trailMaterial } from "./materials";
import { buildWater, layoutWaters } from "./water";

/*
 * The whole world in one WebGL scene: a fogged valley, the trail that paints
 * itself as the hiker walks it, the props of each stage, far ranges, and the
 * hiker with a chase camera. `update` is called every frame with σ (the
 * continuous stage number) and the walk state; everything else follows.
 */

const HIKER_HEIGHT = 1.8;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export type Frame = { sigma: number; stride: number; phase: number; breath: number; time: number; dt: number; snap: boolean };
export type Sky = { top: string; horizon: string };

export type World = {
  update: (f: Frame) => Sky;
  resize: () => void;
  dispose: () => void;
};

export function createWorld(canvas: HTMLCanvasElement, lowPower: boolean): World {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !lowPower, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#e2edf2", 60, 330);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 2400);

  const hemi = new THREE.HemisphereLight("#cdd8da", "#c9d1bd", 1.15);
  const sun = new THREE.DirectionalLight("#fff3df", 1.1);
  scene.add(hemi, sun, sun.target);

  const trail = makeTrail();
  const waters = layoutWaters(trail);
  const ground = buildGround(trail, waters, lowPower);
  scene.add(ground.mesh);
  const water = buildWater(waters, { stream: streamMaterial, falls: fallsMaterial, pool: poolMaterial, puff: puffTexture }, ground.heightAt);
  scene.add(water.group);
  const grass = buildGrass(trail, ground, lowPower);
  scene.add(grass.mesh);
  const clouds = buildClouds(lowPower);
  scene.add(clouds.group);

  // The trail ribbon, laid on the valley floor.
  const ribbon = (() => {
    const n = 1400;
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    const width = 1.5;
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      const f = frameAt(trail, s);
      for (const k of [0, 1]) {
        const off = (k - 0.5) * width;
        pos.push(f.p.x + f.right.x * off, f.p.y + 0.05, f.p.z + f.right.z * off);
        uv.push(s, k);
      }
      if (i < n) {
        const a = i * 2;
        // Counter-clockwise seen from above, so the ribbon faces the sky.
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(idx);
    const material = trailMaterial(MARKS.river, (BRIDGE.half - 0.7) / trail.length);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1;
    return { mesh, geometry, material };
  })();
  scene.add(ribbon.mesh);

  const props = buildProps(trail, ground, waters, lowPower);
  scene.add(props.group);

  const rig = buildHiker();
  rig.root.scale.setScalar(HIKER_HEIGHT);
  scene.add(rig.root);
  const pose: Pose = { phase: 0, stride: 0, lean: 0, cheer: 0, proud: 0, breath: 0 };

  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const wantPos = new THREE.Vector3();
  const wantLook = new THREE.Vector3();
  let started = false;

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.6));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const update = (fr: Frame): Sky => {
    const { sigma } = fr;
    const s = trailAt(sigma);
    const here = frameAt(trail, s);

    // Hiker on the trail, facing along it, leaning into the slope.
    rig.root.position.copy(here.p);
    // On the bridge, walking on its deck.
    rig.root.position.y += bridgeLift(trail, s);
    rig.root.rotation.y = Math.atan2(-here.forward.x, -here.forward.z);
    const slope = here.tan.y / Math.max(0.2, Math.hypot(here.tan.x, here.tan.z));
    pose.phase = fr.phase;
    pose.stride = fr.stride;
    pose.breath = fr.breath;
    pose.lean = Math.min(0.36, Math.max(0, slope * 0.9));
    pose.cheer = smoothstep(6.55, 7, sigma) * (1 - smoothstep(7.25, 7.75, sigma));
    pose.proud = smoothstep(7.35, 8, sigma);
    applyPose(rig, pose);

    // Chase camera, framed per stage, eased so scroll jumps never jerk it.
    const shot = shotAt(sigma);
    // Portrait screens: pull back a little so the hiker and the path both fit.
    const portrait = Math.max(0, Math.min(1, (1.1 - camera.aspect) / 0.6));
    const back = shot.back * (1 + 0.35 * portrait) + (shot.back < 0 ? -1 : 1) * 1.2 * portrait;
    wantPos.copy(here.p)
      .addScaledVector(here.right, shot.side * (1 - 0.4 * portrait))
      .addScaledVector(here.forward, -back);
    wantPos.y += shot.up + 0.6 * portrait;
    // Look along the trail; past either end of it, carry straight on in the direction of travel.
    const aheadS = s + shot.ahead / trail.length;
    if (shot.ahead > 0 && aheadS <= 1) {
      const ahead = frameAt(trail, aheadS);
      wantLook.copy(ahead.p);
      wantLook.y = here.p.y + shot.lookUp + (ahead.p.y - here.p.y) * 0.4;
    } else {
      wantLook.copy(here.p).addScaledVector(here.forward, shot.ahead);
      wantLook.y = here.p.y + shot.lookUp;
    }
    // Slide the frame sideways (pan) to keep the hiker clear of the copy; portrait screens are
    // too narrow for an off-centre hiker, so pull them back toward the middle there.
    const pan = (shot.pan ?? 0) + 1.4 * portrait;
    if (pan) {
      const side = new THREE.Vector3().subVectors(wantLook, wantPos).cross(THREE.Object3D.DEFAULT_UP).normalize();
      wantLook.addScaledVector(side, pan);
    }
    // Never let the camera sink into a hillside.
    wantPos.y = Math.max(wantPos.y, ground.heightAt(wantPos.x, wantPos.z) + 0.8);
    if (!started || fr.snap) {
      camPos.copy(wantPos);
      camLook.copy(wantLook);
      started = true;
    } else {
      const k = 1 - Math.exp(-fr.dt * 4.5);
      camPos.lerp(wantPos, k);
      camLook.lerp(wantLook, k);
    }
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    const fov = shot.fov + 6 * portrait;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    // Light and haze of this stage.
    const light = lightAt(sigma);
    hemi.color.copy(light.top);
    hemi.groundColor.copy(light.ground);
    sun.color.copy(light.sun);
    sun.intensity = light.sunPower * 0.62;
    // The sun sits ahead of the climb, high by day and low and gold at the end.
    sun.position.copy(here.p).add(new THREE.Vector3(14, 30 - 18 * light.gold, -26));
    sun.target.position.copy(here.p);
    (scene.fog as THREE.Fog).color.copy(light.horizon);

    ribbon.material.uniforms.drawn.value = sigma >= 7.6 ? 1 : s;
    props.update(s, fr.time, light);
    water.update(fr.time);
    clouds.update(fr.time, light);
    // A steady breeze; walking stirs it a little more.
    grass.update(fr.time, 0.8 + fr.stride * 0.6);

    renderer.render(scene, camera);
    return { top: `#${light.sky.getHexString()}`, horizon: `#${light.horizon.getHexString()}` };
  };

  return {
    update,
    resize,
    dispose: () => {
      rig.dispose();
      ground.dispose();
      grass.dispose();
      clouds.dispose();
      water.dispose();
      props.dispose();
      ribbon.geometry.dispose();
      ribbon.material.dispose();
      renderer.dispose();
    },
  };
}
