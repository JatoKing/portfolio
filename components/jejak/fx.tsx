"use client";
import { useEffect, useState, type CSSProperties } from "react";

/*
 * Foreground pieces the camera passes through between scenes. Everything here
 * is drawn in code to match the painted backgrounds' palette; nothing is a
 * separate photo. Shapes use an integer-only PRNG so server and client render
 * identical SVG markup.
 */

function prng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n: number) => Math.round(n * 10) / 10;

/* ── Clouds + mist: painted once into canvases, shared as blob URLs ───────── */

function paintCloud(seed: number, mist: boolean) {
  const w = 900;
  const h = mist ? 400 : 540;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const rnd = prng(seed);

  const puffs: [number, number, number][] = [];
  for (let i = 0; i < (mist ? 40 : 46); i++) {
    const t = rnd();
    const dome = Math.sin(Math.PI * (0.06 + 0.88 * t));
    const x = w * (0.08 + 0.84 * t);
    if (mist) {
      const r = h * (0.1 + 0.13 * rnd());
      puffs.push([x, h * 0.58 + (rnd() - 0.5) * h * 0.26, r]);
    } else {
      // Big puffs build the dome on a flat base; small ones make the cauliflower edge.
      const big = rnd() < 0.55;
      const r = h * (big ? 0.1 + 0.17 * dome : 0.045 + 0.06 * rnd()) * (0.8 + 0.4 * rnd());
      puffs.push([x, h * 0.8 - r * 0.7 - dome * h * 0.34 * rnd(), r]);
    }
  }

  const blob = (x: number, y: number, r: number, rgb: string, a: number, core: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`);
    g.addColorStop(core, `rgba(${rgb},${a})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  // Underside first and lower, so it only shows beneath: the blue-grey shading of the painted clouds.
  for (const [x, y, r] of puffs) {
    if (mist) blob(x, y + r * 0.36, r * 1.02, "164,186,196", 0.55, 0.4);
    else blob(x, y + r * 0.42, r * 0.95, "146,168,202", 0.6, 0.5);
  }
  for (const [x, y, r] of puffs) {
    if (mist) blob(x, y, r, "246,250,250", 0.74, 0.42);
    else blob(x, y, r, "255,255,255", 1, 0.62);
  }
  return canvas;
}

const toUrl = (canvas: HTMLCanvasElement) =>
  new Promise<string>(resolve =>
    canvas.toBlob(b => resolve(b ? URL.createObjectURL(b) : canvas.toDataURL()), "image/png"),
  );

export type Sprites = { cloud: string[]; mist: string[] };

/** Three cloud and three mist sprites, painted after mount and revoked on unmount. */
export function useSprites() {
  const [sprites, setSprites] = useState<Sprites | null>(null);
  useEffect(() => {
    let live = true;
    let made: string[] = [];
    const seeds = [11, 23, 37, 101, 113, 127];
    Promise.all(seeds.map((s, i) => toUrl(paintCloud(s, i >= 3)))).then(urls => {
      made = urls;
      if (!live) return urls.forEach(u => u.startsWith("blob:") && URL.revokeObjectURL(u));
      setSprites({ cloud: urls.slice(0, 3), mist: urls.slice(3) });
    });
    return () => {
      live = false;
      made.forEach(u => u.startsWith("blob:") && URL.revokeObjectURL(u));
    };
  }, []);
  return sprites;
}

/** A sprite slot. The element exists from the first render so GSAP can target it; the art fills in once painted. */
export function Sprite({ src, className, style }: { src?: string; className: string; style?: CSSProperties }) {
  return <div className={className} style={{ ...style, backgroundImage: src ? `url(${src})` : undefined }} />;
}

/* ── Shared SVG paint ─────────────────────────────────────────────────────── */

export function FxDefs() {
  const stops = (list: [string, string][]) => list.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />);
  return (
    <svg className="jk-defs" width="0" height="0" aria-hidden focusable="false">
      <defs>
        <linearGradient id="jk-wing-near" gradientUnits="userSpaceOnUse" x1="58" y1="32" x2="20" y2="2">
          {stops([["0", "#f5f8fa"], ["0.55", "#dbe3e9"], ["0.84", "#5c666f"], ["1", "#2b333a"]])}
        </linearGradient>
        <linearGradient id="jk-wing-far" gradientUnits="userSpaceOnUse" x1="64" y1="31" x2="86" y2="7">
          {stops([["0", "#d9e1e7"], ["0.6", "#bcc6ce"], ["1", "#454e56"]])}
        </linearGradient>
        <linearGradient id="jk-bark" x1="0" x2="1" y1="0" y2="0">
          {stops([["0", "#0f100a"], ["0.22", "#201f15"], ["0.55", "#3b3826"], ["0.78", "#262519"], ["1", "#0d0e08"]])}
        </linearGradient>
        <linearGradient id="jk-moss" x1="0" x2="1" y1="0" y2="0">
          {stops([["0", "#2e4a1e"], ["1", "#2e4a1e00"]])}
        </linearGradient>

        {/*
          Depth of field for things right at the lens. Drawn inside each SVG rather than as a CSS
          filter: WebKit drops CSS filters on composited (moving) layers, SVG filters survive.
          stdDeviation is in each graphic's own viewBox units.
        */}
        {([["trunk", 1.3], ["leaf", 2.4], ["brush", 5.5], ["curtain", 3.2]] as const).map(([name, sd]) => (
          <filter key={name} id={`jk-blur-${name}`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation={sd} />
          </filter>
        ))}
        {/* The bird that crosses the lens is backlit: darkened, slightly soft. */}
        <filter id="jk-blur-silhouette" x="-25%" y="-25%" width="150%" height="150%">
          <feColorMatrix type="matrix" values="0.26 0 0 0 0.01  0 0.27 0 0 0.02  0 0 0.3 0 0.03  0 0 0 1 0" />
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
      </defs>
    </svg>
  );
}

/* ── Birds: gull silhouettes with a CSS wing beat ─────────────────────────── */

/** A gull in three-quarter view, flying left to right: far wing, body, near wing. */
export function Bird({ className, style, filter }: { className?: string; style?: CSSProperties; filter?: string }) {
  return (
    <svg className={`jk-bird ${className ?? ""}`} style={style} viewBox="0 0 120 60" aria-hidden>
      <g filter={filter ? `url(#jk-blur-${filter})` : undefined}>
        <path className="jk-bird__wing jk-bird__wing--far" d="M63 31C67 21 74 13 86 7C83 15 77 24 67 33Z" fill="url(#jk-wing-far)" />
        <path d="M26 35L17 33L20 36.5L16 39.5L29 37.4Z" fill="#d6dde3" />
        <path d="M26 35C38 31 60 28 78 29C85 29 90 30 93 32C90 34 85 35 78 35.5C60 37.5 40 38 26 35Z" fill="#f1f4f6" />
        <path d="M92.6 31.4L99.5 32.6L92.6 33.6Z" fill="#d6a23e" />
        <circle cx="88.2" cy="31.3" r="0.9" fill="#1b2127" />
        <path className="jk-bird__wing jk-bird__wing--near" d="M60 31C52 20 40 10 20 2C27 11 31 17 35 22C30 21 26 21 22 21C33 26 42 31 50 35Z" fill="url(#jk-wing-near)" />
      </g>
    </svg>
  );
}

/* ── Tree trunk the camera slips behind ───────────────────────────────────── */

export function Trunk() {
  return (
    <svg className="jk-trunk" viewBox="0 0 200 1000" preserveAspectRatio="none" aria-hidden>
      <g filter="url(#jk-blur-trunk)">
        <path
          d="M16 1000C22 900 12 820 18 720C24 610 8 520 14 420C20 300 10 200 22 90L26 0H176C186 120 178 220 184 330C190 450 176 560 182 680C188 800 180 900 188 1000Z"
          fill="url(#jk-bark)"
        />
        <path d="M16 1000C22 900 12 820 18 720C24 610 8 520 14 420C20 300 10 200 22 90L26 0H70C60 300 66 700 58 1000Z" fill="url(#jk-moss)" opacity="0.7" />
        <g fill="none" stroke="#090905" strokeLinecap="round" opacity="0.5">
          <path d="M46 0C40 220 58 420 44 640S52 900 48 1000" strokeWidth="5" />
          <path d="M82 0C90 180 74 380 86 560S78 860 90 1000" strokeWidth="3" />
          <path d="M118 0C112 240 128 460 116 700S124 920 120 1000" strokeWidth="6" />
          <path d="M150 0C158 200 144 430 156 650S148 880 158 1000" strokeWidth="3.5" />
          <path d="M64 120C70 180 60 240 66 300M100 520C96 600 106 660 100 740M136 260C140 320 132 380 138 430" strokeWidth="2" />
        </g>
        <path d="M172 0C186 360 176 700 184 1000" stroke="#8c8358" strokeWidth="7" opacity="0.28" fill="none" />
      </g>
    </svg>
  );
}

/* ── Leaves ───────────────────────────────────────────────────────────────── */

const LEAF = "M0 0C5-6.5 17-8 28 0C17 8 5 6.5 0 0Z";
const GREENS = ["#0f2a1a", "#163a21", "#1e4b28", "#285d2f", "#386f35", "#4f8540", "#6f9e4c"];

type Leaf = { x: number; y: number; r: number; s: number; c: string };

function scatter(seed: number, n: number, fit: (x: number, y: number) => boolean, w: number, h: number, sMin: number, sMax: number, light = 1) {
  const rnd = prng(seed);
  const out: Leaf[] = [];
  for (let guard = 0; out.length < n && guard < n * 20; guard++) {
    const x = rnd() * w;
    const y = rnd() * h;
    if (!fit(x, y)) continue;
    const shade = Math.min(GREENS.length - 1, Math.floor(rnd() * GREENS.length * light));
    out.push({ x: r1(x), y: r1(y), r: Math.round(rnd() * 360), s: r1(sMin + rnd() * (sMax - sMin)), c: GREENS[shade] });
  }
  return out;
}

function LeafPaths({ leaves }: { leaves: Leaf[] }) {
  return (
    <>
      {leaves.map((l, i) => (
        <path key={i} d={LEAF} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`} fill={l.c} />
      ))}
    </>
  );
}

/** A dense spray of leaves around a dark core, for branches sweeping past the lens. */
export function LeafCluster({ seed, className, soft = "leaf" }: { seed: number; className?: string; soft?: "leaf" | "brush" }) {
  const inside = (x: number, y: number) => {
    const dx = (x - 200) / 180;
    const dy = (y - 150) / 120;
    return dx * dx + dy * dy < 1;
  };
  const leaves = scatter(seed, 70, inside, 400, 300, 1.6, 3.4);
  return (
    <svg className={`jk-leaves ${className ?? ""}`} viewBox="0 0 400 300" aria-hidden>
      <g filter={`url(#jk-blur-${soft})`}>
        <ellipse cx="200" cy="150" rx="118" ry="68" fill="#10301a" />
        <LeafPaths leaves={leaves} />
      </g>
    </svg>
  );
}

/** Half of the foliage the trail pushes through before the clearing. The ragged edge faces the centre. */
export function Curtain({ side }: { side: "l" | "r" }) {
  const seed = side === "l" ? 7 : 19;
  const body = scatter(seed, 90, x => x < 470, 600, 1000, 2.2, 4.2, 0.6);
  const edge = scatter(seed + 3, 80, x => x > 360 && x < 590, 600, 1000, 2, 5, 0.85);
  return (
    <svg
      className={`jk-curtain jk-curtain--${side}`}
      viewBox="0 0 600 1000"
      preserveAspectRatio={side === "l" ? "xMaxYMid slice" : "xMinYMid slice"}
      aria-hidden
    >
      <g transform={side === "r" ? "translate(600 0) scale(-1 1)" : undefined} filter="url(#jk-blur-curtain)">
        <rect x="-20" y="-40" width="490" height="1080" fill="#0c2216" />
        <LeafPaths leaves={body} />
        <LeafPaths leaves={edge} />
      </g>
    </svg>
  );
}

/* ── Particles: waterfall spray and sunlit dust ───────────────────────────── */

type Mote = { x: number; y: number; vx: number; vy: number; s: number; a: number; p: number };

export class ParticleField {
  private ctx: CanvasRenderingContext2D | null;
  private dot: HTMLCanvasElement;
  private motes: Mote[] = [];
  private raf = 0;
  private last = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;

  constructor(private canvas: HTMLCanvasElement, private mode: "spray" | "dust", private count: number) {
    this.ctx = canvas.getContext("2d");
    this.dot = document.createElement("canvas");
    this.dot.width = this.dot.height = 32;
    const d = this.dot.getContext("2d");
    if (d) {
      const rgb = mode === "spray" ? "255,255,255" : "255,236,190";
      const g = d.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, `rgba(${rgb},1)`);
      g.addColorStop(0.4, `rgba(${rgb},0.55)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      d.fillStyle = g;
      d.fillRect(0, 0, 32, 32);
    }
    this.resize();
    for (let i = 0; i < count; i++) this.motes.push(this.spawn(true));
  }

  resize = () => {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
  };

  private spawn(anywhere: boolean): Mote {
    const spray = this.mode === "spray";
    const big = Math.random() < (spray ? 0.12 : 0.08);
    return {
      x: Math.random() * this.w,
      y: anywhere ? Math.random() * this.h : this.h * (spray ? 1.02 : 0.4 + Math.random() * 0.7),
      vx: (Math.random() - 0.5) * (spray ? 18 : 8),
      vy: spray ? -(14 + Math.random() * 46) : -(3 + Math.random() * 8),
      s: big ? 14 + Math.random() * 18 : 2 + Math.random() * (spray ? 5 : 3.5),
      a: big ? 0.05 + Math.random() * 0.06 : 0.12 + Math.random() * (spray ? 0.4 : 0.5),
      p: Math.random() * Math.PI * 2,
    };
  }

  private frame = (now: number) => {
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    const { ctx, dpr } = this;
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, this.w, this.h);
      for (let i = 0; i < this.motes.length; i++) {
        const m = this.motes[i];
        m.p += dt * (this.mode === "dust" ? 1.6 : 0.8);
        m.x += (m.vx + Math.sin(m.p) * 6) * dt;
        m.y += m.vy * dt;
        if (m.y < -40 || m.x < -40 || m.x > this.w + 40) this.motes[i] = this.spawn(false);
        ctx.globalAlpha = this.mode === "dust" ? m.a * (0.55 + 0.45 * Math.sin(m.p * 1.7)) : m.a;
        ctx.drawImage(this.dot, m.x - m.s / 2, m.y - m.s / 2, m.s, m.s);
      }
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  start() {
    if (this.raf) return;
    this.last = 0;
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
}
