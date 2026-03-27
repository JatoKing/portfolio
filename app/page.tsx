"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Github, Linkedin, Mail, ExternalLink, Code2, Zap,
  ArrowRight, MapPin, Briefcase, User, Send, Home, Layers, Globe2, GraduationCap,
} from "lucide-react";
import LoadingScreen from "@/components/ui/LoadingScreen";

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

const TECH_CSS = `
  @keyframes beammove { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1; } }
  .techpill { transition: border-color .2s, background .2s, color .2s; cursor: default; }
  .techpill:hover { border-color: rgba(79,70,229,.35) !important; background: rgba(79,70,229,.07) !important; color: #4f46e5 !important; }
`;

const RESPONSIVE_CSS = `
  @media (max-width: 1023px) {
    .exp-card { width: 90% !important; }
    .exp-card:nth-child(even) { align-self: flex-end !important; }
  }
  @media (max-width: 639px) {
    .exp-card { width: 100% !important; align-self: flex-start !important; }
    .dock-wrap {
      gap: 3px !important;
      padding: 8px 10px !important;
      border-radius: 16px !important;
      bottom: 14px !important;
    }
    .dock-btn { width: 36px !important; height: 36px !important; border-radius: 10px !important; }
    .dock-sep { display: none !important; }
    .o-row td { padding-top: 14px !important; padding-bottom: 14px !important; }
  }
`;

