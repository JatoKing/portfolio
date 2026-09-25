import type { CSSProperties, ReactNode } from "react";

/* Fixed particle field (deterministic, so server and client markup match). */
const PARTICLES = [
  { x: 14, y: 58, s: 2, d: 9, delay: 0 },   { x: 22, y: 34, s: 1.5, d: 11, delay: -3 },
  { x: 30, y: 70, s: 2.5, d: 10, delay: -6 }, { x: 38, y: 22, s: 1.5, d: 12, delay: -2 },
  { x: 46, y: 80, s: 2, d: 9.5, delay: -5 }, { x: 55, y: 16, s: 1.5, d: 13, delay: -8 },
  { x: 62, y: 74, s: 2, d: 10.5, delay: -1 }, { x: 70, y: 30, s: 2.5, d: 11.5, delay: -7 },
  { x: 78, y: 62, s: 1.5, d: 9, delay: -4 },  { x: 86, y: 44, s: 2, d: 12, delay: -9 },
  { x: 8, y: 40, s: 1.5, d: 14, delay: -10 }, { x: 92, y: 70, s: 1.5, d: 13, delay: -6 },
];

/**
 * Central stage for the PADU visual.
 *
 * The glow, particles, glass platform and light pool are permanent. Only the
 * slot contents change: pass `children` (<img>, transparent PNG/WebP,
 * <video autoPlay loop muted playsInline>, <canvas>, or a Three.js / R3F root)
 * and it replaces the placeholder object without any layout change.
 */
export function HeroVisualPlaceholder({
  children, label = "Main visual · 3D PADU scene",
}: { children?: ReactNode; label?: string }) {
  return (
    <div className="pd-stage" data-slot="hero-visual">
      {/* Layer 1: ambient glow */}
      <div className="pd-stage-glow" aria-hidden="true" />

      {/* Layer 2: particles */}
      <div className="pd-stage-particles" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span key={i} className="pd-particle" style={{
            left: `${p.x}%`, top: `${p.y}%`,
            "--s": `${p.s}px`, "--d": `${p.d}s`, "--delay": `${p.delay}s`,
          } as CSSProperties} />
        ))}
      </div>

      {/* Glass platform */}
      <div className="pd-platform" data-orbit-platform="" aria-hidden="true">
        <div className="pd-ring pd-ring--base" />
        <div className="pd-ring pd-ring--4" />
        <div className="pd-ring pd-ring--1" />
        <div className="pd-ring pd-ring--2"><span className="pd-ring-node" /></div>
        <div className="pd-ring pd-ring--3" />
      </div>
      <div className="pd-stage-pool" aria-hidden="true" />

      {/* Layer 4: the object itself */}
      <div className="pd-stage-slot" data-orbit-core="">
        <div className={`pd-stage-media ${children ? "pd-stage-media--custom" : ""}`}>
          {children ?? (
            <>
              <div className="pd-beam" aria-hidden="true" />
              <div className="pd-core" aria-hidden="true">
                <div className="pd-core-shape" />
                <div className="pd-core-shape pd-core-shape--inner" />
              </div>
              <span className="pd-crop pd-crop--tl" aria-hidden="true" />
              <span className="pd-crop pd-crop--tr" aria-hidden="true" />
              <span className="pd-crop pd-crop--bl" aria-hidden="true" />
              <span className="pd-crop pd-crop--br" aria-hidden="true" />
              <span className="pd-slot-label">{label}</span>
            </>
          )}
        </div>
      </div>

      {/* Layer 5: foreground reflection */}
      <div className="pd-stage-reflect" aria-hidden="true" />
    </div>
  );
}
