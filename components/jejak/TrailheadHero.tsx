"use client";
import { useRef, type CSSProperties } from "react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { HERO, STATS } from "./data";
import { Rich, SceneLabel } from "./primitives";

const after = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

/**
 * 01 / Trailhead. The opening frame: the name across the sky, the hiker below it facing the
 * mountain, and one small glass card. As scrolling starts the name lifts away into the sky and
 * the card dissolves, leaving only the trail ahead.
 */
export function TrailheadHero() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, ({ reduce }, el) => {
    if (reduce) return;
    const away = { trigger: el, start: "top top", end: "bottom 30%", scrub: 0.6 };
    gsap.to(el.querySelector(".jk-hero__title"), { yPercent: -60, scale: 1.12, autoAlpha: 0, ease: "none", scrollTrigger: away });
    // Explicit start values: these elements are still inside their CSS entrance (opacity 0) when
    // the tweens are created, and a plain .to() would record that 0 as where to start from.
    gsap.fromTo(el.querySelector(".jk-hero__card-wrap"),
      { y: 0, autoAlpha: 1, filter: "blur(0px)" },
      { y: 40, autoAlpha: 0, filter: "blur(6px)", ease: "none", scrollTrigger: { ...away, end: "bottom 55%" } });
    gsap.fromTo(el.querySelector(".jk-hero__cue-wrap"), { autoAlpha: 1 }, {
      autoAlpha: 0, ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: "+=160", scrub: true },
    });
  });

  return (
    <section ref={root} className="jk-hero" data-beat="trailhead" aria-labelledby="jk-title">
      <div className="jk-hero__title">
        <p className="jk-hero__event jk-in" style={after(0.1)}>{HERO.event}</p>
        <h1 id="jk-title" className="jk-hero__name" aria-label={HERO.name}>
          {HERO.name.split("").map((ch, i) => (
            <span key={i} className="jk-in" style={after(0.25 + i * 0.09)} aria-hidden>{ch}</span>
          ))}
        </h1>
        <p className="jk-hero__tagline jk-in" style={after(0.85)}>{HERO.tagline}</p>
      </div>

      <div className="jk-wrap jk-hero__foot">
        <div className="jk-hero__card-wrap">
          <div className="jk-glass jk-hero__card jk-in" style={after(1.2)}>
            <SceneLabel scene={0} />
            <p className="jk-hero__intro"><Rich text={HERO.intro} /></p>
            <dl className="jk-stats">
              {STATS.map(s => (
                <div key={s.label} className="jk-stat">
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="jk-hero__cue-wrap">
        <p className="jk-hero__cue jk-in" style={after(1.6)} aria-hidden><span>{HERO.cue}</span><i /></p>
      </div>
    </section>
  );
}
