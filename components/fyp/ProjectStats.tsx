"use client";
import { useRef } from "react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { PROJECT_STATS } from "./data";

export function ProjectStats() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, ({ desktop, compact }) => {
    if (!desktop && !compact) return;

    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".fy-stats__grid", start: "top 85%", end: "top 30%", scrub: 1 },
    })
      .from(".fy-stats__item", { "--rule": 0, stagger: 0.12 }, 0)
      .from(".fy-stats__big > span", { yPercent: 105, stagger: 0.12 }, 0)
      .from(".fy-stats__meta", { autoAlpha: 0, y: 20, stagger: 0.12 }, 0.2);

    gsap.from(".fy-stats__head .fy-line > span", {
      yPercent: 110, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: ".fy-stats__head", start: "top 90%", end: "top 45%", scrub: 1 },
    });
  });

  return (
    <section ref={root} className="fy-stats" aria-labelledby="fy-stats-title">
      <div className="fy-wrap">
        <header className="fy-stats__head">
          <div>
            <p className="fy-eyebrow">Project Info</p>
            <h2 id="fy-stats-title" className="fy-display">
              <span className="fy-line"><span>Match</span></span>
              <span className="fy-line"><span className="fy-gold">report.</span></span>
            </h2>
          </div>
          <p className="fy-stats__board" aria-hidden>
            <span>Smart Ticket System</span>
            <b>FT</b>
          </p>
        </header>

        <dl className="fy-stats__grid">
          {PROJECT_STATS.map(s => (
            <div key={s.label} className="fy-stats__item">
              <dt className="fy-stats__meta">{s.label}</dt>
              <dd className="fy-stats__big" aria-hidden={s.big !== s.value || undefined}>
                <span>{s.big}</span>
              </dd>
              {s.big !== s.value && <dd className="fy-stats__meta fy-stats__value">{s.value}</dd>}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
