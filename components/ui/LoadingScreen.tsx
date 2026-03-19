"use client";
import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onDone?: () => void;
}

export default function LoadingScreen({ onDone = () => {} }: LoadingScreenProps) {
  const [flicker, setFlicker] = useState(false);
  const [stable,  setStable]  = useState(false);
  const [out,     setOut]     = useState(false);

  useEffect(() => {
    // Flicker sequence — jarak masa (ms) antara setiap toggle
    // Boleh tambah/kurang entries untuk tukar feel flicker
    const seq = [80, 120, 60, 140, 50, 110, 80, 160, 60, 180, 90, 240, 120, 320];

    let accumulated = 150; // delay sebelum flicker start
    const ts: ReturnType<typeof setTimeout>[] = [];

    seq.forEach((d) => {
      accumulated += d;
      ts.push(setTimeout(() => setFlicker((f) => !f), accumulated));
    });

    // Selepas flicker habis → stable on
    const stableAt = accumulated + 550;
    ts.push(setTimeout(() => setStable(true), stableAt));

    // Exit fade out
    ts.push(setTimeout(() => setOut(true),  stableAt + 1800));
    ts.push(setTimeout(onDone,               stableAt + 2400));

    return () => ts.forEach(clearTimeout);
  }, [onDone]);

  const on = flicker || stable;

  return (
    <div
      style={{
        position:   "fixed",
        inset:      0,
        zIndex:     9999,
        background: "#04040a",
        display:    "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        overflow: "hidden",
        // Exit transition
        opacity:    out ? 0 : 1,
        transition: "opacity .65s ease",
      }}
    >
      {/* ── Scanline overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg,rgba(255,255,255,.012) 0,rgba(255,255,255,.012) 1px,transparent 0,transparent 4px)",
        }}
      />

      {/* ── Ambient glow blob ── */}
      <div
        style={{
          position:     "absolute",
          width:        480,
          height:       480,
          borderRadius: "50%",
          background:   on
            ? "radial-gradient(circle,rgba(79,70,229,.18) 0%,transparent 70%)"
            : "none",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          transition: "background .08s",
          pointerEvents: "none",
        }}
      />

      {/* ── Main neon text ── */}
      <div
        style={{
          position:   "relative",
          zIndex:     1,
          textAlign:  "center",
          fontFamily: "'Inter',system-ui,sans-serif",
        }}
      >
        {/* Top label */}
        <div
          style={{
            fontSize:      11,
            color:         "rgba(255,255,255,.55)",
            letterSpacing: "0.32em",
            marginBottom:  22,
            fontFamily:    "'JetBrains Mono','Courier New',monospace",
          }}
        >
          WELCOME TO
        </div>

        {/* Main text — bold neon */}
        <div
          style={{
            fontSize:      "clamp(52px,10vw,100px)",
            fontWeight:    900,
            letterSpacing: "-0.02em",
            fontStyle:     "italic",
            lineHeight:    1,
            color:         on ? "#ffffff" : "rgba(255,255,255,.05)",
            textShadow:    on
              ? `0 0 18px #4f46e5,
                 0 0 38px rgba(79,70,229,.7),
                 0 0 72px rgba(79,70,229,.35),
                 0 0 120px rgba(79,70,229,.15)`
              : "none",
            transition: "color .05s, text-shadow .05s",
          }}
        >
          Port
          <span
            style={{
              color:      on ? "#a5b4fc" : "rgba(165,180,252,.05)",
              textShadow: on
                ? `0 0 18px #7c3aed,
                   0 0 38px rgba(124,58,237,.7),
                   0 0 72px rgba(124,58,237,.35)`
                : "none",
              transition: "color .05s, text-shadow .05s",
            }}
          >
            folio
          </span>
        </div>

        {/* Subtitle — appears after stable */}
        <div
          style={{
            fontSize:      12,
            color:         "rgba(255,255,255,.38)",
            letterSpacing: "0.22em",
            marginTop:     18,
            fontFamily:    "'JetBrains Mono','Courier New',monospace",
            opacity:       stable ? 1 : 0,
            transform:     stable ? "translateY(0)" : "translateY(6px)",
            transition:    "opacity .6s ease, transform .6s ease",
          }}
        >
          WEB &amp; FRONTEND DEVELOPER
        </div>
      </div>

      {/* ── Tech tags — appear after stable ── */}
      <div
        style={{
          position:  "relative",
          zIndex:    1,
          display:   "flex",
          gap:       10,
          flexWrap:  "wrap",
          justifyContent: "center",
          opacity:   stable ? 1 : 0,
          transform: stable ? "translateY(0)" : "translateY(8px)",
          transition:"opacity .6s ease .25s, transform .6s ease .25s",
        }}
      >
        {["Next.js", "React", "TypeScript", "Tailwind CSS"].map((t) => (
          <span
            key={t}
            style={{
              fontSize:     11,
              padding:      "5px 14px",
              borderRadius: 999,
              border:       "1px solid rgba(79,70,229,.35)",
              background:   "rgba(79,70,229,.07)",
              color:        "#818cf8",
              fontFamily:   "Inter,sans-serif",
              letterSpacing:"0.04em",
              boxShadow:    "0 0 10px rgba(79,70,229,.15)",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* ── Bottom separator line ── */}
      <div
        style={{
          position:   "absolute",
          bottom:     0,
          left:       "50%",
          transform:  "translateX(-50%)",
          height:     1,
          width:      stable ? "min(420px,80vw)" : 0,
          background: "linear-gradient(90deg,transparent,#4f46e5,#7c3aed,transparent)",
          boxShadow:  "0 0 14px rgba(79,70,229,.5)",
          transition: "width 1.2s ease .3s",
        }}
      />
    </div>
  );
}