function useBreakpoint() {
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">("desktop");
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

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
    <div className="dock-wrap" style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 50, display: "flex", alignItems: "center", gap: 5, padding: "10px 13px", borderRadius: 20, background: "rgba(255,255,255,.82)", backdropFilter: "blur(20px)", border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(0,0,0,.1)" }}>
      {nav.map(({ id, Icon, lbl }) => (
        <button key={id} onClick={() => goto(id)} title={lbl} className="dock-btn"
          style={{ width: 42, height: 42, borderRadius: 12, border: active === id ? `1.5px solid rgba(79,70,229,.35)` : `1px solid ${T.border}`, background: active === id ? "rgba(79,70,229,.1)" : "rgba(0,0,0,.02)", color: active === id ? T.indigo : T.text3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} />
        </button>
      ))}
      <div className="dock-sep" style={{ width: 1, height: 26, background: T.border2, margin: "0 3px" }} />
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
const COLORS = ["#a5b4fc", "#c4b5fd", "#67e8f9", "#ffffff", "#86efac", "#fde047", "#f9a8d4", "#93c5fd"];
interface TokenItem { id: number; token: string; color: string; x: number; y: number; fontSize: number; duration: number; delay: number; }
let _tid = 0;
const makeToken = (): TokenItem => ({
  id: _tid++, token: TOKENS[Math.floor(Math.random() * TOKENS.length)], color: COLORS[Math.floor(Math.random() * COLORS.length)],
  x: Math.random() * 96, y: Math.random() * 90, fontSize: Math.floor(Math.random() * 6 + 11),
  duration: Math.random() * 3000 + 3000, delay: Math.random() * 4000,
});
function FloatingCodeBg() {
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  useEffect(() => {
    setTokens(Array.from({ length: 36 }, makeToken));
    const iv = setInterval(() => {
      setTokens(prev => { const next = [...prev]; next[Math.floor(Math.random() * next.length)] = makeToken(); return next; });
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
      <style>{`@keyframes tokenFloat { 0%{opacity:0;transform:translateY(0)} 15%{opacity:.75} 50%{opacity:.55;transform:translateY(-18px)} 85%{opacity:.75} 100%{opacity:0;transform:translateY(-32px)} }`}</style>
    </div>
  );
}

function Hero() {
  const bp       = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const roles    = ["Web & Frontend Developer", "Full Stack Developer"];

  if (isMobile) {
    return (
      <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg, overflow: "hidden", padding: "80px 28px 120px" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(79,70,229,.08) 1px, transparent 1px)", backgroundSize: "28px 28px", zIndex: 0 }} />
        <div style={{ position: "absolute", width: 320, height: 320, top: "5%", left: "50%", transform: "translateX(-50%)", borderRadius: "50%", background: "rgba(79,70,229,.07)", filter: "blur(80px)", zIndex: 0 }} />
        <div style={{ position: "absolute", width: 240, height: 240, bottom: "10%", right: "-10%", borderRadius: "50%", background: "rgba(124,58,237,.05)", filter: "blur(70px)", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 2, width: 148, height: 148, borderRadius: "50%", padding: 3, background: `linear-gradient(135deg,rgba(79,70,229,.7),rgba(124,58,237,.6),rgba(8,145,178,.5))`, marginBottom: 28, flexShrink: 0, animation: "fadeup .6s ease .05s both" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", backgroundColor: T.bg2 }}>
            <img src="ht47" alt="Izzat Imran" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
              onError={e => { const el = e.target as HTMLImageElement; el.style.display = "none"; const p = el.parentElement!; p.style.display = "flex"; p.style.alignItems = "center"; p.style.justifyContent = "center"; p.innerHTML = `<span style="font-size:55px">👤</span>`; }} />
          </div>
          <div style={{ position: "absolute", inset: -12, borderRadius: "50%", border: "1px solid rgba(79,70,229,.2)", animation: "spincw 10s linear infinite" }}>
            <div style={{ position: "absolute", top: -4, left: "50%", marginLeft: -4, width: 8, height: 8, borderRadius: "50%", background: T.indigo, boxShadow: `0 0 8px 3px ${T.indigo}66` }} />
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 13px", borderRadius: 999, border: `1px solid ${T.border2}`, background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)", fontSize: 12, color: T.text2, animation: "fadeup .6s ease .1s both", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
            <span style={{ position: "relative", width: 7, height: 7, display: "inline-block" }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#16a34a" }} />
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#16a34a", animation: "pulsering 1.5s ease-out infinite" }} />
            </span>
            Open for Work
          </div>
          <div style={{ animation: "fadeup .7s ease .15s both" }}>
            <h1 style={{ fontSize: "clamp(30px,8.5vw,42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: T.text }}>
              Muhammad Izzat<br /><span className="gtext">Imran</span>
            </h1>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 13, color: T.text2, animation: "fadeup .7s ease .2s both" }}>
            <TypingAnim words={roles} />
          </div>
          <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.8, maxWidth: 310, animation: "fadeup .7s ease .25s both" }}>
            At <span style={{ color: T.indigo, fontWeight: 500 }}>Unit PADU, Kementerian Ekonomi</span> — building gov-tech portals with Next.js &amp; Tailwind CSS.
          </p>
          <div style={{ display: "flex", gap: 10, animation: "fadeup .7s ease .3s both" }}>
            <SBtn onClick={() => window.location.href = "/projects/padu"} style={{ padding: "10px 18px", fontSize: 13 }}><Layers size={13} />Projects<ArrowRight size={13} /></SBtn>
            <SBtn outline onClick={() => window.location.href = "mailto:izzatzamri01@gmail.com"} style={{ padding: "10px 18px", fontSize: 13 }}><Mail size={13} />Contact</SBtn>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", animation: "fadeup .7s ease .35s both" }}>
            {["Next.js", "React", "TypeScript", "Tailwind", "Laravel"].map(t => (
              <span key={t} style={{ padding: "3px 9px", borderRadius: 999, border: `1px solid ${T.border2}`, background: "rgba(255,255,255,.85)", color: T.text2, fontSize: 11 }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0, zIndex: 6, pointerEvents: "none" }}>
          <svg viewBox="0 0 1440 88" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 56, overflow: "visible" }}>
            <path d="M0,88 C360,0 1080,0 1440,88 L1440,88 L0,88 Z" fill="#0d0d0f" />
            <path d="M0,88 C360,0 1080,0 1440,88" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" />
          </svg>
        </div>
      </section>
    );
  }

  const imgSize = isTablet ? 320 : 480;
  const rightW  = isTablet ? "46%" : "52%";

  return (
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: T.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(79,70,229,.08) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 80% at 0% 50%, rgba(248,247,244,.0) 0%, rgba(248,247,244,.85) 55%, rgba(248,247,244,1) 100%)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", width: 500, height: 500, left: "-6%", top: "5%", borderRadius: "50%", background: "rgba(79,70,229,.06)", filter: "blur(100px)", zIndex: 0, animation: "breathe 7s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 360, height: 360, left: "38%", bottom: "0%", borderRadius: "50%", background: "rgba(124,58,237,.05)", filter: "blur(80px)", zIndex: 0 }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: rightW, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ position: "relative", width: imgSize, height: imgSize, flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: -18, borderRadius: "50%", backgroundImage: `radial-gradient(circle, rgba(79,70,229,.1) 0%, transparent 70%)` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", padding: 3, backgroundImage: `linear-gradient(135deg,rgba(79,70,229,.6),rgba(124,58,237,.5),rgba(8,145,178,.4))` }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", backgroundColor: T.bg2 }}>
              <img src="ht47" alt="Izzat Imran" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                onError={e => { const el = e.target as HTMLImageElement; el.style.display = "none"; const p = el.parentElement!; p.style.display = "flex"; p.style.alignItems = "center"; p.style.justifyContent = "center"; p.innerHTML = `<span style="font-size:${isTablet ? 60 : 80}px">👤</span>`; }} />
            </div>
          </div>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", zIndex: 3, opacity: 0.28 }}><GlobeCanvas /></div>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", boxShadow: "inset 0 0 40px 14px rgba(248,247,244,.55)", zIndex: 4 }} />
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
          {[
            { w: isTablet ? 300 : 440, h: isTablet ? 74 : 106, dur: "14s", clr: "rgba(79,70,229,.2)",  rev: false, dotClr: T.indigo },
            { w: isTablet ? 260 : 385, h: isTablet ? 60 : 86,  dur: "20s", clr: "rgba(124,58,237,.15)", rev: true,  dotClr: T.violet },
            { w: isTablet ? 360 : 520, h: isTablet ? 90 : 135, dur: "28s", clr: "rgba(8,145,178,.1)",   rev: false, dotClr: T.cyan },
            { w: isTablet ? 220 : 326, h: isTablet ? 48 : 68,  dur: "10s", clr: "rgba(79,70,229,.12)",  rev: true,  dotClr: "#818cf8" },
          ].map((o, i) => (
            <div key={i} style={{ position: "absolute", width: o.w, height: o.h, borderRadius: "50%", border: `1px solid ${o.clr}`, animation: `${o.rev ? "spinccw" : "spincw"} ${o.dur} linear infinite` }}>
              <div style={{ position: "absolute", top: -4, left: "50%", marginLeft: -4, width: 8, height: 8, borderRadius: "50%", background: o.dotClr, boxShadow: `0 0 8px 3px ${o.dotClr}66` }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0, zIndex: 6, pointerEvents: "none" }}>
        <svg viewBox="0 0 1440 88" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 88, overflow: "visible" }}>
          <path d="M0,88 C360,0 1080,0 1440,88 L1440,88 L0,88 Z" fill="#0d0d0f" />
          <path d="M0,88 C360,0 1080,0 1440,88" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="1.5" />
          <path d="M0,88 C360,0 1080,0 1440,88" fill="none" stroke="rgba(99,102,241,0.85)" strokeWidth="2.5" strokeLinecap="round" pathLength="1" strokeDasharray="0.12 0.88" style={{ animation: "beammove 6s linear infinite" }} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: "47%", top: "10%", height: "80%", width: 1, background: `linear-gradient(to bottom, transparent, rgba(79,70,229,.15) 30%, rgba(79,70,229,.15) 70%, transparent)`, zIndex: 4, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 10, width: isTablet ? "54%" : "50%", paddingLeft: `clamp(24px,${isTablet ? 4 : 6}vw,88px)`, paddingRight: 32, display: "flex", flexDirection: "column", gap: isTablet ? 18 : 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 13px", borderRadius: 999, border: `1px solid ${T.border2}`, background: "rgba(255,255,255,.8)", backdropFilter: "blur(12px)", width: "fit-content", fontSize: 12, color: T.text2, animation: "fadeup .6s ease .05s both", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
          <span style={{ position: "relative", width: 7, height: 7, display: "inline-block" }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#16a34a", animation: "pulsering 1.5s ease-out infinite" }} />
          </span>
          Open for Work
        </div>
        <div style={{ animation: "fadeup .7s ease .1s both" }}>
          <h1 style={{ fontSize: `clamp(${isTablet ? 26 : 38}px,${isTablet ? 3.8 : 5.8}vw,${isTablet ? 48 : 70}px)`, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.06, color: T.text }}>
            Muhammad Izzat<br /><span className="gtext">Imran</span>
          </h1>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: `clamp(12px,1.4vw,16px)`, color: T.text2, animation: "fadeup .7s ease .2s both" }}>
          <TypingAnim words={roles} />
        </div>
        <p style={{ fontSize: "clamp(12px,1.2vw,14.5px)", color: T.text3, lineHeight: 1.85, maxWidth: 400, animation: "fadeup .7s ease .3s both" }}>
          At <span style={{ color: T.indigo, fontWeight: 500 }}>Unit PADU, Kementerian Ekonomi</span>, I build gov-tech portals with Next.js, React &amp; Tailwind CSS. CS grad from <span style={{ color: T.indigo, fontWeight: 500 }}>UiTM</span> in Netcentric Computing.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", animation: "fadeup .7s ease .4s both" }}>
          <SBtn onClick={() => window.location.href = "/projects/padu"}><Layers size={14} />View Projects<ArrowRight size={14} /></SBtn>
          <SBtn outline onClick={() => window.location.href = "mailto:izzatzamri01@gmail.com"}><Mail size={14} />Get In Touch</SBtn>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", animation: "fadeup .7s ease .5s both" }}>
          {(isTablet ? ["Next.js", "React", "TypeScript", "Tailwind"] : ["Next.js", "React", "TypeScript", "Tailwind", "Laravel", "Strapi", "Vertex AI", "MySQL"]).map(t => (
            <span key={t} style={{ padding: "3px 10px", borderRadius: 999, border: `1px solid ${T.border2}`, background: "rgba(255,255,255,.85)", backdropFilter: "blur(6px)", color: T.text2, fontSize: 11.5 }}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const bp       = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const stack: MarqueeItem[] = [
    { i: "", n: "Next.js",    img: "https://cdn.simpleicons.org/nextdotjs/ffffff" },
    { i: "", n: "React",      img: "https://cdn.simpleicons.org/react" },
    { i: "", n: "TypeScript", img: "https://cdn.simpleicons.org/typescript" },
    { i: "", n: "Tailwind",   img: "https://cdn.simpleicons.org/tailwindcss" },
    { i: "", n: "Laravel",    img: "https://cdn.simpleicons.org/laravel" },
    { i: "", n: "MySQL",      img: "https://cdn.simpleicons.org/mysql" },
  ];

  const gridCols = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)";
  const bioSpan  = isMobile ? "span 1" : "span 2";

  return (
    <section id="about" style={{ position: "relative", background: "#0d0d0f", padding: `${isMobile ? 40 : 48}px 24px 96px`, overflow: "hidden" }}>
      <FloatingCodeBg />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(13,13,15,0.75) 100%)" }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 999, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", color: "#818cf8", fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase" as const, marginBottom: 12, fontWeight: 600 }}>About</div>
          <h2 style={{ fontSize: `clamp(${isMobile ? 22 : 26}px,4.5vw,38px)`, fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>Crafting <span className="gtext">Digital Experiences</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 10 }}>
          <div style={{ gridColumn: bioSpan, padding: isMobile ? 22 : 30, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
              <div style={{ borderRadius: 14, background: "rgba(99,102,241,0.15)", border: "1.5px solid rgba(99,102,241,0.3)", padding: 11, flexShrink: 0 }}><User size={21} color="#818cf8" /></div>
              <div>
                <div style={{ fontWeight: 600, color: "#ffffff", fontSize: isMobile ? 13 : 15 }}>Web &amp; Frontend Developer</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Unit PADU, Kementerian Ekonomi · Putrajaya</div>
              </div>
            </div>
            <p style={{ fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.82, marginBottom: 14 }}>
              I&apos;m Muhammad Izzat Imran — CS graduate from <strong style={{ color: "#818cf8" }}>Universiti Teknologi MARA (UiTM)</strong> specialising in Netcentric Computing. I design &amp; build frontend interfaces for government portals including Portal Analitik, Portal PADU, and Portal Panduan Pengguna.
            </p>
            <p style={{ fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.82 }}>
              I also develop AI-powered chatbots using <strong style={{ color: "#818cf8" }}>Vertex AI Conversational Agents</strong>, integrate headless CMS with Strapi, and implement secure authentication via Google OAuth 2.0.
            </p>
          </div>
          {!isMobile && (
            <div style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 2 }}>Tech Stack</div>
              <OrbitRing icons={stack} r={isTablet ? 52 : 60} dur={26} dark={true} />
            </div>
          )}
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

/* ─────────────────────────────────────────────────────────────────────────
   FIX: TechIconCard extracted as proper component (no hook inside .map())
───────────────────────────────────────────────────────────────────────── */
function TechIconCard({ t }: { t: { n: string; img: string } }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="techpill" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "14px 6px 12px", borderRadius: 14, border: `1px solid ${T.border2}`, background: T.card, boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
      {!failed ? (
        <img src={t.img} alt={t.n} width={24} height={24} style={{ objectFit: "contain" }}
          onError={() => setFailed(true)} />
      ) : (
        <span style={{ fontSize: 10, fontWeight: 700, color: T.indigo }}>{t.n.slice(0, 2).toUpperCase()}</span>
      )}
      <span style={{ fontSize: 9.5, color: T.text2, textAlign: "center", lineHeight: 1.3, fontWeight: 500 }}>{t.n}</span>
    </div>
  );
}

function Skills() {
  const bp       = useBreakpoint();
  const isMobile = bp === "mobile";

  /* ── Semua hooks mesti di sini, sebelum sebarang early return ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const cRef = useRef<HTMLDivElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null), l2Ref = useRef<HTMLDivElement>(null), l3Ref = useRef<HTMLDivElement>(null), l4Ref = useRef<HTMLDivElement>(null);
  const l5Ref = useRef<HTMLDivElement>(null), l6Ref = useRef<HTMLDivElement>(null), l7Ref = useRef<HTMLDivElement>(null), l8Ref = useRef<HTMLDivElement>(null);
  const r1Ref = useRef<HTMLDivElement>(null), r2Ref = useRef<HTMLDivElement>(null), r3Ref = useRef<HTMLDivElement>(null), r4Ref = useRef<HTMLDivElement>(null);
  const r5Ref = useRef<HTMLDivElement>(null), r6Ref = useRef<HTMLDivElement>(null), r7Ref = useRef<HTMLDivElement>(null), r8Ref = useRef<HTMLDivElement>(null);
  const [beams, setBeams] = useState<{ d: string; delay: number }[]>([]);

  useEffect(() => {
    if (isMobile) return; // skip beam building on mobile
    const build = () => {
      if (!containerRef.current || !cRef.current) return;
      const box = containerRef.current.getBoundingClientRect();
      const mid = (r: React.RefObject<HTMLDivElement | null>) => {
        if (!r.current) return null;
        const b = r.current.getBoundingClientRect();
        return { x: b.left - box.left + b.width / 2, y: b.top - box.top + b.height / 2 };
      };
      const c = mid(cRef); if (!c) return;
      const lRefs = [l1Ref, l2Ref, l3Ref, l4Ref, l5Ref, l6Ref, l7Ref, l8Ref];
      const rRefs = [r1Ref, r2Ref, r3Ref, r4Ref, r5Ref, r6Ref, r7Ref, r8Ref];
      const result: { d: string; delay: number }[] = [];
      lRefs.forEach((ref, i) => { const p = mid(ref); if (!p) return; const cx = (p.x + c.x) / 2; result.push({ d: `M${p.x},${p.y} C${cx},${p.y} ${cx},${c.y} ${c.x},${c.y}`, delay: -(i * 0.38) }); });
      rRefs.forEach((ref, i) => { const p = mid(ref); if (!p) return; const cx = (c.x + p.x) / 2; result.push({ d: `M${p.x},${p.y} C${cx},${p.y} ${cx},${c.y} ${c.x},${c.y}`, delay: -(i * 0.38 + 0.19) }); });
      setBeams(result);
    };
    const id = requestAnimationFrame(build);
    window.addEventListener("resize", build);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", build); };
  }, [isMobile]);

  const ALL_TECH = [
    { n: "Next.js 15",   img: "https://cdn.simpleicons.org/nextdotjs/111111" },
    { n: "React",        img: "https://cdn.simpleicons.org/react" },
    { n: "TypeScript",   img: "https://cdn.simpleicons.org/typescript" },
    { n: "Tailwind CSS", img: "https://cdn.simpleicons.org/tailwindcss" },
    { n: "JavaScript",   img: "https://cdn.simpleicons.org/javascript" },
    { n: "Laravel",      img: "https://cdn.simpleicons.org/laravel" },
    { n: "PHP",          img: "https://cdn.simpleicons.org/php" },
    { n: "MySQL",        img: "https://cdn.simpleicons.org/mysql" },
    { n: "Strapi",       img: "https://cdn.simpleicons.org/strapi" },
    { n: "Vertex AI",    img: "https://cdn.simpleicons.org/googlecloud" },
    { n: "Google OAuth", img: "https://cdn.simpleicons.org/google" },
    { n: "Git",          img: "https://cdn.simpleicons.org/git" },
    { n: "Figma",        img: "https://cdn.simpleicons.org/figma" },
    { n: "HeroUI",       img: "https://cdn.simpleicons.org/heroui/111111" },
    { n: "LottieFiles",  img: "https://cdn.simpleicons.org/lottiefiles" },
    { n: "ASP.NET",      img: "https://cdn.simpleicons.org/dotnet" },
  ];

  /* ── MOBILE: icon grid ── */
  if (isMobile) {
    return (
      <section id="skills" style={{ background: T.bg2, padding: "72px 24px 80px", overflow: "hidden" }}>
        <div style={{ maxWidth: 480, marginLeft: "auto", marginRight: "auto", textAlign: "center", marginBottom: 36 }}>
          <SBadge>Technologies</SBadge>
          <h2 style={{ fontSize: "clamp(22px,6vw,30px)", fontWeight: 700, color: T.text }}>My <span className="gtext">Tech Stack</span></h2>
          <p style={{ fontSize: 13, color: T.text3, marginTop: 10 }}>Tools &amp; technologies I use to build digital products</p>
        </div>
        <div style={{ maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {ALL_TECH.map(t => (
              <TechIconCard key={t.n} t={t} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── DESKTOP + TABLET: beam diagram ── */
  const LTECH = [
    { n: "Next.js 15",  img: "https://cdn.simpleicons.org/nextdotjs/111111", ref: l1Ref },
    { n: "TypeScript",  img: "https://cdn.simpleicons.org/typescript",        ref: l2Ref },
    { n: "Laravel",     img: "https://cdn.simpleicons.org/laravel",           ref: l3Ref },
    { n: "PHP",         img: "https://cdn.simpleicons.org/php",               ref: l4Ref },
    { n: "Git",         img: "https://cdn.simpleicons.org/git",               ref: l5Ref },
    { n: "JavaScript",  img: "https://cdn.simpleicons.org/javascript",        ref: l6Ref },
    { n: "HeroUI",      img: "https://cdn.simpleicons.org/heroui/111111",     ref: l7Ref },
    { n: "Figma",       img: "https://cdn.simpleicons.org/figma",             ref: l8Ref },
  ];
  const RTECH = [
    { n: "React",        img: "https://cdn.simpleicons.org/react",            ref: r1Ref },
    { n: "Tailwind CSS", img: "https://cdn.simpleicons.org/tailwindcss",      ref: r2Ref },
    { n: "Strapi",       img: "https://cdn.simpleicons.org/strapi",           ref: r3Ref },
    { n: "Vertex AI",    img: "https://cdn.simpleicons.org/googlecloud",      ref: r4Ref },
    { n: "MySQL",        img: "https://cdn.simpleicons.org/mysql",            ref: r5Ref },
    { n: "Google OAuth", img: "https://cdn.simpleicons.org/google",           ref: r6Ref },
    { n: "LottieFiles",  img: "https://cdn.simpleicons.org/lottiefiles",      ref: r7Ref },
    { n: "ASP.NET",      img: "https://cdn.simpleicons.org/dotnet",           ref: r8Ref },
  ];
  const circleStyle: React.CSSProperties = { width: 46, height: 46, borderRadius: "50%", background: T.card, border: `1px solid ${T.border2}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,.07)", flexShrink: 0, position: "relative", overflow: "hidden" };
  const TechIcon = ({ img, name }: { img: string; name: string }) => {
    const [failed, setFailed] = useState(false);
    const initials = name.slice(0, 2).toUpperCase();
    return failed ? <span style={{ fontSize: 11, fontWeight: 700, color: T.indigo, letterSpacing: "-0.03em" }}>{initials}</span>
      : <img src={img} alt={name} width={22} height={22} style={{ objectFit: "contain" }} onError={() => setFailed(true)} />;
  };

  return (
    <section id="skills" style={{ background: T.bg2, padding: "96px 0 96px", overflow: "hidden" }}>
      <div style={{ maxWidth: 900, marginLeft: "auto", marginRight: "auto", paddingLeft: 24, paddingRight: 24, textAlign: "center", marginBottom: 52 }}>
        <SBadge>Technologies</SBadge>
        <h2 style={{ fontSize: "clamp(26px,4.5vw,38px)", fontWeight: 700, color: T.text }}>My <span className="gtext">Tech Stack</span></h2>
        <p style={{ fontSize: 14, color: T.text3, marginTop: 12, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>Tools &amp; technologies I use to build impactful digital products</p>
      </div>
      <div style={{ maxWidth: 900, marginLeft: "auto", marginRight: "auto", padding: "0 48px" }}>
        <div ref={containerRef} style={{ position: "relative", height: 500 }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", zIndex: 0 }}>
            {beams.map((b, i) => {
              const dur  = (0.8 + (i * 0.37) % 1.4).toFixed(2);
              const dash = (0.06 + (i * 0.07) % 0.14).toFixed(2);
              const gap  = (1 - parseFloat(dash)).toFixed(2);
              return (
                <g key={i}>
                  <path d={b.d} fill="none" stroke="rgba(79,70,229,0.28)" strokeWidth={1} />
                  <path d={b.d} fill="none" stroke={T.indigo2} strokeWidth={3} strokeOpacity={0.50} strokeLinecap="round" pathLength="1" strokeDasharray={`${dash} ${gap}`} style={{ animation: `beammove ${dur}s linear ${b.delay}s infinite` }} />
                  <path d={b.d} fill="none" stroke={T.indigo} strokeWidth={1.5} strokeLinecap="round" pathLength="1" strokeDasharray={`${dash} ${gap}`} style={{ animation: `beammove ${dur}s linear ${b.delay}s infinite` }} />
                </g>
              );
            })}
          </svg>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-around", zIndex: 1 }}>
            {LTECH.map(t => (
              <div key={t.n} style={{ display: "flex", alignItems: "center", position: "relative" }}>
                <div ref={t.ref} style={circleStyle}><TechIcon img={t.img} name={t.n} /></div>
                <span style={{ fontSize: 12.5, color: T.text2, fontWeight: 500, whiteSpace: "nowrap", position: "absolute", right: "calc(100% + 10px)" }}>{t.n}</span>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%) translateY(-11px)", zIndex: 2 }}>
            <div ref={cRef} style={{ width: 56, height: 56, borderRadius: "50%", background: T.card, border: `1px solid ${T.border2}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={24} color={T.indigo} />
            </div>
          </div>
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-around", zIndex: 1 }}>
            {RTECH.map(t => (
              <div key={t.n} style={{ display: "flex", alignItems: "center", flexDirection: "row-reverse", position: "relative" }}>
                <div ref={t.ref} style={circleStyle}><TechIcon img={t.img} name={t.n} /></div>
                <span style={{ fontSize: 12.5, color: T.text2, fontWeight: 500, whiteSpace: "nowrap", position: "absolute", left: "calc(100% + 10px)" }}>{t.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Experience() {
  const bp       = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

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

  const lottieWorkingRef = useRef<HTMLDivElement>(null);
  const lottieCatRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".exp-card");
    const observers: IntersectionObserver[] = [];
    cards.forEach((card) => {
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          import("animejs").then(({ animate }) => { animate(card, { translateX: [-60, 0], opacity: [0, 1], duration: 700, easing: "easeOutExpo" }); });
          io.disconnect();
        }
      }, { threshold: 0.25 });
      io.observe(card);
      observers.push(io);
    });

    const workingEl = lottieWorkingRef.current;
    if (workingEl && !isMobile) {
      workingEl.style.opacity = "0";
      workingEl.style.transform = "translateX(80px)";
      const ioW = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          import("animejs").then(({ animate }) => { animate(workingEl, { translateX: [80, 0], opacity: [0, 1], duration: 900, delay: 200, easing: "easeOutExpo" }); });
          ioW.disconnect();
        }
      }, { threshold: 0.15 });
      ioW.observe(workingEl);
      observers.push(ioW);
    }

    const catEl = lottieCatRef.current;
    if (catEl && !isMobile) {
      catEl.style.opacity = "0";
      catEl.style.transform = "scaleX(-1) translateX(80px)";
      const ioC = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          import("animejs").then(({ animate }) => { animate(catEl, { translateX: [80, 0], opacity: [0, 1], duration: 900, delay: 400, easing: "easeOutExpo" }); });
          ioC.disconnect();
        }
      }, { threshold: 0.1 });
      ioC.observe(catEl);
      observers.push(ioC);
    }
    return () => observers.forEach(io => io.disconnect());
  }, [isMobile]);

  const lottieW = isTablet ? 240 : 330;
  const lottieR = isTablet ? 60 : 135;
  const catW    = isTablet ? 180 : 250;
  const catL    = isTablet ? 60  : 185;

  return (
    <section id="exp" style={{ background: T.bg, padding: `${isMobile ? 64 : 96}px 0` }}>
      <div style={{ maxWidth: 900, marginLeft: "auto", marginRight: "auto", paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 52 }}>
          <SBadge>Experience</SBadge>
          <h2 style={{ fontSize: `clamp(${isMobile ? 22 : 26}px,4.5vw,38px)`, fontWeight: 700, color: T.text }}>
            Work <span className="gtext">Experience</span>
          </h2>
        </div>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, paddingLeft: isMobile ? 16 : 24, paddingRight: isMobile ? 16 : 24 }}>
        {!isMobile && (
          <div ref={lottieWorkingRef} style={{ position: "absolute", top: 55, right: lottieR, width: lottieW, height: lottieW, zIndex: 10, pointerEvents: "none" }}>
            <DotLottieReact src="/animation/working.json" autoplay loop style={{ width: "100%", height: "100%" }} />
          </div>
        )}
        {!isMobile && (
          <div ref={lottieCatRef} style={{ position: "absolute", bottom: -80, left: catL, width: catW, height: catW, zIndex: 0, pointerEvents: "none", transform: "scaleX(-1)" }}>
            <DotLottieReact src="/animation/Cat playing animation.json" autoplay loop style={{ width: "100%", height: "100%" }} />
          </div>
        )}
        {jobs.map((j, i) => (
          <MCard
            key={i}
            className="exp-card"
            style={{
              padding: isMobile ? 20 : 26,
              width: isMobile ? "100%" : isTablet ? "90%" : "72%",
              alignSelf: isMobile ? "flex-start" : (["flex-start", "center", "flex-end"] as const)[i],
              position: "relative",
              zIndex: 1,
            }}
            glow={`rgba(${j.accentRaw},.05)`}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ borderRadius: 12, background: `rgba(${j.accentRaw},.1)`, border: `1.5px solid rgba(${j.accentRaw},.2)`, padding: 10, flexShrink: 0 }}>
                  <Briefcase size={18} color={j.accent} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: T.text, fontSize: isMobile ? 13.5 : 15 }}>{j.role}</span>
                    {j.current && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `rgba(${j.accentRaw},.1)`, border: `1px solid rgba(${j.accentRaw},.25)`, color: j.accent, fontWeight: 600 }}>Current</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: j.accent, fontWeight: 500, marginTop: 2 }}>{j.company}</div>
                  <div style={{ fontSize: 12, color: T.text3, marginTop: 1 }}>{j.loc} · {j.period}</div>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: 6 }}>
              {j.points.map((p, pi) => (
                <div key={pi} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: j.accent, flexShrink: 0, marginTop: 6 }} />
                  <span style={{ fontSize: isMobile ? 12.5 : 13, color: T.text2, lineHeight: 1.65 }}>{p}</span>
                </div>
              ))}
            </div>
          </MCard>
        ))}
      </div>
    </section>
  );
}

