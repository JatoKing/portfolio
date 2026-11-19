import * as THREE from "three";

/*
 * The few custom shaders the world needs. All of them take part in the
 * scene's fog and colour management exactly like three's own materials, so
 * they fade into the same mist as everything else.
 */

const NOISE = /* glsl */ `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
`;

const VERT = /* glsl */ `
#include <fog_pars_vertex>
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const OUT = /* glsl */ `
  #include <colorspace_fragment>
  #include <fog_fragment>
`;

function fogMaterial(uniforms: Record<string, THREE.IUniform>, body: string, transparent = true) {
  return new THREE.ShaderMaterial({
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...uniforms },
    vertexShader: VERT,
    fragmentShader: `#include <fog_pars_fragment>\nvarying vec2 vUv;\n${NOISE}\n${body.replace("/*OUT*/", OUT)}`,
    fog: true,
    transparent,
    depthWrite: !transparent,
  });
}

/**
 * The trail ribbon. The whole route is always there, a clear sandy path through the grass, so
 * it's plain where the hiker is going. The walked part carries a green trace line down its
 * middle (the "jejak"); just ahead of the hiker the trace runs on as a dotted line, fading.
 * uv.x runs along the trail (0..1), uv.y across it.
 */
export function trailMaterial(gapS: number, gapHalf: number) {
  return fogMaterial({
    drawn: { value: 0 },
    lead: { value: 0.035 },
    gapS: { value: gapS },
    gapHalf: { value: gapHalf },
    sand: { value: new THREE.Color("#c7ab84") },
    trace: { value: new THREE.Color("#2f8f5b") },
  }, /* glsl */ `
uniform float drawn, lead, gapS, gapHalf;
uniform vec3 sand, trace;
void main() {
  float u = vUv.x, v = vUv.y;
  if (abs(u - gapS) < gapHalf) discard;                       // the river: the bridge carries the path
  float edge = smoothstep(0.0, 0.16, v) * smoothstep(1.0, 0.84, v);
  float grain = 0.92 + 0.08 * noise(vec2(u * 2400.0, v * 6.0));
  vec3 c = sand * grain;
  float a = edge;
  if (u > drawn) {
    // Not yet walked: the same path, a touch paler, with the trace dotted just ahead.
    c = mix(c, vec3(1.0), 0.1);
    a *= 0.9;
    float ahead = clamp(1.0 - (u - drawn) / lead, 0.0, 1.0);
    float dots = step(0.55, fract(u * 900.0)) * (1.0 - smoothstep(0.03, 0.06, abs(v - 0.5)));
    c = mix(c, trace, dots * ahead * 0.75);
  } else {
    float line = 1.0 - smoothstep(0.035, 0.07, abs(v - 0.5));
    c = mix(c, trace, line * 0.9);
  }
  gl_FragColor = vec4(c, a);
  /*OUT*/
}`);
}

/**
 * Running water: a ribbon along a stream's course. uv.x is distance along the course (metres),
 * uv.y runs across it. Streaks and ripples travel downstream at `speed`; the edges whiten
 * where the water meets the bank.
 */
export function streamMaterial(speed: number) {
  return fogMaterial({
    time: { value: 0 },
    speed: { value: speed },
    deep: { value: new THREE.Color("#5f9fae") },
    shallow: { value: new THREE.Color("#a9d6dc") },
  }, /* glsl */ `
uniform float time, speed;
uniform vec3 deep, shallow;
void main() {
  float u = vUv.x, v = vUv.y;
  float mid = 1.0 - abs(v - 0.5) * 2.0;                       // 1 mid-stream, 0 at the banks
  vec3 c = mix(shallow, deep, smoothstep(0.0, 0.7, mid));
  // Current: long streaks moving downstream, faster mid-stream; finer ripples on top.
  float flow = noise(vec2(u * 0.55 - time * speed * (0.8 + mid * 0.7), v * 7.0));
  float ripple = noise(vec2(u * 2.2 - time * speed * 1.9, v * 18.0));
  c += vec3(1.0) * (smoothstep(0.6, 0.9, flow) * 0.3 + smoothstep(0.72, 0.95, ripple) * 0.14);
  // Foam where the water meets the bank.
  float foam = smoothstep(0.22, 0.0, mid) * (0.55 + 0.45 * noise(vec2(u * 3.0 - time * speed, v * 30.0)));
  c = mix(c, vec3(0.97, 0.99, 1.0), foam * 0.7);
  float a = smoothstep(0.0, 0.07, mid) * 0.95;
  gl_FragColor = vec4(c, a);
  /*OUT*/
}`);
}

/**
 * The falling sheet. uv.y runs from the lip (0) to the pool (1). Water leaves the lip glassy and
 * slow, breaks into white streaks as it accelerates, and turns to foam at the foot.
 */
