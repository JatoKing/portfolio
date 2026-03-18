"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Github, Linkedin, Mail, ExternalLink, Code2, Zap,
  ArrowRight, MapPin, Briefcase, User, Send, Home, Layers, Globe2, GraduationCap,
} from "lucide-react";

interface TypingAnimProps { words: string[]; spd?: number; del?: number; pause?: number; }
interface MCardProps { children: React.ReactNode; style?: React.CSSProperties; glow?: string; className?: string; }
interface SBtnProps { children: React.ReactNode; onClick?: () => void; outline?: boolean; style?: React.CSSProperties; }
interface TickerProps { to: number; sfx?: string; }
interface MarqueeItem { i: string; n: string; img?: string; }
interface MarqueeProps { items: MarqueeItem[]; rev?: boolean; }
interface SBadgeProps { children: React.ReactNode; }
interface DockProps { active: string; goto: (id: string) => void; }
interface GlobePoint { x: number; y: number; z: number; i: number; j: number; front: boolean; }
interface ProjectedPoint { sx: number; sy: number; z: number; }

const T = {
  bg:      "#f8f7f4",
  bg2:     "#f0ede8",
  bg3:     "#e8e4de",
  card:    "#ffffff",
  border:  "rgba(0,0,0,.07)",
  border2: "rgba(0,0,0,.11)",
  text:    "#111111",
  text2:   "#555555",
  text3:   "#888888",
  indigo:  "#4f46e5",
  indigo2: "#6366f1",
  violet:  "#7c3aed",
  cyan:    "#0891b2",
  pill:    "rgba(79,70,229,.08)",
  pillBdr: "rgba(79,70,229,.18)",
  pillTxt: "#4f46e5",
};

const CSS = `
  @property --ba { syntax:'<angle>'; initial-value:0deg; inherits:false; }
  * { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { background:${T.bg}; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:${T.bg}; }
  ::-webkit-scrollbar-thumb { background:${T.indigo2}; border-radius:2px; }
  @keyframes gshift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes mqleft  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes mqright { from{transform:translateX(-50%)} to{transform:translateX(0)} }
  @keyframes spincw  { to{transform:rotate(360deg)} }
  @keyframes spinccw { to{transform:rotate(-360deg)} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes fadeup  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cblink  { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes pulsering { 0%{transform:scale(1);opacity:.9} 70%{transform:scale(2.2);opacity:0} 100%{opacity:0} }
  @keyframes bspin   { to{--ba:360deg;} }
  @keyframes breathe { 0%,100%{opacity:.18} 50%{opacity:.38} }
  @keyframes beammove { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1; } }
  .gtext {
    background: linear-gradient(135deg,#4f46e5,#7c3aed,#0891b2,#4f46e5);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gshift 5s ease infinite;
  }
  .magic-card { transition: transform .22s ease, box-shadow .22s ease; }
  .magic-card:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(0,0,0,.08); }
  .bbeam {
    --ba:0deg;
    background: conic-gradient(from var(--ba) at 50% 50%,
      transparent 0%, #4f46e5 5%, #7c3aed 10%, #0891b2 15%, transparent 22%);
    animation: bspin 4s linear infinite;
    padding:1.5px; border-radius:16px;
  }
  .dock-btn { transition:transform .25s cubic-bezier(.34,1.56,.64,1), background .2s; }
  .dock-btn:hover { transform:scale(1.35) translateY(-7px); }
  .techpill { transition:border-color .2s, background .2s, color .2s; cursor:default; }
  .techpill:hover { border-color:rgba(79,70,229,.35)!important; background:rgba(79,70,229,.07)!important; color:#4f46e5!important; }
  .projcard:hover .projarrow { color:#4f46e5 !important; }
  .projarrow { transition:color .2s; }

  /* ── Experience cards: hidden before Anime.js fires ── */
  .exp-card {
    opacity: 0;
  }
`;

function TypingAnim({ words, spd = 80, del = 45, pause = 2400 }: TypingAnimProps) {
  const [txt, setTxt] = useState("");
  const [wi,  setWi]  = useState(0);
  const [dlg, setDlg] = useState(false);
  useEffect(() => {
    const w = words[wi];
    if (!w) { setWi(0); return; }
    let t: ReturnType<typeof setTimeout>;
    if (!dlg && txt === w) t = setTimeout(() => setDlg(true), pause);
    else if (dlg && txt === "") { setDlg(false); setWi(i => (i + 1) % words.length); }
    else { const n = dlg ? txt.slice(0, -1) : w.slice(0, txt.length + 1); t = setTimeout(() => setTxt(n), dlg ? del : spd); }
    return () => clearTimeout(t);
  }, [txt, dlg, wi, words, spd, del, pause]);
  return <span>{txt}<span style={{ animation: "cblink .9s step-start infinite", color: T.indigo2 }}>|</span></span>;
}

function MCard({ children, style = {}, glow = "rgba(79,70,229,.06)", className = "" }: MCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);
  const mv = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);
  return (
    <div ref={ref} onMouseMove={mv} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`magic-card ${className}`}
      style={{
        borderRadius: 16, border: `1px solid ${hov ? "rgba(79,70,229,.18)" : T.border}`,
        background: hov ? `radial-gradient(280px at ${pos.x}px ${pos.y}px, ${glow}, transparent 70%), ${T.card}` : T.card,
        overflow: "hidden", transition: "background .22s ease, border-color .22s ease", ...style,
      }}>
      {children}
    </div>
  );
}

