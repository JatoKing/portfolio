"use client";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import type { PaduProject } from "./data";
import { Reveal } from "./Reveal";
import { HeroVisualPlaceholder } from "./HeroVisualPlaceholder";
import { GlassWorkCard } from "./GlassWorkCard";
import { EcosystemLinks } from "./EcosystemLinks";
import { softAccent } from "./utils";

/**
 * Writes the scroll offset (px, clamped to the hero height) into --pd-sy.
 * CSS turns it into per-layer parallax, so React never re-renders on scroll.
 */
function useHeroScrollVar(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last = -1;
    const update = () => {
      raf = 0;
      const y = Math.round(Math.min(Math.max(window.scrollY, 0), el.offsetHeight));
      if (y !== last) { last = y; el.style.setProperty("--pd-sy", String(y)); }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, [ref]);
}

export function HeroSection({
  projects, onNav,
}: { projects: PaduProject[]; onNav: (id: string) => void }) {
  const heroRef = useRef<HTMLElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  useHeroScrollVar(heroRef);

  return (
    <section ref={heroRef} className="pd-hero">
      <div className="pd-hero-flare" aria-hidden="true" />

      <div className="pd-container">
        <div className="pd-hero-head">
          <Reveal>
            <button type="button" className="pd-pill pd-back" onClick={() => window.history.back()}>
              <ArrowLeft size={13} />Back to Portfolio
            </button>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="pd-pill pd-badge">
              <span className="pd-badge-dot" aria-hidden="true" />
              Ministry of Economy Malaysia
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <h1 className="pd-title">PADU <span className="pd-accent">Projects</span></h1>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="pd-lede">
              Five gov-tech digital products I built at{" "}
              <strong>PADU Unit, Ministry of Economy Malaysia</strong>{" "}
              — Public Portal, User Guide Portal, Analytics Portal, AI Chatbot, and Agency Data Integration API.
            </p>
          </Reveal>
        </div>

        <div ref={orbitRef} className="pd-orbit">
          <EcosystemLinks rootRef={orbitRef} />

          <Reveal className="pd-orbit-core" delay={0.3}>
            <div className="pd-core-par">
              <HeroVisualPlaceholder />
            </div>
          </Reveal>

          <nav className="pd-orbit-cards" aria-label="PADU projects">
            {projects.map((p, i) => (
              <Reveal key={p.id} className={`pd-slot pd-slot--${i + 1}`} delay={0.45 + i * 0.09}>
                <div className="pd-slot-par">
                  <div className="pd-float">
                    <GlassWorkCard
                      icon={p.icon}
                      idx={p.idx}
                      title={p.title}
                      description={p.sub}
                      href={`#${p.id}`}
                      accent={softAccent(p.colorRaw)}
                      internal={p.internal}
                      onSelect={onNav}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </nav>
        </div>

        <Reveal delay={0.9}>
          <p className="pd-hero-caption">
            <span className="pd-eyebrow">{projects.length} Projects · 2025</span>
            Select any project to view full details and screenshots.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
