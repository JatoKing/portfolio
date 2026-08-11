"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Calendar, MapPin, Users, Code2, Trophy, Star, Zap,
  AlertTriangle, Target, Compass, Radio, Satellite, Quote, X, ZoomIn, CheckCircle2,
} from "lucide-react";

/* ─── Colour Tokens ──────────────────────────────────────────────── */
const C = {
  bg:      "#f8f7f4",
  bg2:     "#f0ede8",
  bg3:     "#e8e4de",
  card:    "#ffffff",
  border:  "rgba(0,0,0,0.08)",
  border2: "rgba(0,0,0,0.12)",
  green:   "#16a34a",
  green2:  "#4ade80",
  green3:  "#15803d",
  teal:    "#0d9488",
  text:    "#0f1b2e",
  muted:   "rgba(17,17,17,0.6)",
  muted2:  "rgba(17,17,17,0.4)",
};

const OGB_H = 36; // ongoing-project banner height (px)

function useBreakpoint() {
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">("desktop");
  useEffect(() => {
    const check = () => { const w = window.innerWidth; setBp(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop"); };
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

/* ─── Topography Line Background ────────────────────────────────── */
function ContourLines({ opacity = 0.08 }: { opacity?: number }) {
  return (
    <svg
      viewBox="0 0 900 560"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, pointerEvents: "none" }}
      preserveAspectRatio="xMidYMid slice"
    >
      {[0, 1, 2, 3, 4, 5].map(i => (
        <path
          key={i}
          d={`M -50,${100 + i * 80} C 150,${40 + i * 80} 300,${160 + i * 80} 450,${90 + i * 80} S 750,${30 + i * 80} 950,${110 + i * 80}`}
          fill="none" stroke={C.green2} strokeWidth="1.2"
        />
      ))}
      <circle cx="620" cy="220" r="6" fill={C.green2} />
      <circle cx="620" cy="220" r="16" fill="none" stroke={C.green2} strokeWidth="1" />
      <circle cx="620" cy="220" r="28" fill="none" stroke={C.green2} strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

/* ─── Info Ticker ─────────────────────────────────────────────────── */
function InfoTicker() {
  const items = [
    "🧭  Predictive Dead-Zone Warnings",
    "📲  Offline Trail Packs",
    "📍  Background GPS Recording",
    "🔁  Retry-Safe Sync",
    "🧪  86 Automated Tests",
    "🏆  ASEAN GeoAI Fusion 2026",
  ];
  const doubled = [...items, ...items];
  return (
    <div style={{
      overflow: "hidden",
      borderTop: `1px solid rgba(22,163,74,0.3)`,
      borderBottom: `1px solid rgba(22,163,74,0.3)`,
      background: "rgba(22,163,74,0.06)", padding: "10px 0",
    }}>
      <div style={{
        display: "flex", gap: 56, width: "max-content",
        animation: "tickerMove 28s linear infinite",
        fontFamily: "'JetBrains Mono','Fira Code',monospace",
        fontSize: 12, color: C.green3, fontWeight: 600, letterSpacing: "0.04em",
      }}>
        {doubled.map((item, i) => <span key={i} style={{ whiteSpace: "nowrap" }}>{item}</span>)}
      </div>
    </div>
  );
}

/* ─── Stat Badge ──────────────────────────────────────────────────── */
function StatBadge({ val, label }: { val: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 88, height: 72, borderRadius: 14,
        background: `linear-gradient(135deg, rgba(22,163,74,0.25), rgba(22,163,74,0.08))`,
        border: `1.5px solid rgba(22,163,74,0.35)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 24px rgba(22,163,74,0.12)", padding: "0 8px",
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: val.length > 5 ? 14 : val.length > 3 ? 17 : 22,
          fontWeight: 900, color: C.green3, letterSpacing: "-0.03em",
          textAlign: "center", lineHeight: 1,
        }}>{val}</span>
      </div>
      <span style={{
        fontSize: 10, color: C.muted2, fontWeight: 600,
        letterSpacing: "0.08em", textTransform: "uppercase",
        textAlign: "center", maxWidth: 88,
      }}>{label}</span>
    </div>
  );
}

/* ─── Tech Tag ───────────────────────────────────────────────────── */
function TechTag({ label, icon }: { label: string; icon?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 12px", borderRadius: 999,
      border: `1px solid rgba(22,163,74,0.25)`,
      background: "rgba(22,163,74,0.08)",
      color: C.green3, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.02em",
    }}>
      {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
      {label}
    </span>
  );
}

/* ─── Section Badge ──────────────────────────────────────────────── */
function SectionBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "5px 14px", borderRadius: 999,
      border: "1px solid rgba(22,163,74,0.3)",
      background: "rgba(22,163,74,0.08)",
      color: C.green3, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.09em", textTransform: "uppercase" as const,
      marginBottom: 14,
    }}>
      {icon}{label}
    </div>
  );
}

/* ─── Problem Card ────────────────────────────────────────────────── */
function ProblemCard({ icon, title, desc, delay, visible }: { icon: string; title: string; desc: string; delay: number; visible: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "18px 20px", borderRadius: 14,
        background: hov ? "rgba(239,68,68,0.07)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${hov ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.1)"}`,
        transition: "all 0.25s ease", cursor: "default",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${0.35 + delay}s`,
        transitionProperty: "opacity, transform, background, border-color",
        transitionDuration: "0.55s, 0.55s, 0.25s, 0.25s",
      }}
    >
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.75 }}>{desc}</div>
    </div>
  );
}

/* ─── Objective Card ─────────────────────────────────────────────── */
function ObjectiveCard({ num, icon, title, desc, delay, visible }: { num: string; icon: string; title: string; desc: string; delay: number; visible: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", overflow: "hidden",
        padding: "26px 24px", borderRadius: 18, textAlign: "center",
        background: hov ? "rgba(22,163,74,0.06)" : C.card,
        border: `1px solid ${hov ? "rgba(22,163,74,0.3)" : C.border2}`,
        boxShadow: hov ? "0 16px 40px rgba(22,163,74,0.12)" : "0 4px 16px rgba(0,0,0,0.03)",
        transition: "all 0.25s ease", cursor: "default",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${0.45 + delay}s`,
        transitionProperty: "opacity, transform, background, border-color, box-shadow",
        transitionDuration: "0.55s, 0.55s, 0.25s, 0.25s, 0.25s",
      }}
    >
      <span style={{
        position: "absolute", top: -18, right: -6, zIndex: 0,
        fontFamily: "'JetBrains Mono',monospace", fontSize: 96, fontWeight: 900,
        lineHeight: 1, letterSpacing: "-0.05em", pointerEvents: "none", userSelect: "none",
        color: hov ? "rgba(22,163,74,0.16)" : "rgba(17,17,17,0.05)",
        transition: "color 0.3s ease",
      }}>{num}</span>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%", margin: "0 auto 16px",
          background: hov ? "rgba(22,163,74,0.18)" : "rgba(22,163,74,0.1)",
          border: `1.5px solid ${hov ? "rgba(22,163,74,0.5)" : "rgba(22,163,74,0.22)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, transform: hov ? "scale(1.08)" : "scale(1)",
          transition: "all 0.25s ease",
        }}>{icon}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: "-0.01em", marginBottom: 8 }}>{title}</div>
        <p style={{ fontSize: 12.5, color: C.muted2, lineHeight: 1.75, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── Problem + Objectives Section ───────────────────────────────── */
function ChallengeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.06 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const problems = [
    { icon: "📵", title: "Unpredictable Dead Zones", desc: "Hikers have no way of knowing where mobile coverage will drop along a trail until it's too late — leaving them unable to call for help in an emergency." },
    { icon: "🔎", title: "Wide, Slow SAR Searches", desc: "Without last-known-connectivity data, search and rescue teams must comb through unnecessarily large search areas, costing critical time during a rescue." },
    { icon: "📶", title: "Undirected Infrastructure Planning", desc: "Authorities lack a data-driven way to decide where new LoRa gateways would most improve coverage across remote recreational areas." },
  ];

  const objectives = [
    { num: "01", icon: "🎯", title: "Predict", desc: "Use GeoAI to classify every trail segment — combining terrain, vegetation, and telecommunications data — as likely_covered, uncertain, or predicted_gap." },
    { num: "02", icon: "🥾", title: "Empower", desc: "Give hikers offline connectivity awareness: downloadable routes, offline maps, and warnings before they enter a predicted dead zone." },
    { num: "03", icon: "🚁", title: "Assist", desc: "Record GPS trajectories in the background and sync the last-known location the moment coverage returns, so SAR teams get real connectivity intelligence, not guesswork." },
  ];

  return (
    <section ref={ref} style={{ padding: "96px 24px", background: C.bg, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none" }}><ContourLines /></div>
      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
        <div style={{
          textAlign: "center", marginBottom: 64,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <SectionBadge icon={<Compass size={11} />} label="Hackathon Brief" />
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.text, margin: 0 }}>
            Challenge &amp; Mission
          </h2>
          <p style={{ fontSize: 14, color: C.muted2, marginTop: 10, maxWidth: 520, margin: "10px auto 0" }}>
            The connectivity gap that shaped JEJAK, and the goals we set to close it during ASEAN GeoAI Fusion 2026.
          </p>
        </div>

        <div style={{ marginBottom: 64, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={16} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.muted2, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 2 }}>The Problem</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Communication Dead Zones</div>
            </div>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(239,68,68,0.25), transparent)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 14 }}>
            {problems.map((p, i) => <ProblemCard key={i} icon={p.icon} title={p.title} desc={p.desc} delay={i * 0.08} visible={visible} />)}
          </div>
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.6s ease 0.22s, transform 0.6s ease 0.22s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "rgba(22,163,74,0.12)", border: "1px solid rgba(22,163,74,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Target size={16} color={C.green3} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.muted2, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 2 }}>Our Mission</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Objectives</div>
            </div>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(22,163,74,0.25), transparent)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16 }}>
            {objectives.map((o, i) => <ObjectiveCard key={i} num={o.num} icon={o.icon} title={o.title} desc={o.desc} delay={i * 0.1} visible={visible} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Work Plan Phase Card ───────────────────────────────────────── */
function PhaseCard({ num, title, desc, delay, visible, isLast }: { num: string; title: string; desc: string; delay: number; visible: boolean; isLast: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", display: "flex", gap: 20,
        opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-20px)",
        transitionDelay: `${delay}s`, transitionProperty: "opacity, transform",
        transitionDuration: "0.55s, 0.55s", paddingBottom: isLast ? 0 : 28,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: hov ? "rgba(22,163,74,0.22)" : "rgba(22,163,74,0.1)",
          border: `1.5px solid ${hov ? "rgba(22,163,74,0.55)" : "rgba(22,163,74,0.28)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 900, color: C.green3,
          transition: "all 0.25s ease", flexShrink: 0,
        }}>{num}</div>
        {!isLast && <div style={{ width: 1, flex: 1, background: "linear-gradient(180deg, rgba(22,163,74,0.35), rgba(22,163,74,0.06))", marginTop: 4 }} />}
      </div>
      <div style={{
        flex: 1, padding: "14px 18px", borderRadius: 14, marginBottom: 4,
        background: hov ? "rgba(22,163,74,0.06)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${hov ? "rgba(22,163,74,0.25)" : C.border}`,
        transition: "all 0.25s ease",
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 6 }}>{title}</div>
        <p style={{ fontSize: 12.5, color: C.muted2, lineHeight: 1.75, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── Work Plan Section ──────────────────────────────────────────── */
function WorkPlanSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.06 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const phases = [
    { num: "01", title: "Data Collection & Preparation", desc: "Collect hiking-trail, terrain, vegetation, mobile-coverage, and cellular-infrastructure data. Align and catalogue datasets from OpenStreetMap, Copernicus DEM, ESA WorldCover, FAO mobile coverage, Ookla, and OpenCellID, then preprocess consistent features for model training." },
    { num: "02", title: "GeoAI Model Contract", desc: "Define a discriminated-union prediction contract (route_only / fixture / model_backed) so the app never confuses demo geometry with a real trained-model prediction, ready to plug in a GeoAI model once one exists." },
    { num: "03", title: "Platform Development", desc: "Build the React Native (Expo) app that lets hikers download routes, connectivity predictions, and offline maps before their hike — with gated gap warnings and background GPS trajectory recording when offline." },
    { num: "04", title: "System Integration", desc: "Sync the app to a backend via a switchable HTTP/fixture repository, with persisted retry backoff and real network-state stamping so sync survives spotty connectivity and app restarts." },
    { num: "05", title: "Testing & Validation", desc: "86 automated tests (Jest + React Native Testing Library) gated by CI on every push. Physical-device validation of background GPS and MapLibre rendering is next, pending a development build." },
  ];

  return (
    <section ref={ref} style={{ padding: "96px 24px", background: C.bg2, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none" }}><ContourLines /></div>
      <div style={{ maxWidth: 780, margin: "0 auto", position: "relative" }}>
        <div style={{
          textAlign: "center", marginBottom: 52,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <SectionBadge icon={<Zap size={11} />} label="Work Plan" />
          <h2 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.text }}>
            5-Phase Agenda
          </h2>
        </div>
        <div>
          {phases.map((p, i) => (
            <PhaseCard key={p.num} num={p.num} title={p.title} desc={p.desc} delay={i * 0.08} visible={visible} isLast={i === phases.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Screenshot Modal ────────────────────────────────────────────── */
interface ShotData { src: string; alt: string; caption: string; description: string; num: number; total: number }

function ScreenshotModal({ data, onClose }: { data: ShotData; onClose: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const modalImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose]);

  useEffect(() => { if (modalImgRef.current?.complete) setImgLoaded(true); }, [data.src]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(20,15,8,0.7)", backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 960, background: C.card, borderRadius: 20,
          border: `1px solid rgba(22,163,74,0.25)`,
          boxShadow: "0 40px 120px rgba(0,0,0,0.35), 0 0 0 1px rgba(22,163,74,0.1)",
          overflow: "hidden", animation: "modalSlideUp 0.3s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: C.bg2, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 7 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.85 }} />)}
          </div>
          <span style={{ fontSize: 11, color: C.green3, fontFamily: "monospace", background: "rgba(22,163,74,0.1)", padding: "3px 10px", borderRadius: 5, border: "1px solid rgba(22,163,74,0.2)" }}>
            #{data.num + 1} / {data.total}
          </span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(0,0,0,0.04)", border: `1px solid ${C.border2}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} color={C.muted} />
          </button>
        </div>
        <div style={{ position: "relative", background: C.bg3, maxHeight: "62vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!imgLoaded && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ContourLines opacity={0.15} />
            </div>
          )}
          <img
            ref={modalImgRef} src={data.src} alt={data.alt}
            onLoad={() => setImgLoaded(true)}
            style={{ width: "100%", height: "100%", objectFit: "contain", maxHeight: "62vh", display: "block", opacity: imgLoaded ? 1 : 0, transition: "opacity 0.4s ease" }}
          />
        </div>
        <div style={{ padding: "20px 24px 24px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", marginBottom: 6 }}>{data.caption}</h3>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>{data.description}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Phone Screenshot Card ───────────────────────────────────────── */
function PhoneScreenshotCard({ src, alt, caption, num, onClick }: { src: string; alt: string; caption: string; num: number; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [hov, setHov] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => { if (imgRef.current?.complete) setLoaded(true); }, [src]);

  return (
    <div
      ref={ref} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        cursor: "pointer", textAlign: "center",
        transform: visible ? (hov ? "translateY(-6px)" : "translateY(0)") : "translateY(24px)",
        opacity: visible ? 1 : 0,
        transition: `transform 0.5s cubic-bezier(.22,1,.36,1) ${num * 0.1}s, opacity 0.5s ease ${num * 0.1}s`,
      }}
    >
      <div style={{
        position: "relative", margin: "0 auto", maxWidth: 220,
        borderRadius: 32, padding: 8, background: "#111111",
        border: `1px solid ${hov ? "rgba(22,163,74,0.4)" : "rgba(0,0,0,0.6)"}`,
        boxShadow: hov ? "0 20px 48px rgba(22,163,74,0.18)" : "0 10px 32px rgba(0,0,0,0.18)",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
      }}>
        <div style={{
          position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
          width: 70, height: 18, borderRadius: 10, background: "#111111", zIndex: 2,
        }} />
        <div style={{ position: "relative", aspectRatio: "9/19.5", borderRadius: 24, overflow: "hidden", background: C.bg }}>
          {!loaded && <div style={{ position: "absolute", inset: 0 }}><ContourLines opacity={0.12} /></div>}
          <img
            ref={imgRef} src={src} alt={alt} onLoad={() => setLoaded(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", opacity: loaded ? 1 : 0, transform: hov ? "scale(1.03)" : "scale(1)", transition: "opacity 0.4s ease, transform 0.5s ease" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(20,15,8,0.5) 0%, transparent 55%)",
            opacity: hov ? 1 : 0, transition: "opacity 0.3s ease",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(22,163,74,0.25)", border: "1.5px solid rgba(22,163,74,0.55)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", transform: hov ? "scale(1)" : "scale(0.7)", opacity: hov ? 1 : 0, transition: "all 0.3s cubic-bezier(.22,1,.36,1)" }}>
              <ZoomIn size={16} color="#fff" />
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: C.muted, fontWeight: 500 }}>{caption}</div>
    </div>
  );
}

/* ─── Feature Chip ────────────────────────────────────────────────── */
function FeatureChip({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "18px 20px", borderRadius: 16,
        background: hov ? "rgba(22,163,74,0.08)" : "rgba(0,0,0,0.03)",
        border: `1px solid ${hov ? "rgba(22,163,74,0.3)" : C.border}`,
        transition: "all 0.25s ease", cursor: "default",
      }}
    >
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.7 }}>{desc}</div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */
export default function JejakPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [modal, setModal] = useState<ShotData | null>(null);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const mobileScreenshots = [
    { src: "/jejak/jejak-splash.png", alt: "JEJAK mobile splash screen", caption: "Loading — splash screen", description: "Skrin permulaan app — pin lokasi 3D di atas disc progress bar animasi 0–100%, dengan branding JEJAK & tagline \"GeoAI Connectivity Intelligence\", sebelum masuk ke skrin login." },
    { src: "/jejak/jejak-login.png", alt: "JEJAK mobile login screen", caption: "Login — Ready for the trail?", description: "Skrin login dengan animasi Lottie hiker berjalan di latar belakang, kad glass \"Ready for the trail?\" dengan butang Sign In & Continue as Guest — dilabel jujur \"Demo mode — no account required yet\"." },
    { src: "/jejak/jejak-info-home.png", alt: "JEJAK mobile App Info Home tab", caption: "App Info — Home (objective & agenda)", description: "Skrin \"How It Works\" mod Home — objektif projek, badge Offline-Ready/Real-time Sync/GeoAI Powered, dan agenda kerja (work plan) mengikut fasa." },
    { src: "/jejak/jejak-info-map.png", alt: "JEJAK mobile App Info Map tab", caption: "App Info — Map (feature carousel)", description: "Skrin \"How It Works\" mod Map — carousel swipe 5 ciri utama app (Pre-Hike download, Live Hike System, dsb), setiap kad ada nombor & deskripsi \"Now Viewing\"." },
    { src: "/jejak/jejak-tab-home.png", alt: "JEJAK mobile Home tab", caption: "Home — readiness dashboard", description: "Tab Home memaparkan \"hiker's log\" sebenar — trails ready, packs offline, active hike, status connectivity & last synced — semuanya baca terus dari sistem sebenar (bukan placeholder statik)." },
    { src: "/jejak/jejak-tab-trails.png", alt: "JEJAK mobile Trails tab", caption: "Trails — senarai laluan", description: "Tab Trails papar senarai laluan pendakian ikut negeri (Perak, Selangor, Johor) lengkap dengan jarak & tahap kesukaran, dilabel jujur \"Fixture data only — planning predictions, not confirmed coverage\"." },
    { src: "/jejak/jejak-tab-active-hike.png", alt: "JEJAK mobile Active Hike tab", caption: "Active Hike — sedia untuk mula", description: "Selepas offline pack dimuat turun, tab Active Hike sedia dengan butang \"Start hike\" untuk mula rakam GPS di latar belakang sepanjang pendakian." },
    { src: "/jejak/jejak-tab-downloads.png", alt: "JEJAK mobile Downloads tab", caption: "Downloads — pek offline", description: "Tab Downloads senarai semua trail pack yang disimpan di peranti, dengan status model version & bila ia dimuat turun, boleh dipadam terus dari sini." },
  ];

  const features = [
    { icon: "🗺️", title: "Predictive Dead-Zone Warnings", desc: "Warnings only fire when a trail pack is approved_for_mobile_warning AND the segment is warning_eligible — a double-gate so unapproved model output never reaches a hiker." },
    { icon: "📲", title: "Offline Trail Packs", desc: "Download routes, connectivity predictions, and offline maps before setting off — the app works with zero signal on the trail." },
    { icon: "📍", title: "Background GPS Recording", desc: "Opt-in background location tracking via TaskManager that survives app restarts, re-deriving the active session from SQLite on every wake-up." },
    { icon: "🔁", title: "Retry-Safe Sync", desc: "Persisted exponential backoff and real observed network-state stamping mean sync survives spotty connectivity without hammering the server." },
    { icon: "🧪", title: "Tested & CI-Gated", desc: "86 automated tests (Jest + React Native Testing Library) with lint, typecheck, and test running on every push via GitHub Actions." },
    { icon: "🏷️", title: "Honest Data Staging", desc: "Every trail pack is explicitly labelled route_only, fixture, or model_backed — fixture demo data never pretends to be a real prediction." },
  ];

  return (
    <div style={{ fontFamily: "'Inter',system-ui,-apple-system,sans-serif", background: C.bg, minHeight: "100vh", color: C.text, overflowX: "hidden" }}>
      <style>{`
        @keyframes tickerMove   { from { transform:translateX(0);       } to { transform:translateX(-50%); } }
        @keyframes fadeUp       { from{opacity:0;transform:translateY(28px);} to{opacity:1;transform:translateY(0);} }
        @keyframes pulsering    { 0%{transform:scale(1);opacity:.7;} 100%{transform:scale(2.4);opacity:0;} }
        @keyframes glowPulse    { 0%,100%{opacity:.5;} 50%{opacity:1;} }
        @keyframes shimmerLine  { 0%,100%{opacity:.3;transform:scaleX(0.4);} 50%{opacity:1;transform:scaleX(1);} }
        @keyframes fadeIn       { from{opacity:0;} to{opacity:1;} }
        @keyframes modalSlideUp { from{opacity:0;transform:translateY(32px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
        .back-btn:hover { border-color:rgba(22,163,74,0.5)!important; color:#15803d!important; background:rgba(22,163,74,0.1)!important; }
      `}</style>

      {modal && <ScreenshotModal data={modal} onClose={closeModal} />}

      {/* ── Ongoing Project Banner ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 101, height: OGB_H,
        background: `linear-gradient(90deg, ${C.green}, ${C.green2})`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "0 16px", overflow: "hidden",
      }}>
        <span style={{ position: "relative", width: 6, height: 6, borderRadius: "50%", background: "#fff", flexShrink: 0 }}>
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#fff", animation: "pulsering 1.5s ease-out infinite" }} />
        </span>
        <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 700, color: "#fff", letterSpacing: "0.02em", textAlign: "center" }}>
          🚧 Ongoing Project — JEJAK sedang dibangunkan secara aktif untuk ASEAN GeoAI Fusion 2026
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        position: "fixed", top: OGB_H, left: 0, right: 0, zIndex: 100,
        padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrollY > 60 ? "rgba(248,247,244,0.92)" : "transparent",
        backdropFilter: scrollY > 60 ? "blur(20px)" : "none",
        borderBottom: scrollY > 60 ? "1px solid rgba(22,163,74,0.12)" : "1px solid transparent",
        transition: "all 0.35s ease",
      }}>
        <a href="/" className="back-btn" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 16px", borderRadius: 999,
          border: `1px solid ${C.border2}`, background: "rgba(0,0,0,0.04)",
          color: C.muted, fontSize: 13, fontWeight: 500,
          textDecoration: "none", transition: "all 0.2s ease",
        }}>
          <ArrowLeft size={14} /> Back to Portfolio
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.green, animation: "pulsering 1.5s ease-out infinite" }} />
          </div>
          <span style={{ fontSize: 12, color: C.muted2, fontWeight: 600 }}>Hackathon · 2026</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: isMobile ? "flex-start" : "center",
        overflow: "hidden", padding: isMobile ? `${100 + OGB_H}px 20px 40px` : `${120 + OGB_H}px 24px 60px`,
      }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{
            position: "absolute", inset: 0, zIndex: 1,
            background: `radial-gradient(ellipse 75% 65% at 50% 42%, rgba(22,163,74,0.16) 0%, ${C.bg} 72%)`,
          }} />
          <ContourLines opacity={0.09} />
        </div>
        <div style={{
          position: "absolute", width: 500, height: 500, zIndex: 1,
          top: "10%", left: "50%", transform: "translateX(-50%)",
          borderRadius: "50%", background: "rgba(22,163,74,0.07)",
          filter: "blur(120px)", pointerEvents: "none",
          animation: "glowPulse 4s ease-in-out infinite",
        }} />

        <div style={{
          position: "relative", zIndex: 2, fontSize: 72, lineHeight: 1, marginBottom: 28,
          animation: "fadeUp 0.7s ease 0.1s both",
          filter: "drop-shadow(0 0 24px rgba(22,163,74,0.4))",
        }}>🧭</div>

        <div style={{
          position: "relative", zIndex: 2,
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px", borderRadius: 999,
          border: "1px solid rgba(22,163,74,0.3)", background: "rgba(22,163,74,0.1)",
          color: C.green3, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          marginBottom: 20, animation: "fadeUp 0.7s ease 0.15s both",
        }}>
          <Trophy size={11} /> ASEAN GeoAI Fusion 2026
        </div>

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", animation: "fadeUp 0.8s ease 0.2s both" }}>
          <h1 style={{ fontSize: "clamp(40px,9vw,96px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 14 }}>
            <span style={{ background: `linear-gradient(135deg, ${C.green2}, ${C.green3})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>JEJAK</span>
          </h1>
          <div style={{ fontSize: "clamp(14px,2vw,19px)", color: C.muted, fontWeight: 500, letterSpacing: "-0.01em" }}>
            GeoAI-Powered Hiking Safety App — React Native &amp; Expo
          </div>
        </div>

        <p style={{
          position: "relative", zIndex: 2, fontSize: "clamp(13px,1.6vw,16px)", color: C.muted,
          maxWidth: 620, textAlign: "center", lineHeight: 1.8, marginTop: 22, marginBottom: 36,
          animation: "fadeUp 0.8s ease 0.3s both",
        }}>
          JEJAK is a React Native mobile app that predicts <strong style={{ color: C.green3 }}>communication dead zones</strong> along
          hiking trails, lets hikers download offline trail packs before setting off, and records GPS trajectories in the
          background so search-and-rescue teams get a real last-known location once coverage returns.
        </p>

        <div style={{
          position: "relative", zIndex: 2, display: "flex", gap: isMobile ? 12 : 20,
          flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.8s ease 0.4s both",
        }}>
          {[
            { val: "GeoAI", label: "Core Tech" },
            { val: "Offline", label: "Trail Packs" },
            { val: "86", label: "Tests Passing" },
            { val: "2026", label: "Event Year" },
          ].map(({ val, label }) => <StatBadge key={label} val={val} label={label} />)}
        </div>

        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          color: C.muted2, fontSize: 11, zIndex: 2, animation: "fadeUp 1s ease 0.8s both",
        }}>
          <div style={{ width: 22, height: 36, borderRadius: 99, border: `1.5px solid rgba(22,163,74,0.3)`, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5px 0" }}>
            <div style={{ width: 4, height: 8, borderRadius: 99, background: C.green3, animation: "shimmerLine 1.6s ease-in-out infinite" }} />
          </div>
          Scroll
        </div>
      </section>

      {/* ── Ticker ── */}
      <InfoTicker />

      {/* ── Challenge & Objectives ── */}
      <ChallengeSection />

      {/* ── Divider ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", height: 1, background: "linear-gradient(90deg, transparent, rgba(22,163,74,0.15), transparent)" }} />

      {/* ── Work Plan ── */}
      <WorkPlanSection />

      {/* ── Screenshots ── */}
      <section style={{ padding: "96px 24px", background: C.bg2, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none" }}><ContourLines /></div>
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionBadge icon={<Zap size={11} />} label="React Native · Expo" />
            <h2 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.text }}>
              See It In Action
            </h2>
            <p style={{ fontSize: 14, color: C.muted2, marginTop: 10 }}>
              Klik mana-mana gambar untuk paparan penuh &amp; penerangan
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 20, maxWidth: 760, margin: "0 auto" }}>
            {mobileScreenshots.map((s, i) => (
              <PhoneScreenshotCard
                key={i} src={s.src} alt={s.alt} caption={s.caption} num={i}
                onClick={() => setModal({ ...s, num: i, total: mobileScreenshots.length })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: "96px 24px", background: C.bg, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none" }}><ContourLines /></div>
        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionBadge icon={<Star size={11} />} label="Platform Capabilities" />
            <h2 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.text }}>
              What JEJAK Delivers
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px,1fr))", gap: 14 }}>
            {features.map((f, i) => <FeatureChip key={i} icon={f.icon} title={f.title} desc={f.desc} />)}
          </div>
        </div>
      </section>

      {/* ── Expected Outcome ── */}
      <section style={{ padding: "0 24px 96px", background: C.bg }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{
            padding: "32px 36px", borderRadius: 20,
            background: "rgba(22,163,74,0.05)", border: `1px solid rgba(22,163,74,0.18)`,
            borderLeft: `3px solid rgba(22,163,74,0.55)`,
          }}>
            <Quote size={20} color={C.green3} style={{ marginBottom: 12, opacity: 0.7 }} />
            <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.9, margin: 0, fontStyle: "italic" }}>
              JEJAK gives hikers offline connectivity awareness — gated dead-zone warnings, downloadable trail packs, and
              background GPS recording that syncs a real last-known location back the moment coverage returns. The app is
              honest about what's real: every trail pack is explicitly staged as route_only, fixture, or model_backed, so
              demo data never pretends to be a genuine GeoAI prediction.
            </p>
            <div style={{ marginTop: 16, fontSize: 11.5, color: C.muted2, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
              Expected Outcome · Consumer Empowerment
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack + Project Info ── */}
      <section style={{ padding: "0 24px 96px", background: C.bg }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{
            borderRadius: 24, overflow: "hidden",
            border: `1px solid rgba(22,163,74,0.18)`,
            background: `linear-gradient(135deg, rgba(22,163,74,0.1), ${C.bg3})`,
          }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${C.green}, ${C.green3}, transparent)` }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 0, padding: "36px 36px 32px" }}>
              <div style={{ paddingRight: 36, borderRight: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Code2 size={15} color={C.green3} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Tech Stack</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "Expo SDK 54",        icon: "🧰" },
                    { label: "React Native 0.81",  icon: "📱" },
                    { label: "Expo Router",        icon: "🧭" },
                    { label: "MapLibre",           icon: "🗺️" },
                    { label: "SQLite",             icon: "🗄️" },
                    { label: "Zod",                icon: "🛡️" },
                    { label: "Jest + RNTL",        icon: "🧪" },
                    { label: "GitHub Actions CI",  icon: "⚙️" },
                  ].map(t => <TechTag key={t.label} label={t.label} icon={t.icon} />)}
                </div>
              </div>
              <div style={{ paddingLeft: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={15} color={C.green3} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Project Info</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { Icon: Calendar, label: "Period",   val: "2026" },
                    { Icon: Trophy,   label: "Event",    val: "ASEAN GeoAI Fusion 2026" },
                    { Icon: Radio,    label: "Role",     val: "Contributor" },
                    { Icon: Satellite, label: "Platform", val: "React Native (Expo)" },
                    { Icon: CheckCircle2, label: "Tests", val: "86/86 passing (CI)" },
                    { Icon: MapPin,   label: "Status",   val: "Ongoing — device test pending" },
                  ].map(({ Icon, label, val }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: "rgba(0,0,0,0.04)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={12} color={C.muted2} />
                      </div>
                      <span style={{ fontSize: 12, color: C.muted2, width: 80 }}>{label}</span>
                      <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Nav ── */}
      {isMobile && (
        <div style={{ background: C.bg2, borderTop: `1px solid rgba(22,163,74,0.2)`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <a href="/" style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 999,
            border: `1px solid ${C.border2}`, background: "rgba(0,0,0,0.04)",
            color: C.muted2, fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            <ArrowLeft size={15} /> Back to Portfolio
          </a>
        </div>
      )}
    </div>
  );
}
