import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
 * Building blocks for the ecosystem's landmarks. The look is an architectural model:
 * white massing, banded blue glass, thin edge lines, low-poly trees and figures.
 * Every landmark gets its own Kit, so its materials can be highlighted or dimmed on
 * their own without touching the rest of the world.
 */

export const INK = {
  wall: 0xffffff,
  wall2: 0xedf1f9,
  trim: 0xd3dbee,
  glass: 0x93b3f3,
  glassDeep: 0x4f74d8,
  navy: 0x1a2f6e,
  gold: 0xf2bf2a,
  red: 0xe5333a,
  green: 0xa6d8b0,
  greenDeep: 0x6dbf86,
  trunk: 0xc2ad93,
  water: 0x9fd0f7,
  lot: 0xe9eefa,
  line: 0xa3b3da,
  /** Data flowing into PADU, and out of it. */
  flowIn: 0x2f6bff,
  flowOut: 0x0aa6c6,
  live: 0x22b46a,
} as const;

/** Geometry shared across the world, created once per size and disposed with the world. */
export class Assets {
  private geos = new Map<string, THREE.BufferGeometry>();
  private edges = new WeakMap<THREE.BufferGeometry, THREE.EdgesGeometry>();
  private owned = new Set<{ dispose(): void }>();

  /** Registers anything with GPU resources so the world can free it. */
  own<T extends { dispose(): void }>(x: T): T {
    this.owned.add(x);
    return x;
  }

  geo(key: string, make: () => THREE.BufferGeometry) {
    let g = this.geos.get(key);
    if (!g) this.geos.set(key, (g = this.own(make())));
    return g;
  }

  /** Box resting on y = 0. */
  box(w: number, h: number, d: number) {
    return this.geo(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0));
  }

  /** Cylinder (or cone, or prism) resting on y = 0. */
  cyl(rTop: number, rBot: number, h: number, seg = 28) {
    return this.geo(`c${rTop},${rBot},${h},${seg}`, () =>
      new THREE.CylinderGeometry(rTop, rBot, h, seg).translate(0, h / 2, 0));
  }

  /** Rounded rectangle slab resting on y = 0. */
  slab(w: number, d: number, h: number, r: number) {
    return this.geo(`s${w},${d},${h},${r}`, () => {
      const x = -w / 2, y = -d / 2;
      const s = new THREE.Shape()
        .moveTo(x + r, y).lineTo(x + w - r, y).quadraticCurveTo(x + w, y, x + w, y + r)
        .lineTo(x + w, y + d - r).quadraticCurveTo(x + w, y + d, x + w - r, y + d)
        .lineTo(x + r, y + d).quadraticCurveTo(x, y + d, x, y + d - r)
        .lineTo(x, y + r).quadraticCurveTo(x, y, x + r, y);
      return new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 5 }).rotateX(-Math.PI / 2);
    });
  }

  edgesOf(g: THREE.BufferGeometry) {
    let e = this.edges.get(g);
    if (!e) this.edges.set(g, (e = this.own(new THREE.EdgesGeometry(g, 28))));
    return e;
  }

  dispose() {
    this.owned.forEach(x => x.dispose());
    this.owned.clear();
    this.geos.clear();
  }
}

type StdParams = THREE.MeshStandardMaterialParameters;
type MeshOpts = { edges?: boolean; shadow?: boolean; parent?: THREE.Object3D };

export class Kit {
  readonly root = new THREE.Group();
  /** Parts that move; everything else on the root is merged by freeze(). */
  readonly live = new THREE.Group();
  /** Lit materials, unlit (glowing) materials and edge lines, for highlight and dimming. */
  readonly mats: THREE.MeshStandardMaterial[] = [];
  readonly glows: THREE.MeshBasicMaterial[] = [];
  readonly line: THREE.LineBasicMaterial;

  readonly m: {
    wall: THREE.MeshStandardMaterial; wall2: THREE.MeshStandardMaterial; trim: THREE.MeshStandardMaterial;
    glass: THREE.MeshStandardMaterial; glassDeep: THREE.MeshStandardMaterial; navy: THREE.MeshStandardMaterial;
    accent: THREE.MeshStandardMaterial; green: THREE.MeshStandardMaterial; greenDeep: THREE.MeshStandardMaterial;
    trunk: THREE.MeshStandardMaterial; water: THREE.MeshStandardMaterial; lot: THREE.MeshStandardMaterial;
  };
  /** Unlit accent, for lights, LED strips and holograms. */
  readonly light: THREE.MeshBasicMaterial;

