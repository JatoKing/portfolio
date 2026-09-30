"use client";
import { useRef } from "react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { TECH_STACK } from "./data";

const ROWS = [TECH_STACK.slice(0, 4), TECH_STACK.slice(4)].map(r => r.map(t => t.name));

function Row({ names, reverse }: { names: string[]; reverse?: boolean }) {
  // Repeated so the row always overflows the viewport while it slides.
  const run = [...names, ...names, ...names];
  return (
    <div className={`fy-tech__row${reverse ? " fy-tech__row--reverse" : ""}`}>
      {run.map((n, i) => (
        <span key={i} className={i % 2 ? "is-outline" : undefined}>{n}</span>
      ))}
    </div>
  );
}

export function TechStackMarquee() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, ({ desktop, compact }, el) => {
    if (!desktop && !compact) return;
    const amount = desktop ? 28 : 16;
    const scroll = { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 };

    gsap.fromTo(".fy-tech__row:not(.fy-tech__row--reverse)", { xPercent: 0 }, { xPercent: -amount, ease: "none", scrollTrigger: scroll });
    gsap.fromTo(".fy-tech__row--reverse", { xPercent: -amount }, { xPercent: 0, ease: "none", scrollTrigger: scroll });
    gsap.from(".fy-tech__head .fy-line > span", {
      yPercent: 110, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "top 30%", scrub: 1 },
    });
    gsap.from(".fy-tech__item", {
      y: 40, autoAlpha: 0, stagger: 0.08, ease: "none",
      scrollTrigger: { trigger: ".fy-tech__list", start: "top 95%", end: "top 60%", scrub: 1 },
    });
  });

  return (
    <section ref={root} className="fy-tech" aria-labelledby="fy-tech-title">
      <div className="fy-tech__band">
        <header className="fy-tech__head fy-wrap">
          <p className="fy-eyebrow fy-eyebrow--ink">Tech Stack</p>
          <h2 id="fy-tech-title" className="fy-display">
            <span className="fy-line"><span>The squad.</span></span>
          </h2>
        </header>

        <div className="fy-tech__rows" aria-hidden>
          <Row names={ROWS[0]} />
          <Row names={ROWS[1]} reverse />
        </div>

        <ul className="fy-tech__list fy-wrap">
          {TECH_STACK.map((t, i) => (
            <li key={t.name} className="fy-tech__item">
              <span className="fy-tech__no">{String(i + 1).padStart(2, "0")}</span>
              <span className="fy-tech__name">{t.name}</span>
              <span className="fy-tech__role">{t.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
