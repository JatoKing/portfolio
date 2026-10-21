import * as THREE from "three";
import { createTerrain } from "./construction-terrain";
import { createConstructionWorkers } from "./construction-workers";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import fontData from "three/examples/fonts/helvetiker_bold.typeface.json";
import labelFontData from "three/examples/fonts/helvetiker_regular.typeface.json";

const PERIOD = 8;
const TAU = Math.PI * 2;
type Point = [number, number, number];

/** Geometry and camera are immutable; every animated channel is periodic in eight seconds. */
export function createConstructionScene(host: HTMLDivElement, link: HTMLAnchorElement, initiallyPaused: boolean) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
  renderer.setClearColor(0xf6f7f7);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf6f7f7);
  scene.fog = new THREE.Fog(0xf6f7f7, 42, 75);
  const camera = new THREE.OrthographicCamera(-11, 11, 9, -9, .1, 100);
  camera.position.set(13, 18, 24);
  camera.lookAt(0, 1.1, 0);
  camera.updateMatrixWorld();
  const root = new THREE.Group();
  scene.add(root);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const animated: ((phase: number) => void)[] = [];
  const material = (color: number, roughness = .85) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
    materials.add(m); return m;
  };
  const ivory = material(0xf4f3ed);
  const white = material(0xfafbfa);
  const concrete = material(0xd7e0e3);
  const blueGrey = material(0x9eB5c2, .8);
  const steel = material(0x9facb0, .6);
  const timber = material(0xcbb594);
  const timberLight = material(0xdecfb7);

  function mesh(geometry: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], p: Point, parent: THREE.Object3D = root) {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(...p); object.castShadow = true; object.receiveShadow = true;
    parent.add(object); return object;
  }
  function box(w: number, h: number, d: number, p: Point, mat = white, parent: THREE.Object3D = root, rounded = false) {
    return mesh(rounded ? new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d, .08) / 3) : new THREE.BoxGeometry(w, h, d), mat, p, parent);
  }
  function beam(a: Point, b: Point, r = .025, mat = steel, parent: THREE.Object3D = root) {
    const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b);
    const obj = mesh(new THREE.CylinderGeometry(r, r, av.distanceTo(bv), 8), mat, [0, 0, 0], parent);
    obj.position.copy(av.clone().add(bv).multiplyScalar(.5));
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), bv.sub(av).normalize());
    return obj;
  }
  function line(points: Point[], color = 0xb8c7cb, opacity = .45, parent: THREE.Object3D = root) {
    const g = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    geometries.add(g); materials.add(m);
    const l = new THREE.Line(g, m); parent.add(l); return l;
  }
  function roundedPath(w: number, h: number, r: number) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  }

  // Broad neutral illumination; a large shadow emitter keeps the model airy.
  scene.add(new THREE.HemisphereLight(0xeaf3ff, 0xc5cdd1, 1.7));
  const sun = new THREE.DirectionalLight(0xfff8ed, 2.6);
  sun.position.set(-8, 17, 9); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: .1, far: 50 });
  sun.shadow.bias = -.0003; sun.shadow.normalBias = .025; sun.shadow.radius = 4; sun.shadow.blurSamples = 8;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xe4edf3, .7); fill.position.set(10, 8, -6); scene.add(fill);
  // The worksite is continuous soil, with no display slab or raised perimeter.
  const pool = { x: 1.1, z: 3.55, w: 4.7, d: 1.65 };
  const earth = createTerrain(pool);
  root.add(earth.terrain, earth.gravel);
  earth.geometries.forEach(g => geometries.add(g));
  earth.materials.forEach(m => materials.add(m));
  textures.add(earth.texture);
  const basin = mesh(new THREE.ShapeGeometry(roundedPath(pool.w, pool.d, .22)), blueGrey, [pool.x, -.05, pool.z]); basin.rotation.x = -Math.PI / 2;
  const coping = roundedPath(pool.w + .22, pool.d + .22, .3);
  coping.holes.push(new THREE.Path(roundedPath(pool.w, pool.d, .22).getPoints(12)));
  const lining = mesh(new THREE.ExtrudeGeometry(coping, { depth: .32, bevelEnabled: false }), concrete, [pool.x, 0, pool.z]);
  lining.rotation.x = -Math.PI / 2;
  const rim = mesh(new THREE.ExtrudeGeometry(coping, { depth: .055, bevelEnabled: true, bevelSize: .015, bevelThickness: .015, bevelSegments: 2 }), white, [pool.x, .31, pool.z]);
  rim.rotation.x = -Math.PI / 2;

  const water = new THREE.ShaderMaterial({
    transparent: true, uniforms: { phase: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv; uniform float phase;
      void main(){
        float a=sin(vUv.x*21.+vUv.y*13.+phase)*sin(vUv.y*25.-phase);
        float b=sin(vUv.x*36.-vUv.y*18.-phase)*.5+.5;
        vec3 c=mix(vec3(.70,.81,.84),vec3(.83,.9,.91),.55+a*.08);
        c+=pow(b,20.)*.025;
        gl_FragColor=vec4(c,.88);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }); materials.add(water);
  const waterMesh = mesh(new THREE.ShapeGeometry(roundedPath(pool.w - .025, pool.d - .025, .2)), water, [pool.x, .07, pool.z]);
  waterMesh.rotation.x = -Math.PI / 2; waterMesh.castShadow = false;
  animated.push(p => { water.uniforms.phase.value = p; });

  // A gently inclined inlay stays inside the rim. The lettering is real vector
  // geometry, optically centred with its arrow and independent of water distortion.
  const inlay = new THREE.Group();
  inlay.position.set(pool.x, .18, pool.z);
  inlay.rotation.x = -1.0;
  root.add(inlay);
  box(4.05, .62, .028, [0, 0, 0], material(0xdbe5e8, .78), inlay, true);
  const labelScene = new THREE.Scene();
  const labelGroup = new THREE.Group();
  labelGroup.position.copy(inlay.position); labelGroup.rotation.copy(inlay.rotation);
  labelScene.add(labelGroup);
  const labelFace = new THREE.MeshBasicMaterial({ color: 0x38525f, toneMapped: false });
  const labelEdge = new THREE.MeshBasicMaterial({ color: 0x68818b, toneMapped: false });
  materials.add(labelFace); materials.add(labelEdge);
  const labelGeometry = new TextGeometry("Back to Portfolio", {
    font: new FontLoader().parse(labelFontData), size: .34, depth: .004,
    curveSegments: 16, bevelEnabled: true, bevelSize: .0015, bevelThickness: .001, bevelSegments: 2,
  });
  labelGeometry.computeBoundingBox();
  const labelBounds = labelGeometry.boundingBox!;
  const labelWidth = labelBounds.max.x - labelBounds.min.x;
  const arrowSize = .2, arrowGap = .19;
  const inscriptionWidth = labelWidth + arrowGap + arrowSize;
  const labelStart = -inscriptionWidth / 2;
  mesh(labelGeometry, [labelFace, labelEdge], [labelStart - labelBounds.min.x, -(labelBounds.max.y + labelBounds.min.y) / 2, .017], labelGroup);
  const arrowX = labelStart + labelWidth + arrowGap;
  // A small geometric arrow matches the letter strokes; it is never a font glyph.
  const arrowPoints: [Point, Point][] = [
    [[arrowX, -.1, .021], [arrowX + arrowSize, .1, .021]],
    [[arrowX + .025, .1, .021], [arrowX + arrowSize, .1, .021]],
    [[arrowX + arrowSize, .1, .021], [arrowX + arrowSize, -.075, .021]],
  ];
  for (const [a, b] of arrowPoints) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const stroke = mesh(new THREE.CylinderGeometry(.009, .009, start.distanceTo(end), 8), labelFace, [0, 0, 0], labelGroup);
    stroke.position.copy(start.clone().add(end).multiplyScalar(.5));
    stroke.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
  }
  // Fit the whole inscription as a unit, preserving its natural letter proportions.
  const inscriptionScale = 3.48 / inscriptionWidth;
  labelGroup.scale.setScalar(inscriptionScale);

  // Survey stakes and taut setting-out lines mark a restrained work zone in the soil.
  for (const x of [-5.8, 5.8]) {
    for (const z of [-4.5, 2.4]) {
      box(.035, .27, .035, [x, .43, z], timber);
      box(.055, .045, .055, [x, .575, z], ivory);
    }
    line([[x, .55, -4.5], [x, .55, 2.4]], 0xe3d9c6, .65);
  }
  line([[-5.8, .55, -4.5], [5.8, .55, -4.5]], 0xe3d9c6, .65);

  // The two rows of typography are real extruded meshes with architectural joints.
  const font = new FontLoader().parse(fontData);
  function lettering(text: string, size: number, depth: number, y: number, z: number, mat: THREE.Material | THREE.Material[]) {
    const g = new TextGeometry(text, { font, size, depth, curveSegments: 16, bevelEnabled: true, bevelThickness: .025, bevelSize: .018, bevelSegments: 3 });
    g.computeBoundingBox();
    const width = g.boundingBox!.max.x - g.boundingBox!.min.x;
    return mesh(g, mat, [-width / 2, y, z]);
  }
  // Fine panel joints and cool unfinished sides echo the gridded walls in the reference.
  const claddingCanvas = document.createElement("canvas");
  claddingCanvas.width = claddingCanvas.height = 256;
  const cladCtx = claddingCanvas.getContext("2d")!;
  cladCtx.fillStyle = "#e9eef0"; cladCtx.fillRect(0, 0, 256, 256);
  cladCtx.strokeStyle = "#acbfc9"; cladCtx.lineWidth = 1.2;
  for (let n = 0; n <= 256; n += 32) { cladCtx.beginPath(); cladCtx.moveTo(n, 0); cladCtx.lineTo(n, 256); cladCtx.moveTo(0, n); cladCtx.lineTo(256, n); cladCtx.stroke(); }
  const cladTexture = new THREE.CanvasTexture(claddingCanvas); textures.add(cladTexture);
  cladTexture.wrapS = cladTexture.wrapT = THREE.RepeatWrapping; cladTexture.repeat.set(1.7, 1.7); cladTexture.colorSpace = THREE.SRGBColorSpace;
  const cladding = material(0xb9cad4); cladding.map = cladTexture; cladding.bumpMap = cladTexture; cladding.bumpScale = .025;
  const face = material(0xf4f6f5); face.bumpMap = cladTexture; face.bumpScale = .016;
  const panelCanvas = document.createElement("canvas"); panelCanvas.width = panelCanvas.height = 256;
  const panelPen = panelCanvas.getContext("2d")!;
  panelPen.fillStyle = "#fafbfb"; panelPen.fillRect(0, 0, 256, 256);
  panelPen.strokeStyle = "#cdd9df"; panelPen.lineWidth = 1.4; panelPen.strokeRect(0, 0, 256, 128); panelPen.strokeRect(0, 128, 256, 128);
  const panelTexture = new THREE.CanvasTexture(panelCanvas); textures.add(panelTexture);
  panelTexture.wrapS = panelTexture.wrapT = THREE.RepeatWrapping; panelTexture.repeat.set(1.4, 1.4); panelTexture.colorSpace = THREE.SRGBColorSpace;
  face.map = panelTexture;
  const digits = lettering("404", 3.25, .9, .36, -.45, [face, cladding]);
  lettering("ERROR", .95, .32, 4.0, -.72, ivory);
  // Thin seams suggest prefabricated cladding without interrupting legibility.
  const bounds = new THREE.Box3().setFromObject(digits);
  for (const x of [-2.95, 2.62]) {
    for (const y of [1.05, 1.88, 2.7]) box(.48, .008, .007, [x, y, .468], concrete);
  }
  // The ERROR row rests on a slender construction deck.
  box(5.55, .105, .96, [0, 3.88, -.46], concrete);
  for (const x of [-2.62, 2.62]) {
    box(.085, 3.5, .085, [x, 2.12, -.9], blueGrey);
    beam([x, .35, -.95], [x, 3.82, -2.2], .035, blueGrey);
  }
  // A light installation gantry holds the upper lettering on taut lifting cables.
  for (const x of [-2.9, 2.9]) {
    box(.07, 5.0, .07, [x, 2.84, -1.48], blueGrey);
    beam([x, .34, -2.1], [x, 1.8, -1.48], .025, steel);
  }
  box(5.87, .085, .1, [0, 5.35, -1.48], blueGrey);
  for (const x of [-1.65, 1.65]) {
    beam([x, 5.31, -1.48], [x, 4.9, -.57], .009, steel);
    box(.09, .075, .09, [x, 5.28, -1.48], steel);
  }

  // One end remains an exposed frame, its face panel gently fitted by a worker.
  const frameX = bounds.max.x + .16;
  for (const z of [-.45, .24]) {
    for (const x of [frameX, frameX + .52]) box(.045, 2.65, .045, [x, 1.7, z], blueGrey);
    for (let y = .39; y < 3.1; y += .52) box(.56, .04, .045, [frameX + .26, y, z], blueGrey);
    beam([frameX, .4, z], [frameX + .52, 1.45, z], .017, steel);
    beam([frameX + .52, 1.45, z], [frameX, 2.5, z], .017, steel);
  }
  const panel = box(.48, .66, .065, [frameX + .26, 2.6, .31], ivory, root, true);
  animated.push(p => { panel.position.z = .31 + .055 * (1 - Math.cos(p)); });

  function scaffold(x: number, z: number, width: number, height: number) {
    const d = .86;
    for (const px of [x - width / 2, x + width / 2]) for (const pz of [z - d / 2, z + d / 2]) {
      beam([px, .34, pz], [px, height + .8, pz], .026, steel);
      box(.18, .045, .18, [px, .35, pz], blueGrey);
    }
    for (const y of [1.42, height]) {
      for (let i = 0; i < 4; i++) box(width + .17, .075, .19, [x, y, z - .3 + i * .2], timberLight);
      for (const pz of [z - d / 2, z + d / 2]) {
        beam([x - width / 2, y + .65, pz], [x + width / 2, y + .65, pz], .019, steel);
        beam([x - width / 2, y, pz], [x + width / 2, y - 1.04, pz], .014, steel);
        beam([x + width / 2, y, pz], [x - width / 2, y - 1.04, pz], .014, steel);
      }
    }
  }
  scaffold(4.15, .05, 1.36, 2.16);
  scaffold(-3.6, -1.25, 1.25, 2.42);

  function ladder(x: number, z: number, height: number) {
    for (const dx of [-.19, .19]) beam([x + dx, .34, z + .5], [x + dx, height, z], .026, timber);
    for (let y = .55; y < height; y += .24) {
      const pz = z + .5 * (1 - (y - .34) / (height - .34));
      beam([x - .2, y, pz], [x + .2, y, pz], .021, timberLight);
    }
  }
  ladder(4.83, .8, 2.2);
  ladder(-3.9, -.7, 2.46);

  // Partially built architectural rooms, with open studs and unfinished roof joists.
  box(2.4, .06, .22, [-4.55, .34, -4.05], concrete);
  box(2.4, 1.65, .15, [-4.55, 1.18, -4.05], ivory);
  box(.15, .88, 2.15, [-5.68, .79, -3.05], ivory);
  for (let x = -5.5; x < -3.3; x += .43) box(.065, 1.7, .085, [x, 1.24, -2.08], timberLight);
  box(2.4, .085, .085, [-4.55, 2.1, -2.08], timber);
  for (let x = -5.5; x < -3.3; x += .43) box(.065, .1, 2.1, [x, 2.12, -3.04], timberLight);
  box(.12, .12, 1.6, [4.85, .4, -3.25], ivory);
  box(2.2, .12, .12, [3.8, .4, -4.0], ivory);
  for (let x = 2.8; x < 4.9; x += .46) box(.07, 1.62, .07, [x, 1.15, -4.0], blueGrey);
  box(2.15, .08, .08, [3.85, 1.98, -4], blueGrey);
  box(2, .08, .08, [3.86, 1.98, -2.65], blueGrey);
  for (const x of [2.86, 4.86]) box(.08, 1.62, .08, [x, 1.15, -2.65], blueGrey);

  function windowWall(x: number, z: number, width: number, height: number, rotate = false) {
    const wallShape = new THREE.Shape(); wallShape.moveTo(-width / 2, 0); wallShape.lineTo(width / 2, 0); wallShape.lineTo(width / 2, height); wallShape.lineTo(-width / 2, height); wallShape.closePath();
    const count = Math.floor(width / .72);
    const wallGroup = new THREE.Group(); wallGroup.position.set(x, .34, z); if (rotate) wallGroup.rotation.y = Math.PI / 2; root.add(wallGroup);
    for (let i = 0; i < count; i++) {
      const wx = -width / 2 + .23 + i * (width - .2) / count;
      const cutout = new THREE.Path(); cutout.moveTo(wx, .38); cutout.lineTo(wx, height - .23); cutout.lineTo(wx + .38, height - .23); cutout.lineTo(wx + .38, .38); cutout.closePath(); wallShape.holes.push(cutout);
      for (const dx of [0, .19, .38]) box(.023, height - .56, .16, [wx + dx, (height + .15) / 2, .065], white, wallGroup);
      for (const y of [.38, .76, 1.13, height - .23]) if (y < height) box(.42, .024, .16, [wx + .19, y, .065], white, wallGroup);
      box(.48, .055, .23, [wx + .19, .35, .09], ivory, wallGroup);
    }
    mesh(new THREE.ExtrudeGeometry(wallShape, { depth: .11, bevelEnabled: false }), cladding, [0, 0, 0], wallGroup);
    box(width + .08, .065, .2, [0, height + .01, .06], ivory, wallGroup);
    for (const y of [height + .16, height + .25]) beam([-width / 2, y, .06], [width / 2, y, .06], .012, steel, wallGroup);
    for (let wx = -width / 2; wx <= width / 2; wx += .48) beam([wx, height, .06], [wx, height + .26, .06], .012, steel, wallGroup);
  }
  windowWall(-5.7, -2.9, 2.22, 1.8, true);
  windowWall(3.82, -4.08, 2.1, 1.64);
  windowWall(4.95, -3.0, 2.12, 1.64, true);
  // Three shallow steps, rebar at unfinished corners and small masonry stacks.
  for (let i = 0; i < 3; i++) box(.82, .08, .24, [5.3 + i * .2, .38 + (2 - i) * .08, -2.35], concrete);
  for (const [x, z] of [[-5.68, -1.8], [4.94, -1.94]]) for (const dx of [-.04, .04]) beam([x + dx, .4, z], [x + dx, 2.45, z], .009, steel);
  for (let i = 0; i < 9; i++) box(.19, .085, .11, [-5.7 + (i % 3) * .21, .38 + Math.floor(i / 3) * .09, .3], timberLight);
  for (const [x, z] of [[-4.5, -2.9], [3.8, -3.3], [-5, .6]]) {
    const bucket = mesh(new THREE.CylinderGeometry(.08, .06, .14, 12, 1, true), timberLight, [x, .41, z]);
    bucket.castShadow = true;
    beam([x - .07, .52, z], [x + .07, .52, z], .008, steel);
  }

  // Neatly stacked boards on bearers, spare panels, tools and a drafting table.
  for (let layer = 0; layer < 5; layer++) for (let board = 0; board < 4; board++) {
    box(1.68, .065, .16, [-4.5, .46 + layer * .072, 1.72 + board * .19], layer % 2 ? timber : timberLight);
  }
  for (const x of [-5, -4]) box(.12, .09, .9, [x, .38, 2], timber);
  for (let i = 0; i < 4; i++) box(1.25, .07, .7, [4.73, .39 + i * .075, 2.25], concrete);
  const spare = box(.5, 1.35, .07, [-5.7, 1.0, -.85], white); spare.rotation.z = -.18;
  function toolbox(x: number, z: number) {
    box(.32, .17, .2, [x, .42, z], blueGrey, root, true);
    beam([x - .08, .54, z], [x + .08, .54, z], .015, steel);
  }
  toolbox(-2.6, 1.26); toolbox(4.4, 1.7);
  box(.85, .055, .6, [-3, .92, 2.9], timberLight);
  for (const x of [-3.33, -2.67]) for (const z of [2.67, 3.13]) beam([x, .34, z], [x, .9, z], .023, blueGrey);
  const blueprint = box(.58, .009, .43, [-3, .955, 2.9], material(0xe5edf0));
  for (let i = 0; i < 3; i++) line([[-3.2, .962, 2.77 + i * .1], [-2.85, .962, 2.77 + i * .1]], 0x91a6b0, .7, blueprint.parent!);
  // A survey tripod.
  for (let i = 0; i < 3; i++) beam([5.7 + Math.cos(i * TAU / 3) * .27, .34, -1.9 + Math.sin(i * TAU / 3) * .27], [5.7, 1.08, -1.9], .02, timber);
  box(.18, .12, .1, [5.7, 1.14, -1.9], blueGrey);

  // The site continues beyond the frame: side work bays and deeper construction
  // rows give wide and portrait screens real surroundings, rather than empty margins.
  function workBay(x: number, z: number, w: number, d: number, height: number) {
    windowWall(x, z - d / 2, w, height);
    for (const dx of [-w / 2, w / 2]) {
      box(.1, height, .1, [x + dx, .34 + height / 2, z + d / 2], blueGrey);
      box(.1, .1, d, [x + dx, .34 + height, z], blueGrey);
      beam([x + dx, .34, z + d / 2], [x + dx, 1.25, z + d / 2 - .75], .025, steel);
    }
    box(w, .095, .1, [x, .34 + height, z + d / 2], blueGrey);
    for (let dx = -w / 2 + .3; dx < w / 2; dx += .45) {
      box(.055, height, .065, [x + dx, .34 + height / 2, z + d / 2], timberLight);
    }
    box(w, .095, .08, [x, .38, z + d / 2], timber);
    box(.12, .65, d * .6, [x - w / 2, .665, z + d * .2], ivory);
  }
  function pallet(x: number, z: number, panels = false) {
    for (const dx of [-.45, .45]) box(.13, .1, .9, [x + dx, .39, z], timber);
    for (let i = 0; i < 6; i++) box(1.25, .06, .12, [x, .47, z - .38 + i * .15], timberLight);
    if (panels) {
      for (let i = 0; i < 5; i++) box(1.15, .055, .74, [x, .53 + i * .06, z], concrete);
    } else {
      for (let layer = 0; layer < 3; layer++) for (let i = 0; i < 4; i++) box(1.4, .065, .15, [x, .54 + layer * .075, z - .3 + i * .18], timberLight);
    }
  }
  function workTable(x: number, z: number) {
    box(1.25, .07, .62, [x, .98, z], timberLight);
    for (const dx of [-.48, .48]) {
      beam([x + dx, .34, z - .28], [x + dx, .95, z + .2], .025, steel);
      beam([x + dx, .34, z + .28], [x + dx, .95, z - .2], .025, steel);
    }
    box(.43, .014, .36, [x - .24, 1.025, z], white);
    box(.23, .1, .15, [x + .3, 1.07, z], blueGrey);
  }
  workBay(-8.3, -.2, 2.7, 2.5, 1.8);
  workBay(8.1, -1.5, 2.5, 2.1, 2.05);
  workBay(-1.1, -7.0, 3.4, 2.3, 1.8);
  workBay(-5.8, -11.2, 3.7, 2.5, 2.1);
  workBay(6.9, 11.5, 3.5, 2.4, 1.5);
  scaffold(-7.1, 1.25, 1.5, 1.85);
  scaffold(7.4, -3.35, 1.4, 2.1);
  ladder(-7.8, 1.8, 1.88);
  ladder(8, -2.7, 2.15);
  for (const [x, z, panels] of [[-7.7, 3.5, 0], [7.1, 2.65, 1], [-3.4, 6.1, 1], [5.25, 6.8, 0], [-3.8, -6.9, 0], [-2.6, -10, 1], [3.8, 10.8, 0]]) pallet(x, z, !!panels);
  workTable(-6, 4.8); workTable(7.6, 4.3); workTable(-3.3, -8.8);
  toolbox(-5.7, 5.25); toolbox(6.5, 5.3);
  for (let i = 0; i < 5; i++) box(2.0, .085, .09, [-.7, .39 + i * .09, 6.65], blueGrey);
  for (const [x, z] of [[-5.2, 6.2], [6.5, 8.5], [-4.3, -9]]) {
    box(.055, .85, .055, [x - .6, .76, z], timber);
    box(.055, .85, .055, [x + .6, .76, z], timber);
    box(1.35, .075, .075, [x, 1.15, z], ivory);
    beam([x - .7, .36, z + .3], [x - .6, 1.1, z], .025, timber);
    beam([x + .7, .36, z + .3], [x + .6, 1.1, z], .025, timber);
  }

  // Secondary plots have different stages of construction, keeping the large
  // lettering as the only finished silhouette and the basin approach unobstructed.
  function framePlot(x: number, z: number, w: number, d: number, h: number) {
    for (const dx of [-w / 2, w / 2]) {
      box(.16, .065, d + .18, [x + dx, .34, z], concrete);
      for (const dz of [-d / 2, d / 2]) {
        box(.08, h, .08, [x + dx, .35 + h / 2, z + dz], blueGrey);
        box(.2, .045, .2, [x + dx, .365, z + dz], concrete);
      }
      box(.085, .09, d, [x + dx, .35 + h, z], blueGrey);
      beam([x + dx, .36, z - d / 2], [x + dx, h + .3, z + d / 2], .018, steel);
    }
    for (const dz of [-d / 2, d / 2]) {
      box(w, .065, .16, [x, .34, z + dz], concrete);
      box(w, .09, .085, [x, .35 + h, z + dz], blueGrey);
    }
    for (let dx = -w / 2 + .38; dx < w / 2; dx += .42) {
      box(.055, h, .065, [x + dx, .35 + h / 2, z - d / 2], timberLight);
    }
    for (let dx = -w / 2; dx < w / 2; dx += .5) box(.06, .07, d, [x + dx, .41 + h, z], timberLight);
    // A short unfinished masonry course and exposed starter bars.
    for (let course = 0; course < 2; course++) for (let block = 0; block < 5; block++) {
      box(.26, .13, .12, [x - w / 2 + .16 + block * .28 + course * .05, .425 + course * .14, z + d / 2], ivory);
    }
    for (const dx of [-w / 2, w / 2]) beam([x + dx, .35, z + d / 2], [x + dx, .98, z + d / 2], .01, steel);
  }
  // Left: a timber-framing and survey plot beside the existing scaffold bay.
  framePlot(-7, -6.0, 2.6, 2.0, 1.35);
  workTable(-5.35, -5.35);
  pallet(-8.65, -4.25);
  toolbox(-5.65, -4.75);
  for (let i = 0; i < 4; i++) box(1.75, .07, .13, [-7.15, .39 + i * .075, -4.25], timberLight);
  for (let i = 0; i < 3; i++) beam([-5.8 + Math.cos(i * TAU / 3) * .24, .34, -6.7 + Math.sin(i * TAU / 3) * .24], [-5.8, 1.05, -6.7], .018, timber);
  box(.15, .11, .1, [-5.8, 1.12, -6.7], blueGrey);
  // Right: an open room extension, a facade fitting station, and a small scaffold.
  framePlot(8.5, 1.55, 2.2, 1.7, 1.2);
  scaffold(8.8, .55, 1.15, 1.5);
  ladder(9.35, 1.15, 1.54);
  pallet(9.7, 3.1, true);
  for (const x of [6.0, 7.3]) {
    box(.065, 2.25, .065, [x, 1.465, .3], blueGrey);
    beam([x, .34, .8], [x, 1.25, .3], .022, steel);
    box(.38, .07, .7, [x, .365, .3], concrete);
  }
  box(1.45, .09, .1, [6.65, 2.61, .3], blueGrey);
  const sidePanel = box(.95, .85, .065, [6.65, 1.32, .3], ivory, root, true);
  const slingTop = 2.56, slingBottom = 1.745;
  const slings = [6.32, 6.98].map(x => beam([x, slingTop, .3], [x, slingBottom, .3], .009, steel));
  animated.push(p => {
    const lift = .025 * (1 - Math.cos(p));
    sidePanel.position.y = 1.32 + lift;
    slings.forEach(sling => {
      sling.position.y = (slingTop + slingBottom + lift) / 2;
      sling.scale.y = (slingTop - slingBottom - lift) / (slingTop - slingBottom);
    });
  });
  // Background: low skeletal modules and roof beams continue the campus in depth.
  framePlot(3.55, -7.15, 2.5, 2.05, 1.2);
  framePlot(-9.25, -11.1, 2.2, 1.8, 1.45);
  for (let i = 0; i < 5; i++) box(2.5, .06, .13, [-1.2, .4 + i * .07, -9.05], blueGrey);
  pallet(1.9, -9.4);
  // Low storage and masonry at the foreground edges frame the open CTA approach.
  for (const [x, z] of [[-4.5, 7.45], [7.8, 7.15]]) {
    for (const dx of [-.55, .55]) {
      beam([x + dx, .34, z - .25], [x + dx, 1.15, z], .025, timber);
      beam([x + dx, .34, z + .25], [x + dx, 1.15, z], .025, timber);
    }
    for (let i = 0; i < 3; i++) {
      const sheet = box(1.1, .73, .045, [x, .76, z + i * .065], i === 1 ? concrete : ivory);
      sheet.rotation.x = -.14;
    }
  }

  const crew = createConstructionWorkers();
  root.add(crew.group);
  crew.geometries.forEach(g => geometries.add(g));
  crew.materials.forEach(m => materials.add(m));
  animated.push(crew.update);

  // Subtle contact occlusion, multisampling and a fixed orthographic camera.
  const target = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, target);
  const ao = new SSAOPass(scene, camera, 1, 1, 12);
  ao.ssaoMaterial.defines.PERSPECTIVE_CAMERA = 0;
  ao.depthRenderMaterial.defines.PERSPECTIVE_CAMERA = 0;
  ao.kernelRadius = .22; ao.minDistance = .001; ao.maxDistance = .08;
  const dof = new BokehPass(scene, camera, { focus: camera.position.distanceTo(new THREE.Vector3(0, 1.8, 0)), aperture: .00045, maxblur: .004 });
  dof.materialBokeh.defines.PERSPECTIVE_CAMERA = 0;
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(ao); composer.addPass(dof); composer.addPass(new OutputPass());
  let paused = initiallyPaused;
  let elapsed = 0;
  let lastTime = 0;
  let raf = 0;
  let disposed = false;
  let contextLost = false;
  const render = () => {
    const phase = (elapsed % PERIOD) / PERIOD * TAU;
    animated.forEach(update => update(phase));
    composer.render();
    // Keep the small navigation inscription crisp after the scene's depth of field.
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(labelScene, camera);
    renderer.autoClear = true;
  };
  function tick(now: number) {
    raf = 0;
    if (disposed || paused || document.hidden || contextLost) return;
    if (lastTime) elapsed += (now - lastTime) / 1000;
    lastTime = now; render(); raf = requestAnimationFrame(tick);
  }
  function resume() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0; lastTime = 0;
    if (!paused && !document.hidden && !contextLost && !disposed) raf = requestAnimationFrame(tick);
  }
  const resize = () => {
    const width = host.clientWidth, height = host.clientHeight;
    const aspect = width / Math.max(height, 1);
    const halfHeight = Math.max(5.65, 4.9 / aspect);
    camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
    camera.top = halfHeight; camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height); composer.setSize(width, height);
    const anchor = new THREE.Vector3(pool.x, .18, pool.z).project(camera);
    link.style.left = `${(anchor.x * .5 + .5) * 100}%`;
    link.style.top = `${(-anchor.y * .5 + .5) * 100}%`;
    // The accessible link covers the physical inlay and retains a 44px touch target.
    const inlayCorners = [[-2.03, -.32], [2.03, -.32], [-2.03, .32], [2.03, .32]].map(([x, y]) =>
      inlay.localToWorld(new THREE.Vector3(x, y, .02)).project(camera));
    link.style.width = `${(Math.max(...inlayCorners.map(p => p.x)) - Math.min(...inlayCorners.map(p => p.x))) * width / 2}px`;
    link.style.height = `${Math.max(44, (Math.max(...inlayCorners.map(p => p.y)) - Math.min(...inlayCorners.map(p => p.y))) * height / 2)}px`;
    if (!contextLost) render();
  };
  const observer = new ResizeObserver(resize); observer.observe(host);
  const onLost = (event: Event) => { event.preventDefault(); contextLost = true; resume(); host.style.opacity = "0"; host.parentElement?.classList.remove("is-ready"); };
  const onRestored = () => { contextLost = false; resize(); host.style.opacity = ""; host.parentElement?.classList.add("is-ready"); resume(); };
  renderer.domElement.addEventListener("webglcontextlost", onLost);
  renderer.domElement.addEventListener("webglcontextrestored", onRestored);
  document.addEventListener("visibilitychange", resume);
  resize(); resume();
  return {
    setPaused(value: boolean) { paused = value; resume(); },
    dispose() {
      disposed = true; cancelAnimationFrame(raf); observer.disconnect();
      document.removeEventListener("visibilitychange", resume);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onRestored);
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      ao.dispose(); composer.passes.forEach(p => { if (p !== ao) p.dispose(); }); composer.dispose();
      sun.shadow.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
