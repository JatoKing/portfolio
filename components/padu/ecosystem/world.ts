import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CORE, OUTCOMES, PARAMS, SOURCES, VIEWS, type EcoKind, type EcoPlace, type ViewId } from "./data";
import { Assets, INK, Kit, blobTexture, canvasTexture } from "./kit";
import { OUTCOME_BUILDERS, SOURCE_BUILDERS, type Landmark } from "./landmarks";
import { CORE_RADIUS, buildCore, type Core } from "./core";

/*
 * The PADU data ecosystem as one live 3D scene: sources on an arc behind the core,
 * outcomes on an arc in front, data packets running along routes between them the whole
 * time. The camera is a constrained orbit (drag, pan, zoom within limits); hovering
 * highlights a landmark and its route, clicking selects it and eases the camera toward
 * it. Nothing here is driven by page scroll.
 */

export interface WorldOptions {
  /** Element the canvas fills. */
  host: HTMLElement;
  /** The whole interactive stage (canvas plus overlays), for wheel and leave handling. */
  stage: HTMLElement;
  /** Label element for a node, positioned over the scene every frame. */
  label: (id: string) => HTMLElement | null | undefined;
  reduceMotion: boolean;
  fonts: { sans: string; mono: string };
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  /** The camera has come in close to the core (parameter labels become useful). */
  onNear: (near: boolean) => void;
  /** A plain wheel over the scene while it isn't engaged: the page scrolled instead. */
  onWheelBlocked: () => void;
  onEngage: (engaged: boolean) => void;
}

interface Route {
  owner: Entry;
  /** +1 runs into the core, -1 out of it. */
  dir: 1 | -1;
  curve: THREE.CubicBezierCurve3;
  tube: THREE.MeshBasicMaterial;
  bed: THREE.MeshStandardMaterial;
  edge: THREE.LineBasicMaterial;
  color: THREE.Color;
  packets: { t: number; v: number }[];
  h: number;
  d: number;
}

interface Entry {
  id: string;
  kind: EcoKind;
  landmark?: Landmark;
  /** Ground position. */
  at: THREE.Vector3;
  anchor: THREE.Vector3;
  focus: { target: THREE.Vector3; distance: number };
  /** Radius of the ring drawn round its base when highlighted (0 for none), and its height. */
  ring: number;
  ringY: number;
  route?: Route;
  param?: number;
  /** Highlight and dimming, eased toward their targets. */
  h: number;
  d: number;
  shown: string;
}

interface Flight {
  start: number;
  dur: number;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  from: THREE.Spherical;
  to: THREE.Spherical;
}

const WORLD_R = 30;
const LIMITS = { minPolar: 0.5, maxPolar: 1.2, azimuth: 1.15, minDistance: 13, pan: 21 };
/**
 * Share of the remaining drag the camera covers per 60 Hz frame. OrbitControls damps per
 * frame, so its factor is rescaled every frame from the real frame time: the camera then
 * follows the mouse equally closely at 30, 60 or 120 fps (90% of a drag lands in ~150 ms),
 * with a short glide after release.
 */
const DAMPING_60HZ = 0.22;
const WHITE = new THREE.Color(0xffffff);
const HIGHLIGHT = new THREE.Color(INK.flowIn);
const BED = new THREE.Color(0xe3e9fa), BED_HOT = new THREE.Color(0xcfdcff);
const deg = (d: number) => (d * Math.PI) / 180;
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