const PROJECTS_DATA = [
  {
    title: "Portal PADU", org: "Kementerian Ekonomi Malaysia", period: "2025 – Present", role: "Lead Frontend Dev",
    desc: "Lead frontend development for Malaysia's national socioeconomic portal. Built 20+ animated pages including infographic dashboards, 3D carousel timelines, AI-powered chatbot via Vertex AI, and full Strapi CMS integration with Google OAuth 2.0.",
    highlights: ["20+ animated pages", "Vertex AI chatbot", "3D carousel timeline", "Strapi CMS"],
    tags: ["Next.js 15", "Tailwind CSS", "Strapi", "Vertex AI", "HeroUI"],
    icon: "🇲🇾", accent: T.indigo, accentRaw: "79,70,229", stat: "100k+", statLabel: "Daily Users", status: "Live", statusColor: "#16a34a", href: "/projects/padu",
  },
  {
    title: "Portal Analitik", org: "Kementerian Ekonomi", period: "2025", role: "Frontend Developer",
    desc: "Analytics portal for government data insights. Developed interactive chart dashboards, advanced data filtering system, and real-time KPI monitoring panels for policy analysts with REST API integration.",
    highlights: ["Interactive charts", "KPI dashboards", "Advanced filtering", "REST API"],
    tags: ["Next.js", "React", "Tailwind CSS", "REST API"],
    icon: "📊", accent: T.violet, accentRaw: "124,58,237", stat: "Gov", statLabel: "Analytics", status: "Live", statusColor: "#16a34a", href: "/projects/analitik",
  },
  {
    title: "Portal Panduan Pengguna", org: "Kementerian Ekonomi", period: "2025", role: "Frontend Developer",
    desc: "Government staff portal with dynamic content management via Strapi headless CMS. Implemented secure Google OAuth 2.0 authentication and RESTful API integration for structured user guide delivery.",
    highlights: ["Strapi headless CMS", "Google OAuth 2.0", "Dynamic content", "Staff access control"],
    tags: ["Next.js", "Strapi CMS", "Google OAuth", "REST API"],
    icon: "📖", accent: T.cyan, accentRaw: "8,145,178", stat: "OAuth", statLabel: "Secured", status: "Live", statusColor: "#16a34a", href: "/projects/panduan",
  },
  {
    title: "Smart Ticket System", org: "Final Year Project · UiTM", period: "2025", role: "Full-Stack Developer",
    desc: "Full-stack national football ticket booking system with a custom real-time seat allocation algorithm for Bukit Jalil National Stadium. Built with Laravel, deployed on InfinityFree hosting.",
    highlights: ["Real-time seat allocation", "Bukit Jalil map UI", "Full-stack Laravel", "InfinityFree deploy"],
    tags: ["Laravel", "MySQL", "PHP", "InfinityFree"],
    icon: "🏟️", accent: "#d97706", accentRaw: "217,119,6", stat: "FYP", statLabel: "Grade A", status: "Completed", statusColor: "#0891b2", href: "/projects/ticket",
  },
];

