"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft, ExternalLink, Calendar, MapPin,
  Users, Code2, Trophy, Star, Zap, X, ZoomIn,
  AlertTriangle, Target, CheckCircle2, FileText,
} from "lucide-react";

/* ─── Colour Tokens ──────────────────────────────────────────────── */
const C = {
  bg:      "#070c0f",
  bg2:     "#0d1518",
  bg3:     "#111b1f",
  card:    "#0f1c21",
  border:  "rgba(255,255,255,0.07)",
  border2: "rgba(255,255,255,0.11)",
  green:   "#16a34a",
  green2:  "#22c55e",
  green3:  "#4ade80",
  lime:    "#a3e635",
  gold:    "#f59e0b",
  white:   "#f8fafc",
  muted:   "rgba(248,250,252,0.55)",
  muted2:  "rgba(248,250,252,0.3)",
};

function useBreakpoint() {
  const [bp, setBp] = useState<"mobile"|"tablet"|"desktop">("desktop");
  useEffect(() => {
    const check = () => { const w = window.innerWidth; setBp(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop"); };
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

/* ─── Pitch SVG — Hero (balanced, meet) ─────────────────────────── */
function PitchLinesHero() {
  return (
    <svg
      viewBox="0 0 900 560"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity: 0.08, pointerEvents: "none",
      }}
      preserveAspectRatio="xMidYMid meet"
    >
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={50 + i * 57} y="35" width="28.5" height="490"
          fill={C.green2} opacity={i % 2 === 0 ? 0.25 : 0} />
      ))}
      <rect x="50" y="35" width="800" height="490" fill="none" stroke={C.green2} strokeWidth="2" />
      <line x1="450" y1="35" x2="450" y2="525" stroke={C.green2} strokeWidth="1.5" />
      <circle cx="450" cy="280" r="90" fill="none" stroke={C.green2} strokeWidth="1.5" />
      <circle cx="450" cy="280" r="4" fill={C.green2} />
      <rect x="50" y="165" width="145" height="230" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <rect x="50" y="215" width="55" height="130" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <path d="M195,248 A62,62 0 0,1 195,312" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <circle cx="160" cy="280" r="3" fill={C.green2} />
      <rect x="705" y="165" width="145" height="230" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <rect x="795" y="215" width="55" height="130" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <path d="M705,248 A62,62 0 0,0 705,312" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <circle cx="740" cy="280" r="3" fill={C.green2} />
      <path d="M50,47 A14,14 0 0,1 62,35"    fill="none" stroke={C.green2} strokeWidth="1" />
      <path d="M838,35 A14,14 0 0,1 850,47"  fill="none" stroke={C.green2} strokeWidth="1" />
      <path d="M50,513 A14,14 0 0,0 62,525"  fill="none" stroke={C.green2} strokeWidth="1" />
      <path d="M838,525 A14,14 0 0,0 850,513" fill="none" stroke={C.green2} strokeWidth="1" />
    </svg>
  );
}

/* ─── Pitch SVG — Sections ───────────────────────────────────────── */
function PitchLines() {
  return (
    <svg
      viewBox="0 0 800 500"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity: 0.07, pointerEvents: "none",
      }}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect x="40" y="30" width="720" height="440" fill="none" stroke={C.green2} strokeWidth="2" />
      <circle cx="400" cy="250" r="80" fill="none" stroke={C.green2} strokeWidth="1.5" />
      <circle cx="400" cy="250" r="4" fill={C.green2} />
      <line x1="400" y1="30" x2="400" y2="470" stroke={C.green2} strokeWidth="1.5" />
      <rect x="40" y="145" width="130" height="210" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <rect x="40" y="195" width="50" height="110" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <path d="M170,218 A55,55 0 0,1 170,282" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <rect x="630" y="145" width="130" height="210" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <rect x="710" y="195" width="50" height="110" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <path d="M630,218 A55,55 0 0,0 630,282" fill="none" stroke={C.green2} strokeWidth="1.2" />
      <path d="M40,42 A14,14 0 0,1 54,30"    fill="none" stroke={C.green2} strokeWidth="1" />
      <path d="M746,30 A14,14 0 0,1 760,42"  fill="none" stroke={C.green2} strokeWidth="1" />
      <path d="M40,458 A14,14 0 0,0 54,470"  fill="none" stroke={C.green2} strokeWidth="1" />
      <path d="M746,470 A14,14 0 0,0 760,458" fill="none" stroke={C.green2} strokeWidth="1" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={40 + i * 60} y="30" width="30" height="440"
          fill={C.green2} opacity={i % 2 === 0 ? 0.3 : 0} />
      ))}
    </svg>
  );
}

