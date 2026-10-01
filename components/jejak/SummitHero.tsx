"use client";
import { useRef, type CSSProperties } from "react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { HERO, STATS } from "./data";
import { Rich, SceneLabel } from "./primitives";
import { JejakFlashlightTitle } from "./FlashlightTitle";

/* Entrance delays: the metadata first, then the torch crosses the title (~0.3–3.2s), then the rest. */
const after = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

/** 01 / Summit. A one-time entrance; everything after this is scroll-driven. */
export function SummitHero() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, ({ reduce }, el) => {
    if (reduce) return;
    // Text and its local wash lift away as the camera starts its push toward the summit.
    const away = { trigger: el, start: "top top", end: "bottom 30%", scrub: 0.6 };
    gsap.to(el.querySelector(".jk-hero__inner"), { autoAlpha: 0, y: -70, filter: "blur(4px)", ease: "none", scrollTrigger: away });
    gsap.to(el.querySelector(".jk-hero__scrim"), { autoAlpha: 0, ease: "none", scrollTrigger: { ...away, end: "bottom 65%" } });
    gsap.to(el.querySelector(".jk-hero__cue"), {
      autoAlpha: 0, ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: "+=160", scrub: true },
    });
  });

  return (
    <section ref={root} className="jk-hero" data-beat="summit" aria-labelledby="jk-title">
      <div className="jk-hero__scrim" aria-hidden />
      <div className="jk-wrap">
        <div className="jk-hero__inner">
          <div className="jk-in" style={after(0.1)}><SceneLabel scene={0} /></div>
          <p className="jk-hero__event jk-in" style={after(0.25)}>{HERO.event}</p>

          <h1 id="jk-title" className="jk-sr">{HERO.name}</h1>
          <JejakFlashlightTitle />

          <p className="jk-hero__tagline jk-in" style={after(2.2)}>{HERO.tagline}</p>
          <p className="jk-hero__platform jk-in" style={after(2.32)}>{HERO.platform}</p>
          <p className="jk-hero__intro jk-in" style={after(2.45)}><Rich text={HERO.intro} /></p>

          <dl className="jk-stats jk-in" style={after(2.6)}>
            {STATS.map(s => (
              <div key={s.label} className="jk-stat">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <p className="jk-hero__cue jk-in" style={after(3.1)} aria-hidden><span>{HERO.cue}</span><i /></p>
    </section>
  );
}