function ProjectsCards() {
  const bp       = useBreakpoint();
  const isMobile = bp === "mobile";
  const [expandIdx, setExpandIdx] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          import("animejs").then(({ animate }) => {
            animate(card, { opacity: [0, 1], translateY: [24, 0], duration: 500, delay: i * 80, easing: "easeOutExpo" });
          });
          io.disconnect();
        }
      }, { threshold: 0.2 });
      io.observe(card);
    });
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
      {PROJECTS_DATA.map((p, i) => {
        const isOpen = expandIdx === i;
        return (
          <MCard key={i} glow={`rgba(${p.accentRaw},.05)`} style={{ opacity: 0 }} className="">
            <div ref={el => { cardRefs.current[i] = el; }} style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ height: 3, background: `linear-gradient(90deg, rgba(${p.accentRaw},1), rgba(${p.accentRaw},.3))` }} />
              <div style={{ padding: "18px 18px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{p.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{p.title}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `${p.statusColor}14`, border: `1px solid ${p.statusColor}33`, color: p.statusColor, fontWeight: 600 }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: p.statusColor }} />
                        {p.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: T.text3, marginTop: 2 }}>{p.org} · {p.period}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: p.accent, letterSpacing: "-0.02em" }}>{p.stat}</div>
                    <div style={{ fontSize: 10, color: T.text3 }}>{p.statLabel}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: p.accent, fontWeight: 600, marginBottom: 10, padding: "3px 10px", borderRadius: 999, background: `rgba(${p.accentRaw},.07)`, border: `1px solid rgba(${p.accentRaw},.15)`, width: "fit-content" }}>{p.role}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, border: `1px solid ${T.border2}`, background: T.bg2, color: T.text2 }}>{t}</span>
                  ))}
                </div>
                <button
                  onClick={() => setExpandIdx(isOpen ? null : i)}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.text3, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: isOpen ? 12 : 0 }}
                >
                  <ArrowRight size={12} style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .3s ease", color: p.accent }} />
                  <span style={{ color: isOpen ? p.accent : T.text3 }}>{isOpen ? "Hide details" : "Read more"}</span>
                </button>
                {isOpen && (
                  <div style={{ borderTop: `1px solid rgba(${p.accentRaw},.12)`, paddingTop: 14, animation: "fadeup .3s ease" }}>
                    <p style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.8, marginBottom: 12 }}>{p.desc}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                      {p.highlights.map((hl, hi) => (
                        <div key={hi} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: `rgba(${p.accentRaw},.07)`, border: `1px solid rgba(${p.accentRaw},.18)`, fontSize: 11.5, color: p.accent, fontWeight: 600 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.accent }} />
                          {hl}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => window.location.href = p.href}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 999, background: `linear-gradient(135deg, rgba(${p.accentRaw},1), rgba(${p.accentRaw},.8))`, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5, boxShadow: `0 4px 14px rgba(${p.accentRaw},.25)` }}
                    >
                      View Project <ExternalLink size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </MCard>
        );
      })}
    </div>
  );
}