export class EcosystemWorld {
  private readonly a = new Assets();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 16 / 9, 1, 500);
  private readonly controls: OrbitControls;
  private readonly fog = new THREE.Fog(0xffffff, 80, 200);
  private readonly core: Core;

  private readonly entries: Entry[] = [];
  private readonly byId = new Map<string, Entry>();
  private readonly routes: Route[] = [];
  private readonly pickables: THREE.Mesh[] = [];
  private readonly packets: THREE.InstancedMesh;
  private readonly packetGlows: THREE.InstancedMesh;
  private readonly selRing: THREE.Mesh;
  private readonly hoverRing: THREE.Mesh;

  private hovered: Entry | null = null;
  private selected: Entry | null = null;
  private flight: Flight | null = null;
  private fit = 1;
  private view: ViewId = "overview";
  private engaged = false;
  /** The user is dragging, panning or zooming right now. */
  private interacting = false;
  private near = false;
  private running = false;
  private inView = false;
  private raf = 0;
  private t = 3;
  private last = 0;
  private readonly animate: boolean;
  private readonly cleanup: (() => void)[] = [];

  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly v = new THREE.Vector3();
  private readonly v2 = new THREE.Vector3();
  private readonly dummy = new THREE.Object3D();
  private readonly tmpColor = new THREE.Color();
  private readonly sph = new THREE.Spherical();
  /** Camera state the name tags were last placed for. */
  private readonly tagsFor = new THREE.Matrix4();
  private tagsSize = "";

  constructor(private readonly o: WorldOptions) {
    this.animate = !o.reduceMotion;

    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }));
    // 1.5x is sharp for this flat, clean style with MSAA on, and draws ~45% fewer pixels
    // than full Retina 2x.
    r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    r.setClearColor(0xffffff, 0);
    r.toneMapping = THREE.NeutralToneMapping;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    // Everything that casts a shadow stands still, so the map is drawn once.
    r.shadowMap.autoUpdate = false;
    r.shadowMap.needsUpdate = true;
    r.domElement.setAttribute("aria-hidden", "true");
    o.host.appendChild(r.domElement);

    this.scene.fog = this.fog;
    const pmrem = new THREE.PMREMGenerator(r);
    this.scene.environment = this.a.own(pmrem.fromScene(new RoomEnvironment(), 0.04).texture);
    this.scene.environmentIntensity = 0.45;
    pmrem.dispose();

    const sun = new THREE.DirectionalLight(0xffffff, 2.3);
    sun.position.set(-20, 36, 22);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -33, right: 33, top: 33, bottom: -33, near: 5, far: 110 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    sun.shadow.radius = 3;
    this.scene.add(sun, new THREE.HemisphereLight(0xffffff, 0xdbe3f4, 1.05));

    this.buildGround();
    this.core = buildCore(this.a, o.fonts);
    this.core.kit.freeze();
    this.scene.add(this.core.kit.root);
    this.addCore();
    SOURCES.forEach(s => this.addPlace(s, SOURCE_BUILDERS[s.id](this.a), 1));
    OUTCOMES.forEach(s => this.addPlace(s, OUTCOME_BUILDERS[s.id](this.a), -1));

    // Data packets on every route, each with a soft light pooled on the ground below it
    const count = this.routes.reduce((n, rt) => n + rt.packets.length, 0);
    this.packets = new THREE.InstancedMesh(
      this.a.own(new RoundedBoxGeometry(0.3, 0.2, 0.52, 2, 0.06)),
      this.a.own(new THREE.MeshBasicMaterial()), count);
    this.packetGlows = new THREE.InstancedMesh(
      this.a.own(new THREE.PlaneGeometry(1.6, 1.6).rotateX(-Math.PI / 2)),
      this.a.own(new THREE.MeshBasicMaterial({ map: blobTexture(this.a, "255,255,255"), transparent: true, opacity: 0.5, depthWrite: false })),
      count);
    for (const im of [this.packets, this.packetGlows]) {
      im.frustumCulled = false;
      im.setColorAt(0, WHITE);
      this.scene.add(im);
    }

    // Rings on the ground under whatever is hovered and selected
    this.selRing = new THREE.Mesh(
      this.a.own(new THREE.RingGeometry(0.965, 1, 120).rotateX(-Math.PI / 2)),
      this.a.own(new THREE.MeshBasicMaterial({ color: INK.flowIn, transparent: true, opacity: 0, depthWrite: false })));
    this.hoverRing = new THREE.Mesh(
      this.selRing.geometry,
      this.a.own(new THREE.MeshBasicMaterial({ color: 0x8eaaf5, transparent: true, opacity: 0, depthWrite: false })));
    this.scene.add(this.selRing, this.hoverRing);

    // Camera: a constrained orbit, like a strategy game's
    const c = (this.controls = new OrbitControls(this.camera, r.domElement));
    c.enableDamping = this.animate;
    c.dampingFactor = DAMPING_60HZ;
    c.rotateSpeed = 0.65;
    c.zoomSpeed = 0.9;
    c.panSpeed = 0.75;
    // Keeps the orbit centre over the world. Applied inside update(), before the camera is
    // placed, so it never pulls against a pan the way a correction after update() would.
    c.maxTargetRadius = LIMITS.pan;
    c.screenSpacePanning = false;
    c.zoomToCursor = true;
    c.enableZoom = false;
    c.minDistance = LIMITS.minDistance;
    c.minPolarAngle = LIMITS.minPolar;
    c.maxPolarAngle = LIMITS.maxPolar;
    c.minAzimuthAngle = -LIMITS.azimuth;
    c.maxAzimuthAngle = LIMITS.azimuth;
    c.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
    // One finger scrolls the page as usual; two fingers turn and zoom the model.
    c.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE };
    r.domElement.style.touchAction = "pan-y";

    this.bind();
    this.resize();
    this.goTo("overview", false);
  }

  /* ─── Public API ─────────────────────────────────────────── */

  select(id: string | null, focus = true) {
    const e = id ? this.byId.get(id) ?? null : null;
    if (e !== this.selected) {
      this.selected = e;
      this.invalidate();
    }
    if (e && focus) this.focusOn(e);
  }

  hover(id: string | null) {
    this.setHover(id ? this.byId.get(id) ?? null : null);
  }

  goTo(view: ViewId, animate = true) {
    this.view = view;
    const v = VIEWS[view];
    // Portrait stages look down more steeply, so the world's depth fills their height.
    const polar = this.camera.aspect < 1 ? v.polar - 0.22 : v.polar;
    this.flyTo(new THREE.Vector3(...v.target), v.azimuth, polar, v.distance * this.fit, animate ? 1.1 : 0);
  }

  zoom(factor: number) {
    const s = this.spherical();
    this.flyTo(this.controls.target.clone(), s.theta, s.phi, s.radius * factor, 0.45);
  }

  /** Stops the wheel zooming the model, so it scrolls the page again. */
  release() {
    this.setEngaged(false);
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.cleanup.forEach(f => f());
    this.controls.dispose();
    this.a.dispose();
    this.pickables.forEach(p => p.geometry.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  /* ─── Building ───────────────────────────────────────────── */

  private buildGround() {
    const a = this.a;
    const grid = canvasTexture(a, 256, 256, ctx => {
      ctx.fillStyle = "#f6f8fd";
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = "rgba(58,99,230,0.075)";
      ctx.fillRect(0, 0, 256, 2);
      ctx.fillRect(0, 0, 2, 256);
      ctx.fillStyle = "rgba(58,99,230,0.035)";
      ctx.fillRect(0, 128, 256, 1);
      ctx.fillRect(128, 0, 1, 256);
    });
    grid.wrapS = grid.wrapT = THREE.RepeatWrapping;
    grid.repeat.set(15, 15);
    const top = new THREE.Mesh(
      a.own(new THREE.CircleGeometry(WORLD_R, 160).rotateX(-Math.PI / 2)),
      a.own(new THREE.MeshStandardMaterial({ map: grid, roughness: 0.95 })));
    top.receiveShadow = true;
    const side = new THREE.Mesh(
      a.own(new THREE.CylinderGeometry(WORLD_R, WORLD_R - 0.5, 1.8, 160, 1, true).translate(0, -0.9, 0)),
      a.own(new THREE.MeshStandardMaterial({ color: 0xdfe6f5, roughness: 0.8 })));
    const rim = new THREE.Mesh(
      a.own(new THREE.TorusGeometry(WORLD_R, 0.05, 4, 240).rotateX(Math.PI / 2)),
      a.own(new THREE.MeshBasicMaterial({ color: 0xc5d2f2 })));
    const shadow = new THREE.Mesh(
      a.own(new THREE.PlaneGeometry(WORLD_R * 3.2, WORLD_R * 3.2).rotateX(-Math.PI / 2)),
      a.own(new THREE.MeshBasicMaterial({ map: blobTexture(a, "40,66,140"), transparent: true, opacity: 0.2, depthWrite: false })));
    shadow.position.y = -4;
    this.scene.add(top, side, rim, shadow);

    // Zones: a faint tint under the sources and under the outcomes
    const zone = (inner: number, outer: number, from: number, span: number, color: number) => {
      const z = new THREE.Mesh(
        a.own(new THREE.RingGeometry(inner, outer, 96, 1, deg(from), deg(span)).rotateX(-Math.PI / 2)),
        a.own(new THREE.MeshStandardMaterial({ color, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })));
      z.position.y = 0.01;
      z.receiveShadow = true;
      this.scene.add(z);
    };
    zone(12.6, 25.8, 12, 156, 0xedf2fd);
    zone(12.2, 24.6, 194, 152, 0xebf6f9);

    // Named on the ground in front of and behind the core, square to the opening view.
    const words = (text: string, r: number, width: number, color: string) => {
      const tex = canvasTexture(a, 2048, 120, ctx => {
        const chars = [...text];
        const measure = (size: number) => {
          ctx.font = `600 ${size}px ${this.o.fonts.mono}`;
          return chars.reduce((s, ch) => s + ctx.measureText(ch).width + size * 0.28, -size * 0.28);
        };
        let size = 76;
        while (measure(size) > 1980 && size > 30) size -= 2;
        const track = size * 0.28;
        const w = measure(size);
        ctx.fillStyle = color;
        ctx.textBaseline = "middle";
        let x = (2048 - w) / 2;
        for (const ch of chars) { ctx.fillText(ch, x, 62); x += ctx.measureText(ch).width + track; }
      });
      const m = new THREE.Mesh(
        a.own(new THREE.PlaneGeometry(width, (width * 120) / 2048).rotateX(-Math.PI / 2)),
        a.own(new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })));
      const az = VIEWS.overview.azimuth;
      m.position.set(Math.sin(az) * r, 0.03, Math.cos(az) * r);
      m.rotation.y = az;
      this.scene.add(m);
    };
    words("SUMBER DATA", -27.4, 9, "rgba(47,91,224,0.62)");
    words("KEBERHASILAN PADU", 26.6, 11, "rgba(8,140,170,0.7)");
  }

  private register(e: Entry, proxy: THREE.Mesh) {
    proxy.userData.entry = e;
    this.pickables.push(proxy);
    this.entries.push(e);
    this.byId.set(e.id, e);
  }

  private proxyMaterial = this.a.own(new THREE.MeshBasicMaterial({ visible: false }));

  private addCore() {
    const proxy = new THREE.Mesh(new THREE.CylinderGeometry(CORE_RADIUS, CORE_RADIUS, 11.5, 24).translate(0, 5.75, 0), this.proxyMaterial);
    this.scene.add(proxy);
    const v = VIEWS.core;
    this.register({
      id: CORE.id, kind: "core", landmark: this.core,
      at: new THREE.Vector3(), anchor: new THREE.Vector3(0, this.core.top, 0),
      focus: { target: new THREE.Vector3(...v.target), distance: v.distance },
      ring: CORE_RADIUS + 1.1, ringY: 0.17, h: 0, d: 0, shown: "",
    }, proxy);

    PARAMS.forEach((p, i) => {
      const pos = this.core.tiles[i];
      const tile = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 6), this.proxyMaterial);
      tile.position.copy(pos);
      this.scene.add(tile);
      this.register({
        id: p.id, kind: "param", param: i,
        at: pos.clone().setY(0), anchor: pos.clone().setY(pos.y + 0.75),
        focus: { target: pos.clone(), distance: 24 },
        ring: 0.62, ringY: 0.36, h: 0, d: 0, shown: "",
      }, tile);
    });
  }

  private addPlace(node: EcoPlace, lm: Landmark, dir: 1 | -1) {
    const root = lm.kit.root;
    lm.kit.freeze();
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3()), mid = box.getCenter(new THREE.Vector3());
    const proxy = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), this.proxyMaterial);
    proxy.position.copy(mid);
    root.add(proxy);

    const [x, z] = node.at;
    root.position.set(x, 0, z);
    root.rotation.y = Math.atan2(-x, -z);
    this.scene.add(root);

    const e: Entry = {
      id: node.id, kind: node.kind, landmark: lm,
      at: new THREE.Vector3(x, 0, z), anchor: new THREE.Vector3(x, lm.top, z),
      focus: { target: new THREE.Vector3(x * 0.9, 1.6, z * 0.9), distance: 42 },
      ring: 5.3, ringY: 0.17, h: 0, d: 0, shown: "",
    };
    this.register(e, proxy);

    // Route: leaves the lot head-on and meets the dais square-on, converging toward the
    // core's back (sources) or fanning out from its front (outcomes).
    const ang = Math.atan2(-z, x);
    const mid90 = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    const wrap = (r: number) => Math.atan2(Math.sin(r), Math.cos(r));
    const coreAng = mid90 + wrap(ang - mid90) * 0.62;
    const port = new THREE.Vector3(x, 0, z).addScaledVector(new THREE.Vector3(-x, 0, -z).normalize(), lm.reach).setY(0.14);
    const dock = new THREE.Vector3(Math.cos(coreAng) * (CORE_RADIUS + 0.15), 0.14, -Math.sin(coreAng) * (CORE_RADIUS + 0.15));
    const [from, to] = dir === 1 ? [port, dock] : [dock, port];
    const len = from.distanceTo(to);
    const out = (p: THREE.Vector3, s: number) => p.clone().setY(0).normalize().multiplyScalar(s * len * 0.4).add(p);
    const curve = new THREE.CubicBezierCurve3(from, out(from, -dir), out(to, dir), to);
    e.route = this.addRoute(e, curve, dir);
  }

  private addRoute(owner: Entry, curve: THREE.CubicBezierCurve3, dir: 1 | -1): Route {
    const a = this.a;
    const color = new THREE.Color(dir === 1 ? INK.flowIn : INK.flowOut);
    const segs = 96;
    const left: THREE.Vector3[] = [], right: THREE.Vector3[] = [];
    const pos: number[] = [], idx: number[] = [];
    const p = new THREE.Vector3(), tan = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) {
      curve.getPointAt(i / segs, p);
      curve.getTangentAt(i / segs, tan);
      const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(0.48);
      left.push(p.clone().add(n).setY(0.03));
      right.push(p.clone().sub(n).setY(0.03));
      pos.push(...left[i].toArray(), ...right[i].toArray());
      if (i < segs) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
    }
    const bedGeo = a.own(new THREE.BufferGeometry());
    bedGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    bedGeo.setIndex(idx);
    bedGeo.computeVertexNormals();
    const bed = a.own(new THREE.MeshStandardMaterial({ color: BED, roughness: 0.9, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    const bedMesh = new THREE.Mesh(bedGeo, bed);
    bedMesh.receiveShadow = true;

    const edge = a.own(new THREE.LineBasicMaterial({ color: 0xb4c5f0, transparent: true, opacity: 0.9 }));
    const tube = a.own(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }));
    this.scene.add(
      bedMesh,
      new THREE.Line(a.own(new THREE.BufferGeometry().setFromPoints(left)), edge),
      new THREE.Line(a.own(new THREE.BufferGeometry().setFromPoints(right)), edge),
      new THREE.Mesh(a.own(new THREE.TubeGeometry(curve, 96, 0.055, 6, false)), tube),
    );

    // Constant ground speed, so long routes carry packets as briskly as short ones
    const length = curve.getLength();
    const n = Math.max(4, Math.round(length / 2.4));
    const route: Route = {
      owner, dir, curve, tube, bed, edge, color, h: 0, d: 0,
      packets: Array.from({ length: n }, (_, i) => ({ t: (i + Math.random() * 0.4) / n, v: (1.5 + Math.random() * 0.25) / length })),
    };
    this.routes.push(route);
    return route;
  }

  /* ─── Input ──────────────────────────────────────────────── */

  private bind() {
    const canvas = this.renderer.domElement;
    const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement | Document, type: K, fn: (e: HTMLElementEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      el.addEventListener(type, fn as EventListener, opts);
      this.cleanup.push(() => el.removeEventListener(type, fn as EventListener, opts));
    };

    let hoverQueued = false, lastMove: PointerEvent | null = null;
    on(canvas, "pointermove", e => {
      if (e.pointerType !== "mouse" || e.buttons) return;
      lastMove = e;
      if (hoverQueued) return;
      hoverQueued = true;
      requestAnimationFrame(() => {
        hoverQueued = false;
        if (lastMove) this.setHover(this.pick(lastMove.clientX, lastMove.clientY));
      });
    });
    on(canvas, "pointerleave", () => { lastMove = null; this.setHover(null); });

    let down: { x: number; y: number; t: number } | null = null;
    on(canvas, "pointerdown", e => {
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
      this.setEngaged(true);
    });
    on(canvas, "pointerup", e => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const quick = performance.now() - down.t < 650;
      down = null;
      if (moved > 6 || !quick || e.button !== 0) return;
      const hit = this.pick(e.clientX, e.clientY);
      this.select(hit?.id ?? null, !!hit);
      this.o.onSelect(hit?.id ?? null);
    });

    // The wheel zooms only once the model has been clicked (or with a pinch / ctrl), so
    // scrolling past the footer never gets caught by it.
    on(this.o.stage, "wheel", e => {
      const allow = this.engaged || e.ctrlKey || e.metaKey;
      this.controls.enableZoom = allow;
      if (!allow && e.target === canvas) this.o.onWheelBlocked();
    }, { capture: true, passive: true });
    on(this.o.stage, "pointerleave", e => { if (e.pointerType === "mouse") this.setEngaged(false); });

    // The user always wins: any drag, pan or wheel cancels a flight on the spot.
    this.controls.addEventListener("start", () => {
      this.flight = null;
      this.interacting = true;
      canvas.style.cursor = "grabbing";
    });
    this.controls.addEventListener("end", () => {
      this.interacting = false;
      canvas.style.cursor = this.hovered ? "pointer" : "";
    });
    this.controls.addEventListener("change", () => this.invalidate());

    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.o.host);
    const io = new IntersectionObserver(([en]) => { this.inView = en.isIntersecting; this.updateRunning(); }, { rootMargin: "120px" });
    io.observe(this.o.host);
    const vis = () => this.updateRunning();
    document.addEventListener("visibilitychange", vis);
    this.cleanup.push(() => { ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", vis); });
  }

  private pick(clientX: number, clientY: number): Entry | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickables, false);
    // Parameter tiles sit inside the core's hit area; once they are worth aiming at
    // (close up, or with the core in focus) they win over it.
    const tilesLive = this.near || this.selected?.kind === "core" || this.selected?.kind === "param";
    const entryOf = (h: THREE.Intersection) => h.object.userData.entry as Entry;
    const tile = tilesLive ? hits.find(h => entryOf(h).kind === "param") : undefined;
    const first = hits.find(h => entryOf(h).kind !== "param");
    return tile ? entryOf(tile) : first ? entryOf(first) : null;
  }

  private setHover(e: Entry | null) {
    if (e === this.hovered) return;
    this.hovered = e;
    this.renderer.domElement.style.cursor = e ? "pointer" : "";
    this.o.onHover(e?.id ?? null);
    this.invalidate();
  }

  private setEngaged(on: boolean) {
    if (on === this.engaged) return;
    this.engaged = on;
    if (!on) this.controls.enableZoom = false;
    this.o.onEngage(on);
  }

  /* ─── Camera ─────────────────────────────────────────────── */

  /** The camera's current offset from the orbit centre, in the shared scratch spherical. */
  private spherical() {
    return this.sph.setFromVector3(this.v.copy(this.camera.position).sub(this.controls.target));
  }

  /**
   * Drops any glide left over from the last drag, pan or wheel. A flight moves the camera
   * itself and skips controls.update(), so leftover momentum would otherwise be applied
   * the moment the flight ends and nudge the camera off its destination.
   */
  private stopMomentum() {
    const c = this.controls;
    if (!c.enableDamping) return;
    c.enableDamping = false;
    c.update();
    c.enableDamping = true;
  }

  private flyTo(target: THREE.Vector3, azimuth: number, polar: number, distance: number, dur: number) {
    const c = this.controls;
    const to = new THREE.Spherical(
      THREE.MathUtils.clamp(distance, c.minDistance, c.maxDistance),
      THREE.MathUtils.clamp(polar, c.minPolarAngle, c.maxPolarAngle),
      THREE.MathUtils.clamp(azimuth, c.minAzimuthAngle, c.maxAzimuthAngle));
    this.stopMomentum();
    if (!this.animate || dur <= 0) {
      c.target.copy(target);
      this.camera.position.setFromSpherical(to).add(target);
      this.camera.lookAt(target);
      this.flight = null;
      c.update();
      this.invalidate();
      return;
    }
    // One flight at a time: a new one replaces any in progress, starting from wherever the
    // camera is now.
    this.flight = { start: performance.now(), dur: dur * 1000, fromTarget: c.target.clone(), toTarget: target.clone(), from: this.spherical().clone(), to };
    this.invalidate();
  }

  private stepFlight(now: number) {
    const f = this.flight!;
    const k = Math.min(1, (now - f.start) / f.dur), e = ease(k);
    this.controls.target.lerpVectors(f.fromTarget, f.toTarget, e);
    this.sph.set(
      THREE.MathUtils.lerp(f.from.radius, f.to.radius, e),
      THREE.MathUtils.lerp(f.from.phi, f.to.phi, e),
      THREE.MathUtils.lerp(f.from.theta, f.to.theta, e));
    this.camera.position.setFromSpherical(this.sph).add(this.controls.target);
    this.camera.lookAt(this.controls.target);
    if (k >= 1) {
      // Landed: hand the camera straight back to the controls, with nothing left running.
      this.flight = null;
      this.controls.update();
    }
  }

  /**
   * A short move toward the selection, keeping the current heading and never pulling
   * back. The subject is kept clear of the inspector: left of centre on a wide stage
   * (the panel is on the right), higher up on a narrow one (it is a bottom sheet).
   */
  private focusOn(e: Entry) {
    const s = this.spherical();
    const dist = Math.min(s.radius, e.focus.distance * Math.min(this.fit, 1.8));
    const shift = this.camera.aspect >= 1.1
      ? this.v2.set(Math.cos(s.theta), 0, -Math.sin(s.theta)).multiplyScalar(dist * 0.11)
      : this.v2.set(Math.sin(s.theta), 0, Math.cos(s.theta)).multiplyScalar(dist * 0.16);
    this.flyTo(e.focus.target.clone().add(shift), s.theta, THREE.MathUtils.clamp(s.phi, 0.86, 1.06), dist, 0.9);
  }

  private resize() {
    const w = this.o.host.clientWidth, h = this.o.host.clientHeight;
    if (!w || !h) return;
    const aspect = w / h;
    this.renderer.setSize(w, h);
    // Narrow stages widen the lens a little and pull back, keeping the ground in frame.
    this.camera.fov = aspect >= 1.25 ? 30 : 30 + (1.25 - aspect) * 18;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    const tanH = Math.tan(deg(this.camera.fov / 2)) * aspect;
    const refH = Math.tan(deg(15)) * (16 / 9);
    const prevFit = this.fit;
    // On a narrow stage, frame the landmarks rather than the whole plinth: its bare rim
    // can run off the sides.
    this.fit = Math.max(1, (refH / tanH) * (aspect < 1 ? 0.68 : 1));
    this.controls.maxDistance = VIEWS.overview.distance * this.fit * 1.2;
    // Re-frame for the new shape, but never under the user's hand.
    if (prevFit !== this.fit && !this.selected && !this.interacting && !this.flight) this.goTo(this.view, false);
    this.invalidate();
  }

  /* ─── Frame loop ─────────────────────────────────────────── */

  private updateRunning() {
    const run = this.inView && !document.hidden;
    if (run === this.running) return;
    this.running = run;
    if (run) {
      this.last = performance.now();
      this.invalidate();
    } else {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  private invalidate() {
    if (this.running && !this.raf) this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    this.raf = 0;
    if (!this.running) return;
    const dt = Math.min(Math.max(now - this.last, 0) / 1000, 0.05);
    this.last = now;
    if (this.animate) this.t += dt;
    const step = this.animate ? dt : 0;

    // Exactly one thing drives the camera each frame: a flight, or the controls.
    let moving = false;
    if (this.flight) {
      this.stepFlight(now);
      moving = true;
    } else {
      if (this.animate) this.controls.dampingFactor = 1 - (1 - DAMPING_60HZ) ** (dt * 60);
      moving = this.controls.update(dt);
    }

    const easing = this.updateEmphasis(dt);
    for (const e of this.entries) e.landmark?.tick?.(this.t, step, this.camera);
    this.updatePackets(step);
    this.updateRings(dt);

    const dist = this.camera.position.distanceTo(this.controls.target);
    this.fog.near = dist + 8;
    this.fog.far = dist + 110;
    const near = dist < 46 && Math.hypot(this.controls.target.x, this.controls.target.z) < 10;
    if (near !== this.near) {
      this.near = near;
      this.o.onNear(near);
    }

    this.renderer.render(this.scene, this.camera);
    this.placeLabels();

    // Ambient motion keeps the loop going; with reduced motion it only runs while the
    // camera or a highlight is still settling.
    if (this.animate || moving || easing) this.raf = requestAnimationFrame(this.frame);
  };

  /** Eases each node's highlight and dimming toward its target; returns whether any moved. */
  private updateEmphasis(dt: number) {
    const sel = this.selected, hov = this.hovered;
    const k = this.animate ? 1 - Math.exp(-dt * 10) : 1;
    let moving = false;

    const related = (e: Entry) =>
      !sel || e === sel || e.kind === "core" || sel.kind === "core" || (sel.kind === "param" && e.kind === "param");
    const approach = (from: number, to: number) => {
      const next = Math.abs(to - from) < 0.002 ? to : from + (to - from) * k;
      if (next !== from) moving = true;
      return next;
    };

    for (const e of this.entries) {
      e.h = approach(e.h, e === sel ? 1 : e === hov ? 0.75 : 0);
      e.d = approach(e.d, related(e) ? 0 : 1);
      if (e.param !== undefined) {
        const coreLit = sel?.kind === "core" ? 0.3 : hov?.kind === "core" ? 0.2 : 0;
        this.core.emphasis[e.param] = Math.max(e.h, coreLit);
      } else if (e.landmark) {
        const key = `${e.h.toFixed(3)}|${e.d.toFixed(3)}`;
        if (key !== e.shown) {
          e.shown = key;
          this.paintKit(e.landmark.kit, e.h, e.d);
        }
      }
    }

    for (const r of this.routes) {
      const o = r.owner;
      const h = o === sel ? 1 : o === hov ? 0.7 : sel?.kind === "core" ? 0.55 : hov?.kind === "core" ? 0.35 : 0;
      const d = sel && sel !== o && sel.kind !== "core" && sel.kind !== "param" ? 1 : 0;
      r.h = approach(r.h, h);
      r.d = approach(r.d, d);
      r.tube.opacity = (0.45 + 0.55 * r.h) * (1 - 0.75 * r.d);
      r.tube.color.copy(r.color).lerp(WHITE, r.d * 0.4);
      r.bed.color.copy(BED).lerp(BED_HOT, r.h).lerp(WHITE, r.d * 0.5);
      r.edge.opacity = (0.9 - r.d * 0.55);
      r.edge.color.set(0xb4c5f0).lerp(HIGHLIGHT, r.h * 0.7);
    }
    return moving;
  }

  private paintKit(kit: Kit, h: number, d: number) {
    for (const m of kit.mats) {
      m.color.copy(m.userData.base).lerp(WHITE, d * 0.62);
      m.emissive.copy(m.userData.emissive).lerp(HIGHLIGHT, h * 0.13);
    }
    for (const m of kit.glows) {
      m.color.copy(m.userData.base).lerp(WHITE, d * 0.7);
      if (m.transparent) m.opacity = m.userData.opacity * (1 - d * 0.6);
    }
    kit.line.color.copy(kit.line.userData.base).lerp(HIGHLIGHT, h * 0.8);
    kit.line.opacity = (0.6 + 0.35 * h) * (1 - d * 0.6);
  }

  private updatePackets(dt: number) {
    let i = 0;
    const P = this.v, T = this.v2, d = this.dummy;
    for (const r of this.routes) {
      const speed = 1 + r.h * 0.7;
      for (const p of r.packets) {
        p.t += dt * p.v * speed;
        if (p.t >= 1) {
          p.t -= 1;
          this.arrive(r);
        }
        r.curve.getPointAt(p.t, P);
        r.curve.getTangentAt(p.t, T);
        const s = smooth(p.t / 0.07) * smooth((1 - p.t) / 0.07) * (1 + r.h * 0.4) + 1e-4;
        d.position.set(P.x, P.y + 0.13, P.z);
        d.lookAt(P.x + T.x, P.y + 0.13 + T.y, P.z + T.z);
        d.scale.setScalar(s);
        d.updateMatrix();
        this.packets.setMatrixAt(i, d.matrix);
        this.tmpColor.copy(r.color).lerp(WHITE, r.d * 0.7);
        this.packets.setColorAt(i, this.tmpColor);

        d.position.set(P.x, 0.04, P.z);
        d.rotation.set(0, 0, 0);
        d.scale.setScalar(s * (1 + r.h * 0.3));
        d.updateMatrix();
        this.packetGlows.setMatrixAt(i, d.matrix);
        this.packetGlows.setColorAt(i, this.tmpColor);
        i++;
      }
    }
    for (const im of [this.packets, this.packetGlows]) {
      im.instanceMatrix.needsUpdate = true;
      im.instanceColor!.needsUpdate = true;
    }
  }

  private arrive(r: Route) {
    // Into the core: it pulses and files the data under a parameter. Out of it: the
    // outcome's status lamp flashes. Either way the far end acknowledges.
    if (r.dir === 1) this.core.ping();
    r.owner.landmark?.ping?.();
  }

  private updateRings(dt: number) {
    const k = this.animate ? 1 - Math.exp(-dt * 9) : 1;
    const place = (ring: THREE.Mesh, e: Entry | null, max: number) => {
      const mat = ring.material as THREE.MeshBasicMaterial;
      const on = !!e && e.ring > 0;
      if (on) {
        ring.position.set(e!.at.x, e!.ringY, e!.at.z);
        ring.scale.setScalar(e!.ring);
      }
      mat.opacity += ((on ? max : 0) - mat.opacity) * k;
      ring.visible = mat.opacity > 0.01;
    };
    place(this.selRing, this.selected, 0.9);
    place(this.hoverRing, this.hovered !== this.selected ? this.hovered : null, 0.7);
  }

  /** Pins the name tags over their landmarks; only touches the DOM when the view changed. */
  private placeLabels(force = false) {
    const w = this.o.host.clientWidth, h = this.o.host.clientHeight;
    const size = `${w}x${h}`;
    this.camera.updateMatrixWorld();
    if (!force && size === this.tagsSize && this.tagsFor.equals(this.camera.matrixWorld)) return;
    this.tagsFor.copy(this.camera.matrixWorld);
    this.tagsSize = size;
    for (const e of this.entries) {
      const el = this.o.label(e.id);
      if (!el) continue;
      if (e.param !== undefined) this.v.copy(this.core.tiles[e.param]).setY(this.core.tiles[e.param].y + 0.78);
      else this.v.copy(e.anchor);
      this.v.project(this.camera);
      const off = this.v.z > 1 || Math.abs(this.v.x) > 1.1 || Math.abs(this.v.y) > 1.1;
      el.style.transform = `translate3d(${(((this.v.x + 1) / 2) * w).toFixed(1)}px, ${(((1 - this.v.y) / 2) * h).toFixed(1)}px, 0)`;
      const z = String(Math.round((1 - this.v.z) * 4000));
      if (el.style.zIndex !== z) el.style.zIndex = z;
      if (off !== (el.dataset.off === "1")) el.dataset.off = off ? "1" : "";
    }
  }
}