function SBtn({ children, onClick, outline = false, style = {} }: SBtnProps) {
  return (
    <button onClick={onClick} style={{
      position: "relative", display: "inline-flex", alignItems: "center", gap: 8,
      padding: "11px 22px", borderRadius: 999, fontWeight: 500, fontSize: 14,
      cursor: "pointer", overflow: "hidden",
      backgroundImage: outline ? "none" : `linear-gradient(135deg,${T.indigo},${T.violet})`,
      backgroundSize: "100% 100%", backgroundRepeat: "no-repeat", backgroundColor: "transparent",
      border: outline ? `1.5px solid ${T.border2}` : "none",
      color: outline ? T.text : "white",
      boxShadow: outline ? "none" : "0 4px 18px rgba(79,70,229,.25)", ...style,
    }}>
      <span style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,.22) 50%,transparent 65%)", backgroundSize: "200% 100%", backgroundRepeat: "no-repeat", backgroundPosition: "-100% center", animation: "shimmer 2.6s ease-in-out infinite" }} />
      <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>{children}</span>
    </button>
  );
}

function Ticker({ to, sfx = "" }: TickerProps) {
  const [n, setN] = useState(0);
  const ref  = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true; let t0: number | undefined; const D = 1500;
        const step = (ts: number) => { if (!t0) t0 = ts; const p = Math.min((ts - t0) / D, 1); setN(Math.round((1 - (1 - p) ** 3) * to)); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }
    }, { threshold: .5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n}{sfx}</span>;
}

function Marquee({ items, rev = false }: MarqueeProps) {
  const all = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <div style={{ display: "flex", gap: 10, width: "max-content", animation: `${rev ? "mqright" : "mqleft"} 32s linear infinite` }}>
        {all.map((item, i) => (
          <div key={i} className="techpill" style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 15px", borderRadius: 999, border: `1px solid ${T.border2}`, background: T.card, color: T.text2, fontSize: 13, whiteSpace: "nowrap", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
            {item.img ? <img src={item.img} alt={item.n} width={16} height={16} style={{ objectFit: "contain", flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <span style={{ fontSize: 15 }}>{item.i}</span>}
            {item.n}
          </div>
        ))}
      </div>
    </div>
  );
}

interface OrbitIconProps { item: MarqueeItem; cx: number; cy: number; dur: number; iconBg: string; iconBdr: string; iconShadow: string; dark: boolean; }

function OrbitIcon({ item, cx, cy, dur, iconBg, iconBdr, iconShadow, dark }: OrbitIconProps) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "absolute", left: cx, top: cy, width: 36, height: 36,
        borderRadius: "50%", background: hov ? (dark ? "rgba(99,102,241,0.3)" : "rgba(79,70,229,.12)") : iconBg,
        border: `1px solid ${hov ? (dark ? "rgba(99,102,241,0.6)" : "rgba(79,70,229,.4)") : iconBdr}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        animation: hov ? "none" : `spinccw ${dur}s linear infinite`,
        boxShadow: hov ? `0 0 12px 3px ${dark ? "rgba(99,102,241,0.35)" : "rgba(79,70,229,.2)"}` : iconShadow,
        backdropFilter: dark ? "blur(8px)" : undefined,
        cursor: "default",
        transition: "background .2s, border-color .2s, box-shadow .2s",
        zIndex: hov ? 10 : 1,
      }}
    >
      {item.img
        ? <img src={item.img} alt={item.n} width={18} height={18} style={{ objectFit: "contain" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        : item.i}
      {hov && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: dark ? "rgba(20,20,28,0.95)" : "rgba(17,17,17,0.9)",
          color: "#fff", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
          padding: "4px 9px", borderRadius: 6,
          border: `1px solid ${dark ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)"}`,
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          pointerEvents: "none", zIndex: 20,
        }}>
          {item.n}
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `5px solid ${dark ? "rgba(20,20,28,0.95)" : "rgba(17,17,17,0.9)"}` }} />
        </div>
      )}
    </div>
  );
}

interface OrbitRingPropsExt { icons: MarqueeItem[]; r?: number; dur?: number; dark?: boolean; }
function OrbitRing({ icons, r = 68, dur = 24, dark = false }: OrbitRingPropsExt) {
  const n = icons.length; const sz = r * 2 + 60;
  const trackClr  = dark ? "rgba(255,255,255,0.15)"  : T.border2;
  const iconBg    = dark ? "rgba(255,255,255,0.08)"  : T.card;
  const iconBdr   = dark ? "rgba(255,255,255,0.18)"  : T.border2;
  const iconShadow= dark ? "0 2px 8px rgba(0,0,0,.4)" : "0 2px 8px rgba(0,0,0,.06)";
  const centerBg  = dark ? "rgba(99,102,241,0.2)"    : "rgba(79,70,229,.1)";
  const centerBdr = dark ? "rgba(99,102,241,0.5)"    : "rgba(79,70,229,.25)";
  const centerClr = dark ? "#a5b4fc"                 : T.indigo;
  return (
    <div style={{ position: "relative", width: sz, height: sz }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", borderRadius: "50%", background: centerBg, border: `1.5px solid ${centerBdr}`, padding: 14, zIndex: 2 }}>
        <Code2 size={22} color={centerClr} />
      </div>
      <div style={{ position: "absolute", top: "50%", left: "50%", marginTop: -(r + 18), marginLeft: -(r + 18), width: (r + 18) * 2, height: (r + 18) * 2, animation: `spincw ${dur}s linear infinite` }}>
        <div style={{ position: "absolute", inset: 18, borderRadius: "50%", border: `1px solid ${trackClr}` }} />
        {icons.map((item, i) => {
          const a = (2 * Math.PI * i / n) - Math.PI / 2;
          const cx = (r + 18) + Math.cos(a) * r - 18;
          const cy = (r + 18) + Math.sin(a) * r - 18;
          return <OrbitIcon key={i} item={item} cx={cx} cy={cy} dur={dur} iconBg={iconBg} iconBdr={iconBdr} iconShadow={iconShadow} dark={dark} />;
        })}
      </div>
    </div>
  );
}

function SBadge({ children }: SBadgeProps) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 999, border: `1px solid ${T.pillBdr}`, background: T.pill, color: T.pillTxt, fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
      {children}
    </div>
  );
}