  constructor(readonly a: Assets, readonly accent: number) {
    this.line = a.own(new THREE.LineBasicMaterial({ color: INK.line, transparent: true, opacity: 0.6 }));
    this.line.userData.base = this.line.color.clone();
    this.m = {
      wall: this.std(INK.wall, { roughness: 0.82 }),
      wall2: this.std(INK.wall2, { roughness: 0.86 }),
      trim: this.std(INK.trim, { roughness: 0.7 }),
      glass: this.std(INK.glass, { roughness: 0.16, metalness: 0.2 }),
      glassDeep: this.std(INK.glassDeep, { roughness: 0.2, metalness: 0.25 }),
      navy: this.std(INK.navy, { roughness: 0.45, metalness: 0.15 }),
      accent: this.std(accent, { roughness: 0.42, metalness: 0.08 }),
      green: this.std(INK.green, { roughness: 0.9, flatShading: true }),
      greenDeep: this.std(INK.greenDeep, { roughness: 0.9, flatShading: true }),
      trunk: this.std(INK.trunk, { roughness: 0.9 }),
      water: this.std(INK.water, { roughness: 0.08, metalness: 0.1 }),
      lot: this.std(INK.lot, { roughness: 0.95 }),
    };
    this.light = this.basic(accent);
    this.root.add(this.live);
  }

  std(color: number, p: StdParams = {}) {
    const mat = this.a.own(new THREE.MeshStandardMaterial({ color, ...p }));
    mat.userData.base = mat.color.clone();
    mat.userData.emissive = mat.emissive.clone();
    this.mats.push(mat);
    return mat;
  }

  basic(color: number, p: THREE.MeshBasicMaterialParameters = {}) {
    const mat = this.a.own(new THREE.MeshBasicMaterial({ color, ...p }));
    mat.userData.base = mat.color.clone();
    mat.userData.opacity = mat.opacity;
    this.glows.push(mat);
    return mat;
  }

  mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, o: MeshOpts = {}) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    const shadow = o.shadow ?? !(mat as THREE.MeshBasicMaterial).isMeshBasicMaterial;
    mesh.castShadow = shadow;
    mesh.receiveShadow = shadow;
    if (o.edges ?? true) mesh.add(new THREE.LineSegments(this.a.edgesOf(geo), this.line));
    (o.parent ?? this.root).add(mesh);
    return mesh;
  }

  box(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0, o?: MeshOpts) {
    return this.mesh(this.a.box(w, h, d), mat, x, y, z, o);
  }

  cyl(r: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, o: MeshOpts & { rb?: number; seg?: number } = {}) {
    return this.mesh(this.a.cyl(r, o.rb ?? r, h, o.seg), mat, x, y, z, o);
  }

  /** The landmark's ground lot. */
  lot(w: number, d: number) {
    const lot = this.mesh(this.a.slab(w, d, 0.14, 0.7), this.m.lot, 0, 0, 0, { shadow: false });
    lot.receiveShadow = true;
    return lot;
  }

  /**
   * A block of offices: a glass core with a white slab at every floor and a parapet on
   * the roof. Returns the roof height.
   */
  bands(w: number, d: number, floors: number, x = 0, y = 0, z = 0, o: { floorH?: number; glass?: THREE.Material; parent?: THREE.Object3D } = {}) {
    const fh = o.floorH ?? 0.46;
    const slab = 0.12;
    const h = floors * fh;
    const parent = o.parent;
    this.box(w - 0.14, h, d - 0.14, o.glass ?? this.m.glass, x, y, z, { edges: false, parent });
    for (let i = 0; i <= floors; i++) this.box(w, slab, d, this.m.wall, x, y + i * fh - (i ? slab : 0), z, { parent });
    this.box(w, 0.16, d, this.m.wall, x, y + h, z, { parent });
    return y + h + 0.16;
  }

  /** Low-poly tree. */
  tree(x: number, z: number, s = 1, y = 0.14) {
    this.cyl(0.06 * s, 0.34 * s, this.m.trunk, x, y, z, { edges: false, seg: 6 });
    const crown = this.mesh(
      this.a.geo(`tree${s}`, () => new THREE.IcosahedronGeometry(0.36 * s, 0)),
      (x * 7 + z * 3) % 2 > 1 ? this.m.greenDeep : this.m.green,
      x, y + 0.6 * s, z, { edges: false },
    );
    crown.rotation.y = x + z;
    return crown;
  }

  /** A small figure, about 0.32 tall. */
  person(mat: THREE.Material, x = 0, z = 0, y = 0.14, parent?: THREE.Object3D) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const body = new THREE.Mesh(this.a.geo("person", () => new THREE.CapsuleGeometry(0.065, 0.13, 3, 8).translate(0, 0.13, 0)), mat);
    const head = new THREE.Mesh(this.a.geo("head", () => new THREE.SphereGeometry(0.055, 10, 8).translate(0, 0.32, 0)), mat);
    body.castShadow = head.castShadow = !parent || parent === this.root;
    g.add(body, head);
    (parent ?? this.root).add(g);
    return g;
  }

  /** Status light on a short mast: blinks green while the landmark is connected. */
  beacon(x: number, y: number, z: number) {
    this.cyl(0.025, 0.5, this.m.trim, x, y, z, { edges: false, seg: 6 });
    const lamp = this.basic(INK.live);
    return this.mesh(this.a.geo("lamp", () => new THREE.SphereGeometry(0.09, 12, 8)), lamp, x, y + 0.56, z, { edges: false, parent: this.live });
  }

  /**
   * Bakes every static mesh into one mesh per material, and every edge line into one
   * line set, so a landmark draws in a handful of calls. Call once it is built, before
   * the world places it.
   */
  freeze() {
    this.root.updateMatrixWorld(true);
    const toRoot = this.root.matrixWorld.clone().invert();
    const buckets = new Map<string, { mat: THREE.Material; cast: boolean; receive: boolean; geos: THREE.BufferGeometry[] }>();
    const lines: THREE.BufferGeometry[] = [];
    const baked: THREE.Object3D[] = [];
    const bake = (o: THREE.Mesh | THREE.LineSegments) =>
      (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(toRoot.clone().multiply(o.matrixWorld));

    const visit = (o: THREE.Object3D) => {
      if (o === this.live) return;
      o.children.forEach(visit);
      if (o instanceof THREE.LineSegments) {
        lines.push(bake(o));
        baked.push(o);
      } else if (o instanceof THREE.Mesh && !Array.isArray(o.material)) {
        const g = bake(o);
        for (const name of Object.keys(g.attributes)) if (name !== "position" && name !== "normal" && name !== "uv") g.deleteAttribute(name);
        if (!g.attributes.uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
        g.clearGroups();
        const key = `${o.material.uuid}${o.castShadow ? 1 : 0}${o.receiveShadow ? 1 : 0}`;
        let b = buckets.get(key);
        if (!b) buckets.set(key, (b = { mat: o.material, cast: o.castShadow, receive: o.receiveShadow, geos: [] }));
        b.geos.push(g);
        baked.push(o);
      }
    };
    visit(this.root);
    baked.forEach(o => o.removeFromParent());

    for (const b of buckets.values()) {
      const mesh = new THREE.Mesh(this.a.own(mergeGeometries(b.geos)), b.mat);
      b.geos.forEach(g => g.dispose());
      mesh.castShadow = b.cast;
      mesh.receiveShadow = b.receive;
      this.root.add(mesh);
    }
    if (lines.length) {
      this.root.add(new THREE.LineSegments(this.a.own(mergeGeometries(lines)), this.line));
      lines.forEach(g => g.dispose());
    }
  }
}

/** A canvas texture drawn once. */
export function canvasTexture(a: Assets, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx);
  const tex = a.own(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Soft round blob, for glows and contact shadows on the ground. */
export function blobTexture(a: Assets, rgb: string) {
  return canvasTexture(a, 128, 128, ctx => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, `rgba(${rgb},1)`);
    g.addColorStop(0.35, `rgba(${rgb},0.5)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });
}
