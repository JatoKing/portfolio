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
    const seq = [80, 120, 60, 140, 50, 110, 80, 160, 60, 180, 90, 240, 120, 320];
    let accumulated = 150;
    const ts: ReturnType<typeof setTimeout>[] = [];

    seq.forEach((d) => {
      accumulated += d;
      ts.push(setTimeout(() => setFlicker((f) => !f), accumulated));
    });

    const stableAt = accumulated + 550;
    ts.push(setTimeout(() => setStable(true), stableAt));
    ts.push(setTimeout(() => setOut(true),    stableAt + 1800));
    ts.push(setTimeout(onDone,                stableAt + 2400));

    return () => ts.forEach(clearTimeout);
  }, [onDone]);

  const on = flicker || stable;

  return (
    <>
      {/* ── Responsive styles ── */}
      <style>{`
        /* Base (mobile-first) */
        .ls-wrap {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #04040a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          overflow: hidden;
          padding: 24px;
        }

        /* Main neon title */
        .ls-title {
          font-size: clamp(44px, 14vw, 100px);
          font-weight: 900;
          letter-spacing: -0.02em;
          font-style: italic;
          line-height: 1;
          font-family: 'Inter', system-ui, sans-serif;
          transition: color .05s, text-shadow .05s;
        }

        /* WELCOME TO label */
        .ls-welcome {
          font-size: clamp(9px, 2.5vw, 11px);
          color: rgba(255,255,255,.55);
          letter-spacing: 0.32em;
          margin-bottom: 16px;
          font-family: 'JetBrains Mono','Courier New',monospace;
          text-align: center;
        }

        /* Subtitle */
        .ls-subtitle {
          font-size: clamp(9px, 2.2vw, 12px);
          color: rgba(255,255,255,.38);
          letter-spacing: 0.18em;
          margin-top: 14px;
          font-family: 'JetBrains Mono','Courier New',monospace;
          text-align: center;
        }

        /* Tech tags */
        .ls-tags {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          justify-content: center;
          max-width: min(480px, 90vw);
        }
        .ls-tag {
          font-size: clamp(9px, 2.2vw, 11px);
          padding: 4px 11px;
          border-radius: 999px;
          border: 1px solid rgba(79,70,229,.35);
          background: rgba(79,70,229,.07);
          color: #818cf8;
          font-family: Inter, sans-serif;
          letter-spacing: 0.04em;
          box-shadow: 0 0 10px rgba(79,70,229,.15);
          white-space: nowrap;
        }

        /* Glow blob — smaller on mobile */
        .ls-glow {
          position: absolute;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          pointer-events: none;
          width: min(380px, 85vw);
          height: min(380px, 85vw);
        }

        /* Bottom line */
        .ls-line {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          height: 1px;
          background: linear-gradient(90deg,transparent,#4f46e5,#7c3aed,transparent);
          box-shadow: 0 0 14px rgba(79,70,229,.5);
          transition: width 1.2s ease .3s;
        }

        /* Scanlines */
        .ls-scan {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: repeating-linear-gradient(
            0deg,
            rgba(255,255,255,.012) 0,
            rgba(255,255,255,.012) 1px,
            transparent 0,
            transparent 4px
          );
        }

        /* Tablet (640px+) */
        @media (min-width: 640px) {
          .ls-wrap { gap: 18px; padding: 32px; }
          .ls-welcome { margin-bottom: 20px; }
          .ls-subtitle { margin-top: 16px; }
          .ls-tags { gap: 8px; }
          .ls-tag { padding: 5px 13px; }
          .ls-glow {
            width: 420px;
            height: 420px;
          }
        }

        /* iPad / Desktop (1024px+) */
        @media (min-width: 1024px) {
          .ls-wrap { gap: 20px; }
          .ls-welcome { margin-bottom: 22px; letter-spacing: 0.32em; }
          .ls-subtitle { margin-top: 18px; letter-spacing: 0.22em; }
          .ls-tags { gap: 10px; }
          .ls-tag { padding: 5px 14px; }
          .ls-glow {
            width: 480px;
            height: 480px;
          }
        }
      `}</style>

      <div
        className="ls-wrap"
        style={{
          opacity:    out ? 0 : 1,
          transition: "opacity .65s ease",
        }}
      >
        {/* Scanline overlay */}
        <div className="ls-scan" />

        {/* Ambient glow blob */}
        <div
          className="ls-glow"
          style={{
            background: on
              ? "radial-gradient(circle,rgba(79,70,229,.18) 0%,transparent 70%)"
              : "none",
            transition: "background .08s",
          }}
        />

        {/* Main content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>

          {/* Welcome label */}
          <div className="ls-welcome">WELCOME TO</div>

          {/* Neon title */}
          <div
            className="ls-title"
            style={{
              color: on ? "#ffffff" : "rgba(255,255,255,.05)",
              textShadow: on
                ? `0 0 18px #4f46e5,
                   0 0 38px rgba(79,70,229,.7),
                   0 0 72px rgba(79,70,229,.35),
                   0 0 120px rgba(79,70,229,.15)`
                : "none",
            }}
          >
            Port
            <span
              style={{
                color: on ? "#a5b4fc" : "rgba(165,180,252,.05)",
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

          {/* Subtitle */}
          <div
            className="ls-subtitle"
            style={{
              opacity:   stable ? 1 : 0,
              transform: stable ? "translateY(0)" : "translateY(6px)",
              transition: "opacity .6s ease, transform .6s ease",
            }}
          >
            WEB &amp; FRONTEND DEVELOPER
          </div>
        </div>

        {/* Tech tags */}
        <div
          className="ls-tags"
          style={{
            position:  "relative",
            zIndex:    1,
            opacity:   stable ? 1 : 0,
            transform: stable ? "translateY(0)" : "translateY(8px)",
            transition: "opacity .6s ease .25s, transform .6s ease .25s",
          }}
        >
          {["Next.js", "React", "TypeScript", "Tailwind CSS"].map((t) => (
            <span key={t} className="ls-tag">{t}</span>
          ))}
        </div>

        {/* Bottom separator line */}
        <div
          className="ls-line"
          style={{ width: stable ? "min(420px,80vw)" : 0 }}
        />
      </div>
    </>
  );
}