function Dock({ active, goto }: DockProps) {
  const nav = [
    { id: "hero",    Icon: Home,   lbl: "Home" },
    { id: "about",   Icon: User,   lbl: "About" },
    { id: "skills",  Icon: Zap,    lbl: "Skills" },
    { id: "proj",    Icon: Layers, lbl: "Projects" },
    { id: "contact", Icon: Mail,   lbl: "Contact" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 50, display: "flex", alignItems: "center", gap: 5, padding: "10px 13px", borderRadius: 20, background: "rgba(255,255,255,.82)", backdropFilter: "blur(20px)", border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(0,0,0,.1)" }}>
      {nav.map(({ id, Icon, lbl }) => (
        <button key={id} onClick={() => goto(id)} title={lbl} className="dock-btn"
          style={{ width: 42, height: 42, borderRadius: 12, border: active === id ? `1.5px solid rgba(79,70,229,.35)` : `1px solid ${T.border}`, background: active === id ? "rgba(79,70,229,.1)" : "rgba(0,0,0,.02)", color: active === id ? T.indigo : T.text3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} />
        </button>
      ))}
      <div style={{ width: 1, height: 26, background: T.border2, margin: "0 3px" }} />
      {[{ href: "https://github.com", Icon: Github, lbl: "GitHub" }, { href: "https://linkedin.com", Icon: Linkedin, lbl: "LinkedIn" }].map(({ href, Icon, lbl }) => (
        <a key={lbl} href={href} target="_blank" rel="noreferrer" title={lbl} className="dock-btn"
          style={{ width: 42, height: 42, borderRadius: 12, border: `1px solid ${T.border}`, background: "rgba(0,0,0,.02)", color: T.text3, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          <Icon size={17} />
        </a>
      ))}
    </div>
  );
}

function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef(0);
  const mouseRef  = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let W: number, H: number, ang = 0;
    const tiltAng = 0.22, R = 200, LAT = 18, LON = 28;
    const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const onMove = (e: MouseEvent) => { const r = c.getBoundingClientRect(); mouseRef.current = { x: (e.clientX - r.left) / W - .5, y: (e.clientY - r.top) / H - .5 }; };
    window.addEventListener("mousemove", onMove);
    const project = (x: number, y: number, z: number): ProjectedPoint => { const fov = 750, dz = fov + z; return { sx: (x * fov) / dz + W / 2, sy: (y * fov) / dz + H / 2, z }; };
    const rotY = (x: number, z: number, a: number) => ({ x: x * Math.cos(a) - z * Math.sin(a), z: x * Math.sin(a) + z * Math.cos(a) });
    const rotX = (y: number, z: number, a: number) => ({ y: y * Math.cos(a) - z * Math.sin(a), z: y * Math.sin(a) + z * Math.cos(a) });
    const getGrid = (ay: number, ax: number): GlobePoint[] => {
      const pts: GlobePoint[] = [];
      for (let i = 0; i <= LAT; i++) { const lat = (Math.PI * i) / LAT - Math.PI / 2; for (let j = 0; j <= LON; j++) { const lon = (2 * Math.PI * j) / LON; let x = Math.cos(lat) * Math.cos(lon) * R; let y = Math.sin(lat) * R; let z = Math.cos(lat) * Math.sin(lon) * R; const ry = rotY(x, z, ay); x = ry.x; z = ry.z; const rx = rotX(y, z, ax); y = rx.y; z = rx.z; pts.push({ x, y, z, i, j, front: z > -R * .15 }); } }
      return pts;
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H); ang += 0.003;
      const mx = mouseRef.current.x * .3, my = mouseRef.current.y * .18;
      const pts = getGrid(ang + mx, tiltAng + my); const G = LON + 1;
      for (let i = 0; i <= LAT; i++) { const row = pts.slice(i * G, i * G + G); ctx.beginPath(); row.forEach((p, idx) => { const { sx, sy } = project(p.x, p.y, p.z); idx === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); }); ctx.closePath(); const avgZ = row.reduce((s, p) => s + p.z, 0) / row.length; const depth = (avgZ + R) / (R * 2); ctx.strokeStyle = `rgba(79,70,229,${depth * .28 + .04})`; ctx.lineWidth = depth * .9 + .3; ctx.stroke(); }
      for (let j = 0; j <= LON; j++) { ctx.beginPath(); for (let i = 0; i <= LAT; i++) { const p = pts[i * G + j]; const { sx, sy } = project(p.x, p.y, p.z); i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); } ctx.strokeStyle = "rgba(124,58,237,0.12)"; ctx.lineWidth = .5; ctx.stroke(); }
      for (let i = 0; i <= LAT; i += 2) for (let j = 0; j <= LON; j += 2) { const p = pts[i * G + j]; if (!p.front) continue; const { sx, sy, z } = project(p.x, p.y, p.z); const bright = (z + R) / (R * 2); const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5); grd.addColorStop(0, `rgba(79,70,229,${bright * .5})`); grd.addColorStop(1, "transparent"); ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill(); ctx.beginPath(); ctx.arc(sx, sy, 1.4, 0, Math.PI * 2); ctx.fillStyle = `rgba(79,70,229,${bright * .65 + .1})`; ctx.fill(); }
      const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R * 1.2); cg.addColorStop(0, "rgba(79,70,229,0.05)"); cg.addColorStop(.5, "rgba(79,70,229,0.02)"); cg.addColorStop(1, "transparent"); ctx.beginPath(); ctx.arc(W / 2, H / 2, R * 1.2, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />;
}