/* ─── Animated Score Ticker ──────────────────────────────────────── */
function ScoreTicker() {
  const items = [
    "🏟️  Bukit Jalil National Stadium",
    "⚽  Seating Capacity: 87,411",
    "🎫  Real-time Seat Allocation",
    "🔒  Secure Booking System",
    "📱  Mobile Responsive",
    "🏆  Final Year Project — Grade A",
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
        {doubled.map((item, i) => (
          <span key={i} style={{ whiteSpace: "nowrap" }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Jersey Number Badge ─────────────────────────────────────────── */
function JerseyBadge({ num, label }: { num: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 88, height: 72, borderRadius: 14,
        background: `linear-gradient(135deg, rgba(22,163,74,0.25), rgba(22,163,74,0.08))`,
        border: `1.5px solid rgba(22,163,74,0.35)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 24px rgba(22,163,74,0.12)",
        padding: "0 8px",
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: num.length > 5 ? 14 : num.length > 3 ? 17 : 22,
          fontWeight: 900, color: C.green3, letterSpacing: "-0.03em",
          textAlign: "center", lineHeight: 1,
        }}>{num}</span>
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
function ProblemCard({
  icon, title, desc, delay, visible,
}: {
  icon: string; title: string; desc: string; delay: number; visible: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "18px 20px", borderRadius: 14,
        background: hov ? "rgba(245,158,11,0.07)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hov ? "rgba(245,158,11,0.3)" : "rgba(245,158,11,0.1)"}`,
        transition: "all 0.25s ease", cursor: "default",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${0.35 + delay}s`,
        transitionProperty: "opacity, transform, background, border-color",
        transitionDuration: "0.55s, 0.55s, 0.25s, 0.25s",
      }}
    >
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.75 }}>{desc}</div>
    </div>
  );
}

/* ─── Objective Card ─────────────────────────────────────────────── */
function ObjectiveCard({
  num, title, desc, delay, visible,
}: {
  num: string; title: string; desc: string; delay: number; visible: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 20,
        padding: "20px 24px", borderRadius: 16,
        background: hov ? "rgba(22,163,74,0.07)" : C.card,
        border: `1px solid ${hov ? "rgba(22,163,74,0.28)" : C.border2}`,
        transition: "all 0.25s ease", cursor: "default",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-16px)",
        transitionDelay: `${0.45 + delay}s`,
        transitionProperty: "opacity, transform, background, border-color",
        transitionDuration: "0.55s, 0.55s, 0.25s, 0.25s",
      }}
    >
      {/* Number node */}
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: hov ? "rgba(22,163,74,0.2)" : "rgba(22,163,74,0.1)",
        border: `1.5px solid ${hov ? "rgba(22,163,74,0.5)" : "rgba(22,163,74,0.25)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.25s ease",
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 15, fontWeight: 900, color: C.green3,
        }}>{num}</span>
      </div>
      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <CheckCircle2
            size={13}
            color={hov ? C.green3 : "rgba(74,222,128,0.4)"}
            style={{ transition: "color 0.25s ease", flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, fontWeight: 800, color: C.white, letterSpacing: "-0.01em" }}>
            {title}
          </span>
        </div>
        <p style={{ fontSize: 13, color: C.muted2, lineHeight: 1.78, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── Problem Statement + Objectives Section ─────────────────────── */
function ProblemObjectivesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.06 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const problems = [
    {
      icon: "🪑",
      title: "Seat Confusion",
      desc: "Spectators frequently disregard assigned seats on tickets, occupying other seats for personal convenience — causing widespread disorder.",
    },
    {
      icon: "🚧",
      title: "Obstructed Pathways",
      desc: "Many spectators are forced to sit on stairs or cement due to seating conflicts, obstructing movement and creating safety hazards within the venue.",
    },
    {
      icon: "🔁",
      title: "Recurring Issue",
      desc: "The problem recurs particularly at football matches, yet no clear systematic solution had been implemented (Saiful, 2023).",
    },
  ];

  const objectives = [
    {
      num: "01",
      title: "Design",
      desc: "To design a smart ticketing system that provides an efficient and user-friendly platform for purchasing football tickets.",
    },
    {
      num: "02",
      title: "Develop",
      desc: "To develop a web-based application that integrates a seat-allocation algorithm, allowing users to select preferred seats and access real-time match schedules.",
    },
    {
      num: "03",
      title: "Test",
      desc: "To test the functionality of the system through simulated scenarios and real-world use cases to ensure reliability and customer satisfaction.",
    },
  ];

  return (
    <section
      ref={ref}
      style={{
        padding: "96px 24px",
        background: C.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background pitch */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none" }}>
        <PitchLines />
      </div>



      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>

        {/* ── Section header ── */}
        <div style={{
          textAlign: "center", marginBottom: 64,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <SectionBadge icon={<FileText size={11} />} label="Research Background" />
          <h2 style={{
            fontSize: "clamp(26px,4vw,40px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: C.white, margin: 0,
          }}>
            Problem &amp; Objectives
          </h2>
          <p style={{
            fontSize: 14, color: C.muted2, marginTop: 10,
            maxWidth: 480, margin: "10px auto 0",
          }}>
            The real-world challenge that motivated this system and the goals set to address it.
          </p>
        </div>

        {/* ══ PROBLEM STATEMENT ══ */}
        <div style={{
          marginBottom: 64,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
        }}>
          {/* Label row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AlertTriangle size={16} color={C.gold} />
            </div>
            <div>
              <div style={{
                fontSize: 10, color: C.muted2, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 2,
              }}>1.2</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.white, letterSpacing: "-0.02em" }}>
                Problem Statement
              </div>
            </div>
            <div style={{
              flex: 1, height: 1,
              background: "linear-gradient(90deg, rgba(245,158,11,0.25), transparent)",
            }} />
          </div>

          {/* Quote block */}
          <div style={{
            padding: "22px 28px", borderRadius: 16, marginBottom: 28,
            background: "rgba(245,158,11,0.04)",
            border: `1px solid rgba(245,158,11,0.14)`,
            borderLeft: `3px solid rgba(245,158,11,0.5)`,
          }}>
            <p style={{
              fontSize: 14.5, color: C.muted, lineHeight: 1.85,
              fontStyle: "italic", margin: 0,
            }}>
              "In recent years, there has often been confusion regarding seating arrangements in open seating areas,
              raising questions about the purpose of seat numbers on tickets. Many spectators are forced to sit on
              stairs or cement due to seating problems, which not only causes discomfort but also obstructs movement
              within the venue. Despite the recurring nature of this issue, particularly in football matches, a clear
              solution has yet to be implemented."
            </p>
            <div style={{ marginTop: 14, fontSize: 11.5, color: C.muted2, fontWeight: 600 }}>
              — Saiful, 2023
            </div>
          </div>

          {/* Problem cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
            gap: 14,
          }}>
            {problems.map((p, i) => (
              <ProblemCard
                key={i} icon={p.icon} title={p.title} desc={p.desc}
                delay={i * 0.08} visible={visible}
              />
            ))}
          </div>
        </div>

        {/* ══ OBJECTIVES ══ */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.6s ease 0.22s, transform 0.6s ease 0.22s",
        }}>
          {/* Label row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: "rgba(22,163,74,0.12)",
              border: "1px solid rgba(22,163,74,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Target size={16} color={C.green3} />
            </div>
            <div>
              <div style={{
                fontSize: 10, color: C.muted2, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 2,
              }}>1.3</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.white, letterSpacing: "-0.02em" }}>
                Objectives
              </div>
            </div>
            <div style={{
              flex: 1, height: 1,
              background: "linear-gradient(90deg, rgba(22,163,74,0.25), transparent)",
            }} />
          </div>

          {/* Objective cards with vertical connector line */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 48, top: 48, bottom: 48, width: 1,
              background: "linear-gradient(180deg, rgba(22,163,74,0.4), rgba(22,163,74,0.06))",
              pointerEvents: "none",
            }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {objectives.map((obj, i) => (
                <ObjectiveCard
                  key={i} num={obj.num} title={obj.title} desc={obj.desc}
                  delay={i * 0.1} visible={visible}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Screenshot Modal ────────────────────────────────────────────── */
interface ModalData {
  src: string; alt: string; caption: string; description: string; num: number;
}

function ScreenshotModal({ data, onClose }: { data: ModalData; onClose: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const modalImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    if (modalImgRef.current?.complete) setImgLoaded(true);
  }, [data.src]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(4,7,9,0.88)", backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 880,
          background: C.card, borderRadius: 24,
          border: `1px solid rgba(22,163,74,0.25)`,
          boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(22,163,74,0.15)",
          overflow: "hidden",
          animation: "modalSlideUp 0.3s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", gap: 7 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map(c => (
              <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.85 }} />
            ))}
          </div>
          <div style={{
            flex: 1, maxWidth: 320, height: 26, borderRadius: 7,
            background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", paddingLeft: 10, gap: 6, margin: "0 16px",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, opacity: 0.7 }} />
            <span style={{ fontSize: 11, color: C.muted2, fontFamily: "monospace" }}>
              localhost:8000/smart-ticket
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 11, color: C.green3, fontFamily: "monospace",
              background: "rgba(22,163,74,0.1)", padding: "3px 10px", borderRadius: 5,
              border: `1px solid rgba(22,163,74,0.2)`,
            }}>#{data.num + 1}</span>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border2}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.4)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                (e.currentTarget as HTMLElement).style.borderColor = C.border2;
              }}
            >
              <X size={14} color={C.muted} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div style={{
          position: "relative", background: C.bg3, maxHeight: "60vh",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {!imgLoaded && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `linear-gradient(135deg, ${C.bg3}, #0a1a10)`,
            }}>
              <PitchLines />
              <div style={{ position: "relative", zIndex: 2, fontSize: 40 }}>⚽</div>
            </div>
          )}
          <img
            ref={modalImgRef}
            src={data.src} alt={data.alt}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: "100%", height: "100%", objectFit: "contain", maxHeight: "60vh",
              display: "block", opacity: imgLoaded ? 1 : 0, transition: "opacity 0.4s ease",
            }}
          />
        </div>

        {/* Description */}
        <div style={{ padding: "22px 24px 24px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px", borderRadius: 999,
            background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)",
            color: C.green3, fontSize: 10.5, fontWeight: 700,
            letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 10,
          }}>
            Screen {data.num + 1} of 3
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: C.white, letterSpacing: "-0.02em", marginBottom: 8 }}>
            {data.caption}
          </h3>
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.75, margin: 0 }}>
            {data.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Screenshot Card ────────────────────────────────────────────── */
function ScreenshotCard({
  src, alt, caption, description, num, onClick,
}: {
  src: string; alt: string; caption: string; description: string;
  num: number; onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [hov, setHov] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 20, overflow: "hidden",
        border: `1px solid ${hov ? "rgba(22,163,74,0.45)" : C.border2}`,
        background: C.card, cursor: "pointer",
        boxShadow: hov
          ? "0 24px 64px rgba(0,0,0,0.6), 0 0 32px rgba(22,163,74,0.1)"
          : "0 8px 32px rgba(0,0,0,0.4)",
        transform: visible
          ? hov ? "translateY(-8px) scale(1.015)" : "translateY(0)"
          : "translateY(32px)",
        opacity: visible ? 1 : 0,
        transition: `transform 0.55s cubic-bezier(.22,1,.36,1) ${num * 0.12}s, opacity 0.55s ease ${num * 0.12}s, box-shadow 0.3s ease, border-color 0.3s ease`,
      }}
    >
      {/* Browser chrome */}
      <div style={{
        background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${C.border}`,
        padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
          ))}
        </div>
        <div style={{
          flex: 1, height: 22, borderRadius: 6,
          background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", paddingLeft: 10, gap: 5,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, opacity: 0.6 }} />
          <span style={{ fontSize: 10, color: C.muted2, fontFamily: "monospace" }}>
            localhost:8000/smart-ticket
          </span>
        </div>
        <div style={{
          fontSize: 10, color: C.muted2, fontFamily: "monospace",
          background: "rgba(22,163,74,0.1)", padding: "2px 8px", borderRadius: 4,
        }}>#{num + 1}</div>
      </div>

      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "16/10", background: C.bg3, overflow: "hidden" }}>
        {!loaded && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
            background: `linear-gradient(135deg, ${C.bg3}, #0a1a10)`,
          }}>
            <PitchLines />
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 36 }}>⚽</div>
              <div style={{
                width: 36, height: 3, borderRadius: 99,
                background: `linear-gradient(90deg, transparent, ${C.green2}, transparent)`,
                animation: "shimmerLine 1.4s ease-in-out infinite",
              }} />
            </div>
          </div>
        )}
        <img
          ref={imgRef}
          src={src} alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            opacity: loaded ? 1 : 0,
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "opacity 0.4s ease, transform 0.5s ease",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(7,12,15,0.75) 0%, rgba(7,12,15,0.1) 60%, transparent 100%)",
          opacity: hov ? 1 : 0, transition: "opacity 0.3s ease",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 999,
            background: "rgba(22,163,74,0.2)", border: `1.5px solid rgba(22,163,74,0.5)`,
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: hov ? "scale(1)" : "scale(0.7)",
            opacity: hov ? 1 : 0,
            transition: "all 0.3s cubic-bezier(.22,1,.36,1)",
          }}>
            <ZoomIn size={20} color={C.green3} />
          </div>
        </div>
      </div>

      {/* Caption */}
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 500 }}>{caption}</span>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: hov ? "rgba(22,163,74,0.2)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${hov ? "rgba(22,163,74,0.4)" : C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s ease",
        }}>
          <ExternalLink size={12} color={hov ? C.green3 : "rgba(255,255,255,0.3)"} />
        </div>
      </div>
    </div>
  );
}