export function fallsMaterial() {
  return fogMaterial({
    time: { value: 0 },
    body: { value: new THREE.Color("#9fd0d8") },
  }, /* glsl */ `
uniform float time;
uniform vec3 body;
void main() {
  float x = vUv.x, y = vUv.y;
  float sides = smoothstep(0.0, 0.12, x) * smoothstep(1.0, 0.88, x);
  // Distance fallen grows with the square of time: stretch the pattern as it drops.
  float fall = y * y * 3.2 + y * 0.8;
  float pour = noise(vec2(x * 18.0, fall * 2.2 - time * 2.4));
  float fine = noise(vec2(x * 55.0, fall * 6.0 - time * 4.0));
  vec3 c = mix(body, vec3(1.0), smoothstep(0.4, 0.85, pour) * (0.35 + 0.6 * y) + fine * 0.18 * y);
  // A smooth glassy tongue at the lip, foam at the foot.
  c = mix(c, body * 1.08, smoothstep(0.12, 0.0, y) * 0.6);
  c = mix(c, vec3(1.0), smoothstep(0.8, 1.0, y) * 0.75);
  float a = sides * (0.78 + 0.22 * pour) * smoothstep(0.0, 0.03, y);
  gl_FragColor = vec4(c, a);
  /*OUT*/
}`);
}

/** The plunge pool: churned white where the falls land, rings spreading out across it. */
export function poolMaterial(impact: THREE.Vector2) {
  return fogMaterial({
    time: { value: 0 },
    impact: { value: impact },
    deep: { value: new THREE.Color("#5f9fae") },
    shallow: { value: new THREE.Color("#a9d6dc") },
  }, /* glsl */ `
uniform float time;
uniform vec2 impact;
uniform vec3 deep, shallow;
void main() {
  vec2 p = vUv - 0.5;
  float edge = length(p) * 2.0;                               // 0 centre … 1 rim
  vec3 c = mix(deep, shallow, smoothstep(0.55, 1.0, edge));
  float r = length(vUv - impact);
  float rings = smoothstep(0.55, 1.0, sin(r * 70.0 - time * 3.4) * 0.5 + 0.5) * smoothstep(0.75, 0.1, r);
  float churn = smoothstep(0.24, 0.0, r) * (0.6 + 0.4 * noise(vec2(atan(vUv.y - impact.y, vUv.x - impact.x) * 4.0, r * 30.0 - time * 3.0)));
  c += vec3(1.0) * rings * 0.22;
  c = mix(c, vec3(0.98, 1.0, 1.0), churn * 0.85);
  float a = smoothstep(1.0, 0.94, edge) * 0.96;
  gl_FragColor = vec4(c, a);
  /*OUT*/
}`);
}

/**
 * Far mountain ranges: flat silhouettes graded from their colour at the peaks into the horizon
 * at their feet, so they dissolve into the haze. No fog (they sit far beyond it); the haze is
 * the gradient. `lift` lightens farther ranges.
 */
export function rangeMaterial(lift: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      top: { value: new THREE.Color("#a9b9bd") },
      horizon: { value: new THREE.Color("#eef0ea") },
      lift: { value: lift },
      snow: { value: 0 },
    },
    vertexShader: /* glsl */ `
varying float vH;
void main() {
  vH = position.y + 0.5;                                      // cone geometry: -0.5 base .. 0.5 apex
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentShader: /* glsl */ `
uniform vec3 top, horizon;
uniform float lift, snow;
varying float vH;
void main() {
  vec3 peak = mix(top, horizon, lift);
  vec3 c = mix(horizon, peak, smoothstep(0.05, 0.75, vH));
  c = mix(c, mix(vec3(1.0), horizon, 0.25 + lift * 0.5), snow * smoothstep(0.8, 0.86, vH));
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`,
  });
}

/** A soft round puff, for clouds and spray. */
export function puffTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.45)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Carved sign text for the gate and the trailhead post. */
export function signTexture(title: string, sub: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 176;
  const g = c.getContext("2d");
  if (g) {
    const wood = g.createLinearGradient(0, 0, 0, 176);
    wood.addColorStop(0, "#c39566");
    wood.addColorStop(1, "#94693f");
    g.fillStyle = wood;
    g.fillRect(0, 0, 512, 176);
    g.strokeStyle = "rgba(90,58,30,0.45)";
    g.lineWidth = 2;
    for (const y of [58, 118]) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
    g.fillStyle = "#3b2414";
    g.textAlign = "center";
    g.font = "300 78px system-ui, -apple-system, 'Helvetica Neue', sans-serif";
    g.fillText(title.split("").join(" "), 256, 100);
    g.font = "500 22px ui-monospace, Menlo, monospace";
    g.fillText(sub, 256, 150);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