function ProjectsTable() {
  const rowRefs   = useRef<(HTMLTableRowElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [expandIdx, setExpandIdx] = useState<number | null>(null);
  const [hovIdx,    setHovIdx]    = useState<number | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    rowRefs.current.forEach((row, i) => {
      if (!row) return;
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        import("animejs").then(({ animate }) => { animate(row, { opacity: [0, 1], translateY: [20, 0], duration: 480, delay: i * 90, easing: "easeOutExpo" }); });
        io.disconnect();
      }, { threshold: 0.25 });
      io.observe(row);
      observers.push(io);
    });
    return () => observers.forEach(io => io.disconnect());
  }, []);

  const toggle = useCallback((i: number) => {
    if (expandIdx === i) {
      const panel = panelRefs.current[i];
      if (panel) {
        import("animejs").then(({ animate }) => {
          animate(panel, { opacity: [1, 0], translateY: [0, -8], duration: 240, easing: "easeInQuad", complete: () => setExpandIdx(null) });
        });
      } else { setExpandIdx(null); }
      return;
    }
    setExpandIdx(i);
    setTimeout(() => {
      const panel = panelRefs.current[i];
      if (!panel) return;
      import("animejs").then(({ animate }) => {
        animate(panel, { opacity: [0, 1], translateY: [-12, 0], duration: 380, easing: "easeOutExpo" });
        const pills = panel.querySelectorAll<HTMLElement>(".hl-pill");
        if (pills.length) animate(pills, { opacity: [0, 1], translateX: [-10, 0], duration: 300, delay: (_el: any, idx: number) => idx * 55 + 120, easing: "easeOutExpo" });
        const descEl = panel.querySelector<HTMLElement>(".desc-text");
        if (descEl) animate(descEl, { opacity: [0, 1], translateY: [8, 0], duration: 400, delay: 80, easing: "easeOutExpo" });
      });
    }, 10);
  }, [expandIdx]);

  return (
    <>
      <style>{`
        .o-row { opacity:0; transition:background .18s ease; cursor:pointer; }
        .o-row:hover td { background:#ffffff !important; }
        .o-row.open-row td { background:#ffffff !important; }
        .o-row:hover .o-title { color:#4f46e5 !important; }
        .o-row.open-row .o-title { color:#4f46e5 !important; }
        .o-row:hover .o-chevron { opacity:1 !important; }
        .o-row.open-row .o-chevron { opacity:1 !important; }
        .o-chevron { transition:transform .32s ease,opacity .2s ease; }
        .o-tag { transition:background .15s,color .15s,border-color .15s; }
        .o-tag:hover { background:rgba(79,70,229,.1) !important; color:#4f46e5 !important; border-color:rgba(79,70,229,.3) !important; }
        .hl-pill { opacity:0; transition:background .2s,transform .2s; }
        .hl-pill:hover { transform:translateY(-2px) !important; }
        .desc-text { opacity:0; }
        .proj-cta-o { transition:all .22s ease; }
        .proj-cta-o:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.15) !important; }
      `}</style>
      <div style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${T.border2}`, boxShadow: "0 6px 32px rgba(0,0,0,.07)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <colgroup>
            <col style={{ width: 5 }} /><col style={{ width: 46 }} /><col />
            <col style={{ width: "13%" }} /><col style={{ width: "11%" }} /><col style={{ width: "22%" }} />
            <col style={{ width: "8%" }} /><col style={{ width: "9%" }} /><col style={{ width: 44 }} />
          </colgroup>
          <thead>
            <tr style={{ background: T.bg3 }}>
              <th style={{ padding: 0, borderBottom: `1px solid ${T.border2}` }} />
              <th style={{ padding: "12px 0 12px 14px", borderBottom: `1px solid ${T.border2}`, textAlign: "left", fontSize: 10.5, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>#</th>
              {["Project", "Role", "Period", "Stack", "Metric", "Status", ""].map((h, ci) => (
                <th key={ci} style={{ padding: ci === 7 ? "12px 16px 12px 0" : "12px 14px", borderBottom: `1px solid ${T.border2}`, textAlign: "left", fontSize: 10.5, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROJECTS_DATA.map((p, i) => {
              const isOpen = expandIdx === i;
              const rowBg  = i % 2 === 0 ? T.card : "#fafaf8";
              const bdClr  = i < PROJECTS_DATA.length - 1 && !isOpen ? `1px solid ${T.border}` : "none";
              return (
                <React.Fragment key={i}>
                  <tr ref={el => { rowRefs.current[i] = el; }} className={`o-row ${isOpen ? "open-row" : ""}`}
                    onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)} onClick={() => toggle(i)}>
                    <td style={{ padding: 0, background: isOpen || hovIdx === i ? p.accent : `rgba(${p.accentRaw},.3)`, transition: "background .2s", borderBottom: bdClr }} />
                    <td style={{ padding: "18px 0 18px 14px", background: rowBg, borderBottom: bdClr }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 8, background: `rgba(${p.accentRaw},.08)`, border: `1px solid rgba(${p.accentRaw},.18)` }}>
                        <span style={{ fontFamily: "monospace", fontSize: 10.5, fontWeight: 700, color: p.accent }}>{i + 1}</span>
                      </div>
                    </td>
                    <td style={{ padding: "18px 14px", background: rowBg, borderBottom: bdClr }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{p.icon}</span>
                        <div>
                          <div className="o-title" style={{ fontSize: 13.5, fontWeight: 700, color: T.text, transition: "color .2s", letterSpacing: "-0.01em" }}>{p.title}</div>
                          <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>{p.org}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "18px 14px", background: rowBg, borderBottom: bdClr }}><span style={{ fontSize: 12, color: T.text2, fontWeight: 500 }}>{p.role}</span></td>
                    <td style={{ padding: "18px 14px", background: rowBg, borderBottom: bdClr }}><span style={{ fontSize: 12, color: T.text3 }}>{p.period}</span></td>
                    <td style={{ padding: "18px 14px", background: rowBg, borderBottom: bdClr }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {p.tags.slice(0, 3).map(t => (
                          <span key={t} className="o-tag" style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, border: `1px solid ${T.border2}`, background: T.bg2, color: T.text2, whiteSpace: "nowrap" }}>{t}</span>
                        ))}
                        {p.tags.length > 3 && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, border: `1px solid ${T.border2}`, background: T.bg3, color: T.text3 }}>+{p.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td style={{ padding: "18px 14px", background: rowBg, borderBottom: bdClr }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: p.accent, letterSpacing: "-0.02em", lineHeight: 1 }}>{p.stat}</div>
                      {p.statLabel && <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{p.statLabel}</div>}
                    </td>
                    <td style={{ padding: "18px 14px", background: rowBg, borderBottom: bdClr }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${p.statusColor}14`, border: `1px solid ${p.statusColor}33`, color: p.statusColor, fontWeight: 600, whiteSpace: "nowrap" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.statusColor }} />{p.status}
                      </span>
                    </td>
                    <td style={{ padding: "18px 16px 18px 0", background: rowBg, borderBottom: bdClr, textAlign: "right" }}>
                      <div className="o-chevron" style={{ opacity: isOpen ? 1 : 0, display: "inline-flex", width: 28, height: 28, borderRadius: "50%", border: `1px solid rgba(${p.accentRaw},.25)`, background: isOpen ? `rgba(${p.accentRaw},.12)` : `rgba(${p.accentRaw},.06)`, alignItems: "center", justifyContent: "center" }}>
                        <ArrowRight size={12} color={p.accent} style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .32s ease" }} />
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td style={{ padding: 0, background: p.accent, borderBottom: `1px solid ${T.border}` }} />
                      <td colSpan={8} style={{ padding: "0 20px 24px 14px", background: "#ffffff", borderBottom: `1px solid ${T.border}` }}>
                        <div ref={el => { panelRefs.current[i] = el; }} className="expand-panel" style={{ opacity: 0 }}>
                          <div style={{ height: 2, background: `linear-gradient(90deg, rgba(${p.accentRaw},1) 0%, rgba(${p.accentRaw},.15) 60%, transparent 100%)`, borderRadius: 99, marginBottom: 20, marginTop: 4 }} />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 28, alignItems: "start" }}>
                            <div>
                              <p className="desc-text" style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.85, marginBottom: 18, maxWidth: 560 }}>{p.desc}</p>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {p.highlights.map((hl, hi) => (
                                  <div key={hi} className="hl-pill" style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 999, background: `rgba(${p.accentRaw},.07)`, border: `1px solid rgba(${p.accentRaw},.2)`, fontSize: 12, color: p.accent, fontWeight: 600, cursor: "default" }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.accent }} />{hl}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16, flexShrink: 0 }}>
                              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 200 }}>
                                {p.tags.map(t => (
                                  <span key={t} className="o-tag" style={{ fontSize: 10.5, padding: "3px 10px", borderRadius: 999, border: `1px solid rgba(${p.accentRaw},.2)`, background: `rgba(${p.accentRaw},.06)`, color: p.accent, fontWeight: 500 }}>{t}</span>
                                ))}
                              </div>
                              <button className="proj-cta-o" onClick={e => { e.stopPropagation(); window.location.href = p.href; }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 999, background: `linear-gradient(135deg, rgba(${p.accentRaw},1), rgba(${p.accentRaw},.75))`, color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: `0 4px 16px rgba(${p.accentRaw},.28)`, whiteSpace: "nowrap" }}>
                                View Project <ExternalLink size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: "11px 18px", background: T.bg3, borderTop: `1px solid ${T.border2}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: T.text3 }}>4 projects · 2025</span>
          <div style={{ display: "flex", gap: 5 }}>
            {PROJECTS_DATA.map((p, i) => (
              <div key={i} onClick={() => toggle(i)} style={{ width: expandIdx === i ? 22 : 8, height: 8, borderRadius: 99, background: expandIdx === i ? p.accent : `rgba(${p.accentRaw},.3)`, cursor: "pointer", transition: "all .3s ease" }} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Projects() {
  const bp       = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  return (
    <section id="proj" style={{ background: T.bg2, padding: `${isMobile ? 64 : 96}px ${isMobile ? 16 : 24}px` }}>
      <div style={{ maxWidth: isMobile || isTablet ? 760 : 1040, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "flex-end", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", marginBottom: isMobile ? 24 : 32, gap: 14 }}>
          <div>
            <SBadge><Layers size={11} />Work</SBadge>
            <h2 style={{ fontSize: `clamp(${isMobile ? 22 : 26}px,4.5vw,42px)`, fontWeight: 800, color: T.text, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Featured <span className="gtext">Projects</span>
            </h2>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <p style={{ fontSize: 12.5, color: T.text3 }}>
                {isTablet ? "Tap to expand ↓" : "Click any row to read more ↓"}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ color: T.indigo, label: "Gov Portal" }, { color: "#d97706", label: "Academic" }].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: T.text3 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 3, background: l.color }} />{l.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {isMobile || isTablet ? <ProjectsCards /> : <ProjectsTable />}
      </div>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const bp       = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const email = "izzatzamri01@gmail.com";
  const copy = () => { navigator.clipboard?.writeText(email); setCopied(true); setTimeout(() => setCopied(false), 2500); };

  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return;
    let rendererRef: any = null;
    let dead = false;
    Promise.all([import("three"), import("animejs")]).then(([THREE, { engine, createTimeline, utils }]) => {
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
      renderer.domElement.style.inset = "0";
      container.appendChild(renderer.domElement);
      rendererRef = renderer;
      camera.position.z = 5;
      function spawnCube() {
        const cube = new THREE.Mesh(geometry, material);
        const x = utils.random(-10, 10, 2), y = utils.random(-5, 5, 2), z = [-10, 7] as [number, number];
        const r = () => utils.random(-Math.PI * 2, Math.PI * 2, 3);
        const duration = 4000;
        createTimeline({ delay: utils.random(0, duration), defaults: { loop: true, duration, ease: "inSine" } }).add(cube.position, { x, y, z }, 0).add(cube.rotation, { x: r, y: r, z: r }, 0).init();
        scene.add(cube);
      }
      for (let i = 0; i < 40; i++) spawnCube();
      renderer.setAnimationLoop(() => { engine.update(); renderer.render(scene, camera); });
    });
    return () => {
      dead = true;
      if (rendererRef) { rendererRef.setAnimationLoop(null); rendererRef.dispose(); if (rendererRef.domElement?.parentNode === container) container.removeChild(rendererRef.domElement); }
    };
  }, []);

  const linksGrid = isMobile ? "1fr" : "repeat(3,1fr)";

  return (
    <section id="contact" style={{ position: "relative", background: "#0d0d0f", padding: `${isMobile ? 72 : 96}px ${isMobile ? 20 : 24}px ${isMobile ? 130 : 160}px`, overflow: "hidden" }}>
      <div ref={canvasWrapRef} style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.65, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(13,13,15,0.75) 100%)" }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 800, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 999, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", color: "#818cf8", fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase" as const, marginBottom: 12, fontWeight: 600 }}>Contact</div>
          <h2 style={{ fontSize: `clamp(${isMobile ? 22 : 26}px,4.5vw,38px)`, fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>Let&apos;s <span className="gtext">Connect</span></h2>
          <p style={{ fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.45)", marginTop: 12 }}>Interested in working together? Let&apos;s build something impactful.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ borderRadius: 15, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", padding: isMobile ? "20px 20px" : "26px 30px", display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <div style={{ borderRadius: 14, background: "rgba(99,102,241,0.15)", border: "1.5px solid rgba(99,102,241,0.3)", padding: 13, flexShrink: 0 }}><Mail size={isMobile ? 20 : 24} color="#818cf8" /></div>
              <div>
                <div style={{ fontWeight: 600, color: "#ffffff", fontSize: isMobile ? 14 : 15, marginBottom: 3 }}>Drop me an email</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>+6012-296 7752 · Kajang, Selangor</div>
                <code style={{ fontSize: isMobile ? 11.5 : 13, color: "#818cf8", marginTop: 6, display: "block" }}>{email}</code>
              </div>
            </div>
            <SBtn onClick={copy} style={isMobile ? { width: "100%" } : {}}>
              {copied ? <>✓ Copied!</> : <><Send size={13} />Copy Email</>}
            </SBtn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: linksGrid, gap: 10 }}>
            {[
              { Icon: Github,   lbl: "GitHub",     hdl: "github.com/izzatimran" },
              { Icon: Linkedin, lbl: "LinkedIn",   hdl: "Izzat Imran" },
              { Icon: Globe2,   lbl: "University", hdl: "UiTM · CS Graduate 2025" },
            ].map(({ Icon, lbl, hdl }) => (
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
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState("hero");

  const goto = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActive(id);
  }, []);

  useEffect(() => {
    const fn = () => {
      for (const id of ["hero", "about", "skills", "exp", "proj", "contact"]) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= 180 && r.bottom >= 180) { setActive(id); break; }
        }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
      <div style={{ fontFamily: "'Inter',system-ui,-apple-system,sans-serif", background: "#f8f7f4", minHeight: "100vh", opacity: loaded ? 1 : 0, transition: "opacity .5s ease" }}>
        <style>{TECH_CSS}</style>
        <style>{RESPONSIVE_CSS}</style>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
        <Dock active={active} goto={goto} />
      </div>
    </>
  );
}