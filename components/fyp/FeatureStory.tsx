"use client";
import { useRef } from "react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { FEATURES } from "./data";

export function FeatureStory() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, ({ desktop, compact }, el) => {
    if (!desktop && !compact) return;
    const shift = desktop ? 140 : 40;

    gsap.from(".fy-feat__head .fy-line > span", {
      yPercent: 110, stagger: 0.12, ease: "none",
      scrollTrigger: { trigger: ".fy-feat__head", start: "top 90%", end: "top 40%", scrub: 1 },
    });
    gsap.to(".fy-feat__arc", {
      yPercent: -30, rotate: 25, ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });

    // Rows alternate: text slides in from its own side while the number rises out of a mask.
    el.querySelectorAll<HTMLElement>(".fy-feat__row").forEach((row, i) => {
      const dir = i % 2 === 0 ? -1 : 1;
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: row, start: "top 92%", end: "top 45%", scrub: 1 },
      })
        .from(row.querySelector(".fy-feat__rule"), { scaleX: 0 }, 0)
        .from(row.querySelector(".fy-feat__num"), { yPercent: 60, clipPath: "inset(0% 0% 100% 0%)" }, 0)
        .from(row.querySelector(".fy-feat__body"), { x: shift * dir, autoAlpha: 0 }, 0.15);
    });
  });

  return (
    <section ref={root} className="fy-feat fy-paper" aria-labelledby="fy-feat-title">
      <svg className="fy-feat__arc" viewBox="0 0 400 400" aria-hidden>
        <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="5" fill="currentColor" />
        <line x1="200" y1="0" x2="200" y2="400" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <div className="fy-wrap">
        <header className="fy-feat__head">
          <p className="fy-eyebrow fy-eyebrow--ink">Key Features</p>
          <h2 id="fy-feat-title" className="fy-display">
            <span className="fy-line"><span>What was</span></span>
            <span className="fy-line fy-line--mark"><span>built.</span></span>
          </h2>
        </header>

        <ol className="fy-feat__list">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <li key={title} className={`fy-feat__row${i % 2 ? " fy-feat__row--flip" : ""}`}>
              <span className="fy-feat__rule" aria-hidden />
              <span className="fy-feat__num" aria-hidden>0{i + 1}</span>
              <div className="fy-feat__body">
                <span className="fy-feat__icon" aria-hidden><Icon size={22} strokeWidth={1.8} /></span>
                <h3 className="fy-display">{title}</h3>
                <p>{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
