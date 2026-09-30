"use client";
import { useRef } from "react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { OBJECTIVES } from "./data";

/* Tactics-board pitch. Every shape has pathLength=1 so scroll can draw it in. */
function PitchBoard() {
  return (
    <svg className="fy-plan__pitch" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect pathLength={1} x="60" y="60" width="1080" height="580" />
        <line pathLength={1} x1="600" y1="60" x2="600" y2="640" />
        <circle pathLength={1} cx="600" cy="350" r="95" />
        <rect pathLength={1} x="60" y="190" width="170" height="320" />
        <rect pathLength={1} x="60" y="270" width="62" height="160" />
        <path pathLength={1} d="M230,295 A70,70 0 0,1 230,405" />
        <rect pathLength={1} x="970" y="190" width="170" height="320" />
        <rect pathLength={1} x="1078" y="270" width="62" height="160" />
        <path pathLength={1} d="M970,295 A70,70 0 0,0 970,405" />
      </g>
      <circle cx="600" cy="350" r="4" fill="currentColor" />
    </svg>
  );
}

export function ObjectivesGamePlan() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, ({ desktop, compact }, el) => {
    if (!desktop && !compact) return;

    gsap.fromTo(".fy-plan__pitch g > *", { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, ease: "none", stagger: 0.04,
      scrollTrigger: { trigger: el, start: "top 90%", end: "top 10%", scrub: 1 },
    });
    gsap.from(".fy-plan__head .fy-line > span", {
      yPercent: 110, stagger: 0.12, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "top 20%", scrub: 1 },
    });

    const nodes = el.querySelectorAll<HTMLElement>(".fy-plan__node");
    const content = (n: HTMLElement) => n.querySelectorAll(".fy-plan__kicker, h3, .fy-plan__desc");
    const fill = (n: HTMLElement) => n.querySelector(".fy-plan__marker i");

    if (desktop) {
      nodes.forEach(n => gsap.set(content(n), { autoAlpha: 0.18, y: 24 }));

      // Pass the ball: the line runs node to node, lighting each objective on arrival.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.8}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      nodes.forEach((n, i) => {
        if (i > 0) tl.to(".fy-plan__track i", { scaleX: i / (nodes.length - 1), duration: 1 });
        tl.to(fill(n), { scale: 1, duration: 0.3, ease: "back.out(2)" })
          .to(content(n), { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.4 }, "<")
          .to({}, { duration: 0.35 });
      });
    }

    if (compact) {
      gsap.to(".fy-plan__track i", {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".fy-plan__board", start: "top 70%", end: "bottom 70%", scrub: 1 },
      });
      nodes.forEach(n => {
        gsap.timeline({ scrollTrigger: { trigger: n, start: "top 78%", end: "top 50%", scrub: 1 } })
          .to(fill(n), { scale: 1, ease: "none" })
          .from(content(n), { autoAlpha: 0.15, y: 24, stagger: 0.1, ease: "none" }, 0);
      });
    }
  });

  return (
    <section ref={root} className="fy-plan" aria-labelledby="fy-plan-title">
      <PitchBoard />
      <div className="fy-plan__inner fy-wrap">
        <header className="fy-plan__header">
          <p className="fy-eyebrow">1.3 Objectives</p>
          <h2 id="fy-plan-title" className="fy-display fy-plan__head">
            <span className="fy-line"><span>The game</span></span>
            <span className="fy-line"><span className="fy-gold">plan.</span></span>
          </h2>
        </header>

        <div className="fy-plan__board">
          <div className="fy-plan__track" aria-hidden><i /></div>
          <ol className="fy-plan__nodes">
            {OBJECTIVES.map(o => (
              <li key={o.num} className="fy-plan__node">
                <span className="fy-plan__marker" aria-hidden><i /><b>{o.num}</b></span>
                <p className="fy-plan__kicker">Objective {o.num}</p>
                <h3 className="fy-display">{o.title}</h3>
                <p className="fy-plan__desc">{o.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