/* ─── Feature Chip ────────────────────────────────────────────────── */
function FeatureChip({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "18px 20px", borderRadius: 16,
        background: hov ? "rgba(22,163,74,0.08)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hov ? "rgba(22,163,74,0.3)" : C.border}`,
        transition: "all 0.25s ease", cursor: "default",
      }}
    >
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.7 }}>{desc}</div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */
export default function SmartTicketPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [modal, setModal] = useState<ModalData | null>(null);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const screenshots = [
    {
      src: "/fypproject.jpeg",
      alt: "Smart Ticket homepage",
      caption: "Homepage — Stadium overview & ticket categories",
      description:
        "Halaman utama Smart Ticket System memaparkan overview Stadium Bukit Jalil dengan butiran perlawanan yang akan datang. Pengguna boleh melihat kategori tiket yang tersedia — Tribun, Biasa, dan VIP — beserta harga dan kapasiti setiap seksyen. Reka bentuk responsif memastikan pengalaman terbaik di semua peranti.",
    },
    {
      src: "/fypproject1.jpeg",
      alt: "Smart Ticket seat selection",
      caption: "Seat Selection — Real-time Bukit Jalil map",
      description:
        "Paparan pemilihan kerusi menggunakan peta SVG interaktif Stadium Bukit Jalil yang dibina khas. Setiap seksyen dikodkan warna mengikut tahap harga. Algoritma pengesahan masa nyata memastikan tiada double-booking berlaku — kerusi yang telah dibeli dikunci secara optimistic locking di peringkat pangkalan data MySQL.",
    },
    {
      src: "/fypproject2.jpeg",
      alt: "Smart Ticket booking confirmation",
      caption: "Booking Confirmation — Order summary & e-ticket",
      description:
        "Skrin pengesahan tempahan memaparkan ringkasan lengkap pesanan termasuk maklumat perlawanan, seksyen kerusi yang dipilih, jumlah bayaran, dan nombor rujukan unik. E-tiket digital dijana secara automatik dengan QR code untuk kemudahan pengesahan di pintu masuk stadium.",
    },
  ];

  const features = [
    { icon: "🗺️", title: "Interactive Seat Map",   desc: "Custom SVG map of Bukit Jalil National Stadium with real-time availability rendering per section." },
    { icon: "⚡", title: "Real-time Allocation",    desc: "Custom seat allocation algorithm prevents double-booking with optimistic locking at the database level." },
    { icon: "🔒", title: "Secure Checkout",         desc: "Session-based booking flow with CSRF protection and input validation throughout the Laravel backend." },
    { icon: "📊", title: "Admin Dashboard",         desc: "Full CRUD panel for match management, seat configuration, and booking report generation." },
    { icon: "📱", title: "Responsive UI",           desc: "Mobile-first design with Blade templates — works seamlessly on phones, tablets and desktops." },
    { icon: "🎟️", title: "E-Ticket Generation",    desc: "Auto-generated digital tickets with unique booking reference codes per confirmed purchase." },
  ];

  return (
    <div style={{
      fontFamily: "'Inter',system-ui,-apple-system,sans-serif",
      background: C.bg, minHeight: "100vh", color: C.white, overflowX: "hidden",
    }}>
      <style>{`
        @keyframes tickerMove   { from { transform:translateX(0);       } to { transform:translateX(-50%); } }
        @keyframes shimmerLine  { 0%,100%{opacity:.3;transform:scaleX(0.4);} 50%{opacity:1;transform:scaleX(1);} }
        @keyframes fadeUp       { from{opacity:0;transform:translateY(28px);} to{opacity:1;transform:translateY(0);} }
        @keyframes pulsering    { 0%{transform:scale(1);opacity:.7;} 100%{transform:scale(2.4);opacity:0;} }
        @keyframes spinSlow     { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes glowPulse    { 0%,100%{opacity:.5;} 50%{opacity:1;} }
        @keyframes fadeIn       { from{opacity:0;} to{opacity:1;} }
        @keyframes modalSlideUp { from{opacity:0;transform:translateY(32px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
        .back-btn:hover { border-color:rgba(22,163,74,0.5)!important; color:#4ade80!important; background:rgba(22,163,74,0.1)!important; }
        .cta-btn:hover  { transform:translateY(-2px)!important; box-shadow:0 12px 36px rgba(22,163,74,0.35)!important; }
      `}</style>

      {modal && <ScreenshotModal data={modal} onClose={closeModal} />}

      {/* ── Navigation ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrollY > 60 ? "rgba(7,12,15,0.92)" : "transparent",
        backdropFilter: scrollY > 60 ? "blur(20px)" : "none",
        borderBottom: scrollY > 60 ? "1px solid rgba(22,163,74,0.12)" : "1px solid transparent",
        transition: "all 0.35s ease",
      }}>
        <a href="/" className="back-btn" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 16px", borderRadius: 999,
          border: `1px solid ${C.border2}`, background: "rgba(255,255,255,0.04)",
          color: C.muted, fontSize: 13, fontWeight: 500,
          textDecoration: "none", transition: "all 0.2s ease",
        }}>
          <ArrowLeft size={14} /> Back to Portfolio
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, position: "relative" }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: C.green, animation: "pulsering 1.5s ease-out infinite",
            }} />
          </div>
          <span style={{ fontSize: 12, color: C.muted2, fontWeight: 600 }}>FYP · 2025</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        style={{
          position: "relative", minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: isMobile ? "flex-start" : "center",
          overflow: "hidden", padding: isMobile ? "100px 20px 40px" : "120px 24px 60px",
        }}
      >
        {/* Left arrow — navigate to PADU project */}
        {!isMobile && (
        <a
          href="/projects/padu"
          style={{
            position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
            zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            background: "rgba(15,28,33,0.85)", border: `1px solid ${C.border2}`, borderRadius: 16,
            padding: "20px 14px", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,.3)",
            color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
            textTransform: "uppercase", textDecoration: "none", transition: "all .2s ease",
            backdropFilter: "blur(12px)",
          }}
          onMouseEnter={e => { const b = e.currentTarget; b.style.color = C.green3; b.style.borderColor = "rgba(74,222,128,0.4)"; b.style.boxShadow = "0 8px 28px rgba(22,163,74,.2)"; }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.color = C.muted; b.style.borderColor = C.border2; b.style.boxShadow = "0 4px 20px rgba(0,0,0,.3)"; }}
        >
          <ArrowLeft size={24} />
          <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>PADU</span>
        </a>
        )}

        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{
            position: "absolute", inset: 0, zIndex: 1,
            background: `radial-gradient(ellipse 75% 65% at 50% 42%, rgba(6,20,12,0.55) 0%, ${C.bg} 72%)`,
          }} />
          <PitchLinesHero />
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
          animation: "fadeUp 0.7s ease 0.1s both, spinSlow 8s linear 0.7s infinite",
          filter: "drop-shadow(0 0 24px rgba(22,163,74,0.4))",
        }}>⚽</div>

        <div style={{
          position: "relative", zIndex: 2,
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px", borderRadius: 999,
          border: "1px solid rgba(22,163,74,0.3)", background: "rgba(22,163,74,0.1)",
          color: C.green3, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          marginBottom: 20, animation: "fadeUp 0.7s ease 0.15s both",
        }}>
          <Trophy size={11} /> Final Year Project — Grade A
        </div>

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", animation: "fadeUp 0.8s ease 0.2s both" }}>
          <h1 style={{
            fontSize: "clamp(36px,7vw,76px)", fontWeight: 900,
            letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 10,
          }}>
            <span style={{ color: C.white }}>Smart</span><br />
            <span style={{
              background: `linear-gradient(135deg, ${C.green2}, ${C.lime})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Ticket</span>
            <span style={{ color: C.white }}> System</span>
          </h1>
        </div>

        <p style={{
          position: "relative", zIndex: 2,
          fontSize: "clamp(13px,1.6vw,16px)", color: C.muted,
          maxWidth: 520, textAlign: "center",
          lineHeight: 1.8, marginTop: 18, marginBottom: 36,
          animation: "fadeUp 0.8s ease 0.3s both",
        }}>
          A full-stack national football ticket booking system featuring a real-time seat allocation
          algorithm for <strong style={{ color: C.green3 }}>Bukit Jalil National Stadium</strong>.
          Built with Laravel &amp; deployed on InfinityFree.
        </p>

        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", gap: isMobile ? 12 : 20, flexWrap: "wrap", justifyContent: "center",
          animation: "fadeUp 0.8s ease 0.4s both",
        }}>
          {[
            { num: "87K+", label: "Seat Capacity" },
            { num: "Laravel", label: "Backend" },
            { num: "MySQL", label: "Database" },
            { num: "A", label: "Final Grade" },
          ].map(({ num, label }) => (
            <JerseyBadge key={label} num={num} label={label} />
          ))}
        </div>

        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          color: C.muted2, fontSize: 11, zIndex: 2, animation: "fadeUp 1s ease 0.8s both",
        }}>
          <div style={{
            width: 22, height: 36, borderRadius: 99,
            border: `1.5px solid rgba(22,163,74,0.3)`,
            display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5px 0",
          }}>
            <div style={{
              width: 4, height: 8, borderRadius: 99, background: C.green3,
              animation: "shimmerLine 1.6s ease-in-out infinite",
            }} />
          </div>
          Scroll
        </div>
      </section>

      {/* ── Ticker ── */}
      <ScoreTicker />

      {/* ── Problem Statement + Objectives ── */}
      <ProblemObjectivesSection />

      {/* ── Divider ── */}
      <div style={{
        maxWidth: 960, margin: "0 auto", padding: "0 24px",
        height: 1,
        background: "linear-gradient(90deg, transparent, rgba(22,163,74,0.15), transparent)",
      }} />

      {/* ── Screenshots ── */}
      <section style={{ padding: "96px 24px", background: C.bg2, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none" }}>
          <PitchLines />
        </div>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionBadge icon={<Zap size={11} />} label="Project Screenshots" />
            <h2 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.white }}>
              See It In Action
            </h2>
            <p style={{ fontSize: 14, color: C.muted2, marginTop: 10 }}>
              Klik mana-mana gambar untuk paparan penuh &amp; penerangan
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 22 }}>
            {screenshots.map((s, i) => (
              <ScreenshotCard
                key={i} src={s.src} alt={s.alt} caption={s.caption}
                description={s.description} num={i}
                onClick={() => setModal({ ...s, num: i })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: "96px 24px", background: C.bg, position: "relative" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionBadge icon={<Star size={11} />} label="Key Features" />
            <h2 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.white }}>
              What Was Built
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px,1fr))", gap: 14 }}>
            {features.map((f, i) => (
              <FeatureChip key={i} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack + Project Info ── */}
      <section style={{ padding: "0 24px 96px", background: C.bg }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{
            borderRadius: 24, overflow: "hidden",
            border: `1px solid rgba(22,163,74,0.18)`,
            background: `linear-gradient(135deg, rgba(10,26,16,0.8), ${C.bg3})`,
          }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${C.green}, ${C.lime}, transparent)` }} />
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))",
              gap: 0, padding: "36px 36px 32px",
            }}>
              <div style={{ paddingRight: 36, borderRight: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Code2 size={15} color={C.green3} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>Tech Stack</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "Laravel",      icon: "🔴" },
                    { label: "PHP",          icon: "🐘" },
                    { label: "MySQL",        icon: "🗄️" },
                    { label: "Blade",        icon: "✂️" },
                    { label: "Bootstrap",    icon: "🅱️" },
                    { label: "JavaScript",   icon: "🟨" },
                    { label: "InfinityFree", icon: "☁️" },
                  ].map(t => <TechTag key={t.label} label={t.label} icon={t.icon} />)}
                </div>
              </div>
              <div style={{ paddingLeft: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Users size={15} color={C.green3} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>Project Info</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { Icon: Calendar, label: "Period",      val: "2025" },
                    { Icon: Trophy,   label: "Type",        val: "Final Year Project (FYP)" },
                    { Icon: MapPin,   label: "Institution", val: "UiTM Shah Alam" },
                    { Icon: Star,     label: "Grade",       val: "A — Distinction" },
                  ].map(({ Icon, label, val }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={12} color={C.muted2} />
                      </div>
                      <span style={{ fontSize: 12, color: C.muted2, width: 80 }}>{label}</span>
                      <span style={{ fontSize: 13, color: C.white, fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Project Nav ── */}
      {isMobile && (
        <div style={{
          background: C.bg2, borderTop: `1px solid rgba(22,163,74,0.2)`,
          padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <a href="/projects/padu" style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 999,
            border: `1px solid ${C.border2}`, background: "rgba(22,163,74,0.06)",
            color: C.muted, fontSize: 13, fontWeight: 600,
            textDecoration: "none",
          }}>
            <ArrowLeft size={15} /> PADU
          </a>
          <a href="/" style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 999,
            border: `1px solid ${C.border2}`, background: "rgba(255,255,255,0.04)",
            color: C.muted2, fontSize: 13, fontWeight: 600,
            textDecoration: "none",
          }}>
            Portfolio
          </a>
        </div>
      )}
    </div>
  );
}