// ─── Floating Code Tokens Background ────────────────────────────────────────
const TOKENS = [
  "const", "let", "=>", "{}", "[]", "return",
  "async", "await", "useState", "useEffect",
  "</>", "<div>", "null", "undefined", "true",
  "interface", "type", "export", "import",
  ".map()", ".filter()", ".then()", "npm run dev",
  "git commit", "404", "200 OK", "function",
  "class", "extends", "React", "Next.js",
  "0xFF", "01010", "API", "fetch()", "props",
];

const COLORS = [
  "#a5b4fc", "#c4b5fd", "#67e8f9", "#ffffff",
  "#86efac", "#fde047", "#f9a8d4", "#93c5fd",
];

interface TokenItem {
  id: number; token: string; color: string;
  x: number; y: number; fontSize: number;
  duration: number; delay: number;
}

let _tid = 0;
const makeToken = (): TokenItem => ({
  id: _tid++,
  token: TOKENS[Math.floor(Math.random() * TOKENS.length)],
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  x: Math.random() * 96, y: Math.random() * 90,
  fontSize: Math.floor(Math.random() * 6 + 11),
  duration: Math.random() * 3000 + 3000,
  delay: Math.random() * 4000,
});

function FloatingCodeBg() {
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  useEffect(() => {
    setTokens(Array.from({ length: 36 }, makeToken));
    const iv = setInterval(() => {
      setTokens(prev => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        next[idx] = makeToken();
        return next;
      });
    }, 800);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {tokens.map(t => (
        <span key={t.id} style={{ position: "absolute", left: `${t.x}%`, top: `${t.y}%`, fontSize: t.fontSize, fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace", fontWeight: 600, color: t.color, whiteSpace: "nowrap", padding: "10px 14px", borderRadius: 14, border: `1px solid ${t.color}55`, background: `linear-gradient(135deg, ${t.color}18 0%, ${t.color}08 100%)`, boxShadow: `0 0 12px 2px ${t.color}22, inset 0 1px 0 ${t.color}33, 0 4px 24px rgba(0,0,0,0.4)`, backdropFilter: "blur(8px)", animation: `tokenFloat ${t.duration}ms ease-in-out ${t.delay}ms infinite`, willChange: "opacity, transform", letterSpacing: "0.02em" }}>
          {t.token}
        </span>
      ))}
      <style>{`
        @keyframes tokenFloat {
          0%   { opacity: 0;    transform: translateY(0px); }
          15%  { opacity: 0.75; }
          50%  { opacity: 0.55; transform: translateY(-18px); }
          85%  { opacity: 0.75; }
          100% { opacity: 0;    transform: translateY(-32px); }
        }
      `}</style>
    </div>
  );
}

function Hero() {
  const roles = ["Web & Frontend Developer", "Full Stack Developer"];
  return (
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: T.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(79,70,229,.08) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 80% at 0% 50%, rgba(248,247,244,.0) 0%, rgba(248,247,244,.85) 55%, rgba(248,247,244,1) 100%)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", width: 500, height: 500, left: "-6%", top: "5%", borderRadius: "50%", background: "rgba(79,70,229,.06)", filter: "blur(100px)", zIndex: 0, animation: "breathe 7s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 360, height: 360, left: "38%", bottom: "0%", borderRadius: "50%", background: "rgba(124,58,237,.05)", filter: "blur(80px)", zIndex: 0, animation: "breathe 8s ease-in-out 2s infinite" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "52%", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ position: "relative", width: 480, height: 480, flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: -18, borderRadius: "50%", backgroundImage: `radial-gradient(circle, rgba(79,70,229,.1) 0%, transparent 70%)`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", padding: 3, backgroundImage: `linear-gradient(135deg,rgba(79,70,229,.6),rgba(124,58,237,.5),rgba(8,145,178,.4))`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", backgroundColor: T.bg2 }}>
              <img src="ht47" alt="Izzat Imran" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                onError={e => { const el = e.target as HTMLImageElement; el.style.display = "none"; const p = el.parentElement!; p.style.display = "flex"; p.style.alignItems = "center"; p.style.justifyContent = "center"; p.innerHTML = `<span style="font-size:80px">👤</span>`; }} />
            </div>
          </div>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", zIndex: 3, opacity: 0.28 }}><GlobeCanvas /></div>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", boxShadow: "inset 0 0 40px 14px rgba(248,247,244,.55)", zIndex: 4 }} />
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
          {[
            { w: 440, h: 106, dur: "14s", clr: "rgba(79,70,229,.2)",  rev: false, dotClr: T.indigo },
            { w: 385, h:  86, dur: "20s", clr: "rgba(124,58,237,.15)", rev: true,  dotClr: T.violet },
            { w: 520, h: 135, dur: "28s", clr: "rgba(8,145,178,.1)",  rev: false, dotClr: T.cyan },
            { w: 326, h:  68, dur: "10s", clr: "rgba(79,70,229,.12)", rev: true,  dotClr: "#818cf8" },
          ].map((o, i) => (
            <div key={i} style={{ position: "absolute", width: o.w, height: o.h, borderRadius: "50%", border: `1px solid ${o.clr}`, animation: `${o.rev ? "spinccw" : "spincw"} ${o.dur} linear infinite` }}>
              <div style={{ position: "absolute", top: -4, left: "50%", marginLeft: -4, width: 8, height: 8, borderRadius: "50%", background: o.dotClr, boxShadow: `0 0 8px 3px ${o.dotClr}66` }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0, zIndex: 6, pointerEvents: "none" }}>
        <svg viewBox="0 0 1440 88" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 88, overflow: "visible" }}>
          <path d="M0,88 C360,0 1080,0 1440,88 L1440,88 L0,88 Z" fill="#0d0d0f"/>
          <path d="M0,88 C360,0 1080,0 1440,88" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="1.5"/>
          <path d="M0,88 C360,0 1080,0 1440,88" fill="none" stroke="rgba(99,102,241,0.85)" strokeWidth="2.5" strokeLinecap="round" pathLength="1" strokeDasharray="0.12 0.88" style={{ animation: "beammove 6s linear infinite" }}/>
        </svg>
      </div>
      <div style={{ position: "absolute", left: "47%", top: "10%", height: "80%", width: 1, background: `linear-gradient(to bottom, transparent, rgba(79,70,229,.15) 30%, rgba(79,70,229,.15) 70%, transparent)`, zIndex: 4, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 10, width: "50%", paddingLeft: "clamp(24px,6vw,88px)", paddingRight: 40, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 13px", borderRadius: 999, border: `1px solid ${T.border2}`, background: "rgba(255,255,255,.8)", backdropFilter: "blur(12px)", width: "fit-content", fontSize: 12, color: T.text2, animation: "fadeup .6s ease .05s both", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
          <span style={{ position: "relative", width: 7, height: 7, display: "inline-block" }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#16a34a", animation: "pulsering 1.5s ease-out infinite" }} />
          </span>
          Freelance
        </div>
        <div style={{ animation: "fadeup .7s ease .1s both" }}>
          <h1 style={{ fontSize: "clamp(38px,5.8vw,70px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.06, color: T.text }}>
            Muhammad Izzat<br /><span className="gtext">Imran</span>
          </h1>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: "clamp(13px,1.5vw,16px)", color: T.text2, fontWeight: 400, animation: "fadeup .7s ease .2s both" }}>
          <TypingAnim words={roles} />
        </div>
        <p style={{ fontSize: "clamp(13px,1.3vw,14.5px)", color: T.text3, lineHeight: 1.85, maxWidth: 420, animation: "fadeup .7s ease .3s both" }}>
          At <span style={{ color: T.indigo, fontWeight: 500 }}>Unit PADU, Kementerian Ekonomi</span>, I build gov-tech portals with Next.js, React &amp; Tailwind CSS.
          CS graduate from <span style={{ color: T.indigo, fontWeight: 500 }}>UiTM</span> specialising in Netcentric Computing.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", animation: "fadeup .7s ease .4s both" }}>
          <SBtn onClick={() => window.location.href = "/projects/padu"}><Layers size={14} />View Projects<ArrowRight size={14} /></SBtn>
          <SBtn outline onClick={() => window.location.href = "mailto:izzatzamri01@gmail.com"}><Mail size={14} />Get In Touch</SBtn>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", animation: "fadeup .7s ease .5s both" }}>
          {["Next.js", "React", "TypeScript", "Tailwind", "Laravel", "Strapi", "Vertex AI", "MySQL"].map(t => (
            <span key={t} style={{ padding: "3px 10px", borderRadius: 999, border: `1px solid ${T.border2}`, background: "rgba(255,255,255,.85)", backdropFilter: "blur(6px)", color: T.text2, fontSize: 11.5 }}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const stack: MarqueeItem[] = [
    { i: "", n: "Next.js",    img: "https://cdn.simpleicons.org/nextdotjs/ffffff" },
    { i: "", n: "React",      img: "https://cdn.simpleicons.org/react" },
    { i: "", n: "TypeScript", img: "https://cdn.simpleicons.org/typescript" },
    { i: "", n: "Tailwind",   img: "https://cdn.simpleicons.org/tailwindcss" },
    { i: "", n: "Laravel",    img: "https://cdn.simpleicons.org/laravel" },
    { i: "", n: "MySQL",      img: "https://cdn.simpleicons.org/mysql" },
  ];
  return (
    <section id="about" style={{ position: "relative", background: "#0d0d0f", padding: "48px 24px 96px", overflow: "hidden" }}>
      <FloatingCodeBg />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(13,13,15,0.75) 100%)" }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 999, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", color: "#818cf8", fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase" as const, marginBottom: 12, fontWeight: 600 }}>About</div>
          <h2 style={{ fontSize: "clamp(26px,4.5vw,38px)", fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>Crafting <span className="gtext">Digital Experiences</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          <div style={{ gridColumn: "span 2", padding: 30, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
              <div style={{ borderRadius: 14, background: "rgba(99,102,241,0.15)", border: "1.5px solid rgba(99,102,241,0.3)", padding: 11, flexShrink: 0 }}><User size={21} color="#818cf8" /></div>
              <div>
                <div style={{ fontWeight: 600, color: "#ffffff", fontSize: 15 }}>Web &amp; Frontend Developer</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Unit PADU, Kementerian Ekonomi · Putrajaya</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.82, marginBottom: 14 }}>
              I&apos;m Muhammad Izzat Imran — a CS graduate from <strong style={{ color: "#818cf8" }}>Universiti Teknologi MARA (UiTM)</strong> specialising in Netcentric Computing. I design and build frontend interfaces for government portals including Portal Analitik, Portal PADU, and Portal Panduan Pengguna.
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.82 }}>
              I also develop AI-powered chatbots using <strong style={{ color: "#818cf8" }}>Vertex AI Conversational Agents</strong>, integrate headless CMS with Strapi, and implement secure authentication via Google OAuth 2.0.
            </p>
          </div>
          <div style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 2 }}>Tech Stack</div>
            <OrbitRing icons={stack} r={60} dur={26} dark={true} />
          </div>
          <div style={{ padding: 22, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{ borderRadius: 10, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", padding: 8 }}><GraduationCap size={15} color="#818cf8" /></div>
              <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 600 }}>Education</span>
            </div>
            {[
              { deg: "Bachelor's CS (Hons)", field: "Netcentric Computing", school: "UiTM", year: "2025" },
              { deg: "Diploma CS", field: "Computer Science", school: "UiTM", year: "2022" },
            ].map((e, i) => (
              <div key={i} style={{ marginBottom: i === 0 ? 10 : 0, paddingBottom: i === 0 ? 10 : 0, borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{e.deg}</div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>{e.field} · {e.school}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{e.year}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 22, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <div style={{ borderRadius: 10, background: "rgba(8,145,178,0.15)", border: "1px solid rgba(8,145,178,0.3)", padding: 8 }}><MapPin size={15} color={T.cyan} /></div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Based in</span>
            </div>
            <div style={{ fontSize: 26, marginBottom: 3 }}>🇲🇾</div>
            <div style={{ fontWeight: 700, color: "#ffffff", fontSize: 17 }}>Kajang, Selangor</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Working @ Putrajaya</div>
          </div>
          <div style={{ padding: 22, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <div style={{ borderRadius: 10, background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)", padding: 8 }}><Briefcase size={15} color="#4ade80" /></div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Status</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ position: "relative", width: 8, height: 8, display: "inline-block" }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#4ade80" }} />
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#4ade80", animation: "pulsering 1.5s ease-out infinite" }} />
              </span>
              <span style={{ fontSize: 14, color: "#4ade80", fontWeight: 600 }}>Available</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Open to opportunities</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>izzatzamri01@gmail.com</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  const r1: MarqueeItem[] = [
    { i: "", n: "Next.js",      img: "https://cdn.simpleicons.org/nextdotjs/111111" },
    { i: "", n: "React",        img: "https://cdn.simpleicons.org/react" },
    { i: "", n: "TypeScript",   img: "https://cdn.simpleicons.org/typescript" },
    { i: "", n: "Tailwind CSS", img: "https://cdn.simpleicons.org/tailwindcss" },
    { i: "", n: "HeroUI",       img: "https://cdn.simpleicons.org/heroui/111111" },
    { i: "", n: "Laravel",      img: "https://cdn.simpleicons.org/laravel" },
    { i: "", n: "Strapi",       img: "https://cdn.simpleicons.org/strapi" },
    { i: "", n: "MySQL",        img: "https://cdn.simpleicons.org/mysql" },
  ];
  const r2: MarqueeItem[] = [
    { i: "", n: "JavaScript",   img: "https://cdn.simpleicons.org/javascript" },
    { i: "", n: "PHP",          img: "https://cdn.simpleicons.org/php" },
    { i: "", n: "Figma",        img: "https://cdn.simpleicons.org/figma" },
    { i: "", n: "Git",          img: "https://cdn.simpleicons.org/git" },
    { i: "", n: "Vertex AI",    img: "https://cdn.simpleicons.org/googlecloud" },
    { i: "", n: "LottieFiles",  img: "https://cdn.simpleicons.org/lottiefiles" },
    { i: "", n: "Google OAuth", img: "https://cdn.simpleicons.org/google" },
    { i: "", n: "ASP.NET",      img: "https://cdn.simpleicons.org/dotnet" },
  ];
  return (
    <section id="skills" style={{ background: T.bg2, padding: "96px 0", overflow: "hidden" }}>
      <div style={{ maxWidth: 900, marginLeft: "auto", marginRight: "auto", paddingLeft: 24, paddingRight: 24, textAlign: "center", marginBottom: 52 }}>
        <SBadge>Technologies</SBadge>
        <h2 style={{ fontSize: "clamp(26px,4.5vw,38px)", fontWeight: 700, color: T.text }}>My <span className="gtext">Tech Stack</span></h2>
        <p style={{ fontSize: 14, color: T.text3, marginTop: 12, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>Tools &amp; technologies I use to build impactful digital products</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Marquee items={r1} /><Marquee items={r2} rev />
      </div>
    </section>
  );
}

// ─── Experience dengan Anime.js stagger ──────────────────────────────────────
function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggered  = useRef(false);

  const jobs = [
    {
      role: "Web & Frontend Developer", company: "Unit PADU, Kementerian Ekonomi",
      loc: "Putrajaya", period: "2025 – Present",
      accent: T.indigo, accentRaw: "79,70,229", current: true,
      points: [
        "Built Portal Analitik, Portal PADU & Portal Panduan Pengguna with Next.js & Tailwind CSS",
        "Integrated Strapi headless CMS with RESTful APIs for dynamic content",
        "Developed AI chatbot for MyINFO & Portal PADU using Vertex AI",
        "Implemented Google OAuth 2.0 for secure authentication",
        "Managed source code via Git (OSDEC)",
      ],
    },
    {
      role: "IT Development Intern", company: "SB Tape Group Sdn Bhd",
      loc: "Seri Kembangan, Selangor", period: "2025",
      accent: T.violet, accentRaw: "124,58,237", current: false,
      points: [
        "Developed IOSS, ICAR & SCAR modules using VB.Net & ASP.NET",
        "Built weblogin, CRUD operations & report generation",
        "Designed system flowcharts using Draw.io",
        "Participated in user requirement meetings",
      ],
    },
    {
      role: "IT Development Intern", company: "MAP2U Sdn Bhd",
      loc: "Nilai, Negeri Sembilan", period: "2023",
      accent: T.cyan, accentRaw: "8,145,178", current: false,
      points: [
        "Customised template-based websites & built system components",
        "Developed data tables & filters for E-idaman project",
        "Supported UI/UX design for Jabatan Pengaliran Saliran (JPS)",
      ],
    },
  ];

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        // Fire once when the section enters the viewport
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;

          // Dynamic import — safe for SSR / Next.js
          import("animejs").then(({ animate, stagger }) => {
            // Anime.js hanya handle entrance — translateX + opacity
            // Posisi kiri/tengah/kanan diset via alignSelf dalam JSX
            animate(".exp-card", {
              translateX: [-50, 0],
              opacity:    [0, 1],
              duration:   750,
              delay:      stagger(180),
              easing:     "easeOutExpo",
            });
          });
        }
      },
      { threshold: 0.15 },
    );

    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section id="exp" ref={sectionRef} style={{ background: T.bg, padding: "96px 0" }}>
      {/* ── Heading — tetap centered ── */}
      <div style={{ maxWidth: 900, marginLeft: "auto", marginRight: "auto", paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <SBadge>Experience</SBadge>
          <h2 style={{ fontSize: "clamp(26px,4.5vw,38px)", fontWeight: 700, color: T.text }}>
            Work <span className="gtext">Experience</span>
          </h2>
        </div>
      </div>

      {/* ── Cards — full viewport width supaya flex-start betul-betul rapat kiri ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 24, paddingRight: 24 }}>
          {jobs.map((j, i) => (
            <MCard key={i} className="exp-card" style={{ padding: 26, width: "72%", alignSelf: (["flex-start","center","flex-end"] as const)[i] }} glow={`rgba(${j.accentRaw},.05)`}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ borderRadius: 12, background: `rgba(${j.accentRaw},.1)`, border: `1.5px solid rgba(${j.accentRaw},.2)`, padding: 10, flexShrink: 0 }}>
                    <Briefcase size={18} color={j.accent} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, color: T.text, fontSize: 15 }}>{j.role}</span>
                      {j.current && (
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `rgba(${j.accentRaw},.1)`, border: `1px solid rgba(${j.accentRaw},.25)`, color: j.accent, fontWeight: 600 }}>
                          Current
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: j.accent, fontWeight: 500, marginTop: 2 }}>{j.company}</div>
                    <div style={{ fontSize: 12, color: T.text3, marginTop: 1 }}>{j.loc} · {j.period}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 6 }}>
                {j.points.map((p, pi) => (
                  <div key={pi} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: j.accent, flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>{p}</span>
                  </div>
                ))}
              </div>
            </MCard>
          ))}
        </div>
    </section>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function Projects() {
  const projs = [
    { title: "Portal PADU", sub: "Kementerian Ekonomi Malaysia · 2025–Present", desc: "Lead frontend development for Malaysia's national socioeconomic portal. Built 20+ pages with animated infographics, 3D carousels, AI chatbot (Vertex AI), and Strapi CMS integration.", tags: ["Next.js", "Tailwind CSS", "Strapi", "Vertex AI", "HeroUI"], icon: "🇲🇾", accent: T.indigo, accentRaw: "79,70,229", stat: { v: "100k+", l: "Daily Users" }, span2: true,  href: "/projects/padu" },
    { title: "Portal Analitik",         sub: "Kementerian Ekonomi · 2025",     desc: "Analytics portal for government data insights with interactive charts, advanced filtering, and real-time KPI dashboards for policy analysts.",                                          tags: ["Next.js", "React", "Tailwind CSS", "REST API"],          icon: "📊", accent: T.violet,   accentRaw: "124,58,237", stat: undefined, span2: false, href: "/projects/analitik" },
    { title: "Portal Panduan Pengguna", sub: "Kementerian Ekonomi · 2025",     desc: "User guide portal with Strapi headless CMS for dynamic content management and Google OAuth 2.0 for secure government staff authentication.",                                          tags: ["Next.js", "Strapi CMS", "Google OAuth", "REST API"],     icon: "📖", accent: T.cyan,     accentRaw: "8,145,178",  stat: undefined, span2: false, href: "/projects/panduan" },
    { title: "Smart Ticket System",     sub: "Final Year Project · UiTM 2025", desc: "National Football Ticket booking system with real-time seat allocation algorithm for Bukit Jalil Stadium. Deployed on InfinityFree hosting.",                                        tags: ["Laravel", "MySQL", "PHP", "InfinityFree"],                icon: "🏟️", accent: "#d97706", accentRaw: "217,119,6",  stat: undefined, span2: true,  href: "/projects/ticket" },
  ];
  return (
    <section id="proj" style={{ background: T.bg2, padding: "96px 24px" }}>
      <div style={{ maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <SBadge>Work</SBadge>
          <h2 style={{ fontSize: "clamp(26px,4.5vw,38px)", fontWeight: 700, color: T.text }}>Featured <span className="gtext">Projects</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
          {projs.map((p, i) => (
            <MCard key={i} className="projcard" style={{ gridColumn: p.span2 ? "span 2" : "span 1", padding: 26 }} glow={`rgba(${p.accentRaw},.06)`}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div style={{ fontSize: 26, borderRadius: 14, background: `rgba(${p.accentRaw},.07)`, border: `1.5px solid rgba(${p.accentRaw},.15)`, padding: 11, lineHeight: 1, flexShrink: 0 }}>{p.icon}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontWeight: 600, color: T.text, fontSize: 15 }}>{p.title}</span>
                      {p.span2 && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: `rgba(${p.accentRaw},.1)`, border: `1px solid rgba(${p.accentRaw},.25)`, color: p.accent, fontWeight: 600 }}>Featured</span>}
                    </div>
                    <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{p.sub}</div>
                  </div>
                </div>
                {p.stat && <div style={{ textAlign: "right", borderRadius: 12, background: `rgba(${p.accentRaw},.07)`, border: `1.5px solid rgba(${p.accentRaw},.18)`, padding: "10px 15px", flexShrink: 0 }}><div style={{ fontWeight: 700, fontSize: 19, color: p.accent }}>{p.stat.v}</div><div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>{p.stat.l}</div></div>}
              </div>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.78, marginBottom: 14 }}>{p.desc}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{p.tags.map(t => <span key={t} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, border: `1px solid ${T.border2}`, background: T.bg, color: T.text2 }}>{t}</span>)}</div>
                <button className="projarrow" onClick={() => window.location.href = p.href} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T.text3, background: "none", border: "none", cursor: "pointer" }}>View <ExternalLink size={11} /></button>
              </div>
            </MCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const email = "izzatzamri01@gmail.com";
  const copy = () => { navigator.clipboard?.writeText(email); setCopied(true); setTimeout(() => setCopied(false), 2500); };

  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return;
    let rendererRef: any = null;
    let dead = false;

    Promise.all([
      import("three"),
      import("animejs"),
    ]).then(([THREE, { engine, createTimeline, utils }]) => {
      if (dead) return;

      engine.useDefaultMainLoop = false;

      const { width, height } = container.getBoundingClientRect();
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      const scene    = new THREE.Scene();
      const camera   = new THREE.PerspectiveCamera(65, width / height, 0.1, 20);
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xa5b4fc, wireframe: true });

      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset    = "0";
      container.appendChild(renderer.domElement);
      rendererRef = renderer;
      camera.position.z = 5;

      function spawnCube() {
        const cube     = new THREE.Mesh(geometry, material);
        const x        = utils.random(-10, 10, 2);
        const y        = utils.random(-5,   5, 2);
        const z        = [-10, 7] as [number, number];
        const r        = () => utils.random(-Math.PI * 2, Math.PI * 2, 3);
        const duration = 4000;
        createTimeline({
          delay:    utils.random(0, duration),
          defaults: { loop: true, duration, ease: "inSine" },
        })
        .add(cube.position, { x, y, z }, 0)
        .add(cube.rotation, { x: r, y: r, z: r }, 0)
        .init();
        scene.add(cube);
      }

      for (let i = 0; i < 40; i++) spawnCube();

      function render() {
        engine.update();
        renderer.render(scene, camera);
      }
      renderer.setAnimationLoop(render);
    });

    return () => {
      dead = true;
      if (rendererRef) {
        rendererRef.setAnimationLoop(null);
        rendererRef.dispose();
        if (rendererRef.domElement?.parentNode === container) {
          container.removeChild(rendererRef.domElement);
        }
      }
    };
  }, []);

  return (
    <section id="contact" style={{ position: "relative", background: "#0d0d0f", padding: "96px 24px 160px", overflow: "hidden" }}>

      {/* ── Three.js wireframe cube BG ── */}
      <div ref={canvasWrapRef} style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.65, pointerEvents: "none" }} />

      {/* Radial vignette */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(13,13,15,0.75) 100%)" }} />

      {/* ── content ── */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 800, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 999, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", color: "#818cf8", fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase" as const, marginBottom: 12, fontWeight: 600 }}>Contact</div>
          <h2 style={{ fontSize: "clamp(26px,4.5vw,38px)", fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>Let&apos;s <span className="gtext">Connect</span></h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 12 }}>Interested in working together? Let&apos;s build something impactful.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="bbeam">
            <div style={{ borderRadius: 15, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", padding: "26px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <div style={{ borderRadius: 14, background: "rgba(99,102,241,0.15)", border: "1.5px solid rgba(99,102,241,0.3)", padding: 13, flexShrink: 0 }}><Mail size={24} color="#818cf8" /></div>
                <div>
                  <div style={{ fontWeight: 600, color: "#ffffff", fontSize: 15, marginBottom: 3 }}>Drop me an email</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>+6012-296 7752 · Kajang, Selangor</div>
                  <code style={{ fontSize: 13, color: "#818cf8", marginTop: 6, display: "block" }}>{email}</code>
                </div>
              </div>
              <SBtn onClick={copy}>{copied ? <>✓ Copied!</> : <><Send size={13} />Copy Email</>}</SBtn>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              { Icon: Github,   lbl: "GitHub",     hdl: "github.com/izzatimran",   glow: "rgba(99,102,241,.12)" },
              { Icon: Linkedin, lbl: "LinkedIn",   hdl: "Izzat Imran",             glow: "rgba(8,145,178,.12)" },
              { Icon: Globe2,   lbl: "University", hdl: "UiTM · CS Graduate 2025", glow: "rgba(124,58,237,.12)" },
            ].map(({ Icon, lbl, hdl, glow }) => (
              <div key={lbl} style={{ padding: "18px 16px", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", padding: 9 }}><Icon size={17} color="rgba(255,255,255,0.6)" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#ffffff" }}>{lbl}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{hdl}</div>
                  </div>
                  <ExternalLink size={12} color="rgba(255,255,255,0.3)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Portfolio() {
  const [active, setActive] = useState("hero");
  const goto = useCallback((id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setActive(id); }, []);
  useEffect(() => {
    const fn = () => {
      for (const id of ["hero", "about", "skills", "exp", "proj", "contact"]) {
        const el = document.getElementById(id);
        if (el) { const r = el.getBoundingClientRect(); if (r.top <= 180 && r.bottom >= 180) { setActive(id); break; } }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <>
      <style>{CSS}</style>
      <div style={{ fontFamily: "'Inter',system-ui,-apple-system,sans-serif", background: T.bg, minHeight: "100vh" }}>
        <Hero /><About /><Skills /><Experience /><Projects /><Contact />
        <Dock active={active} goto={goto} />
      </div>
    </>
  );
}