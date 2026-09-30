"use client";
import { useRef } from "react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { PROBLEMS, PROBLEM_QUOTE, PROBLEM_SOURCE } from "./data";

const HEAD = ["The problem", "started in", "the stands."];

export function ProblemStory() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, ({ desktop, compact }, el) => {
    if (!desktop && !compact) return;

    gsap.from(".fy-problem__head .fy-line > span", {
      yPercent: 110, stagger: 0.12, ease: "none",
      scrollTrigger: { trigger: el, start: "top 85%", end: "top 15%", scrub: 1 },
    });
    gsap.from(".fy-problem__quote", {
      autoAlpha: 0, y: 40, ease: "none",
      scrollTrigger: { trigger: el, start: "top 60%", end: "top 5%", scrub: 1 },
    });

    const panels = el.querySelectorAll<HTMLElement>(".fy-problem__panel");
    const bars = el.querySelectorAll<HTMLElement>(".fy-problem__bar i");

    if (desktop) {
      gsap.set(bars, { scaleX: i => (i === 0 ? 1 : 0) });

      // Heading stays put on the left; each scroll step hands the stage to the next issue.
      const tl = gsap.timeline({
        defaults: { ease: "power1.inOut" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * 2.4}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.to({}, { duration: 0.6 });
      panels.forEach((panel, i) => {
        if (i === 0) return;
        const at = tl.duration();
        tl.to(panels[i - 1], { autoAlpha: 0, yPercent: -18, duration: 0.5 }, at)
          .fromTo(panel, { autoAlpha: 0, yPercent: 18 }, { autoAlpha: 1, yPercent: 0, duration: 0.5 }, at + 0.25)
          .fromTo(panel.querySelector(".fy-problem__num"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6 }, at + 0.25)
          .to(bars[i], { scaleX: 1, duration: 0.6 }, at + 0.1)
          .to({}, { duration: 0.6 });
      });
    }

    if (compact) {
      panels.forEach(panel => {
        gsap.from(panel, {
          autoAlpha: 0, y: 60, ease: "none",
          scrollTrigger: { trigger: panel, start: "top 90%", end: "top 60%", scrub: 1 },
        });
      });
    }
  });

  return (
    <section ref={root} className="fy-problem fy-paper" aria-labelledby="fy-problem-title">
      <div className="fy-problem__inner fy-wrap">
        <div className="fy-problem__lead">
          <p className="fy-eyebrow fy-eyebrow--ink">Research Background · 1.2 Problem Statement</p>
          <h2 id="fy-problem-title" className="fy-display fy-problem__head">
            {HEAD.map((l, i) => (
              <span key={l} className={`fy-line${i === 2 ? " fy-line--mark" : ""}`}><span>{l}</span></span>
            ))}
          </h2>
          <p className="fy-problem__sub">
            The real-world challenge that motivated this system and the goals set to address it.
          </p>
          <blockquote className="fy-problem__quote">
            <p>&ldquo;{PROBLEM_QUOTE}&rdquo;</p>
            <cite>— {PROBLEM_SOURCE}</cite>
          </blockquote>
        </div>

        <div className="fy-problem__story">
          <div className="fy-problem__progress" aria-hidden>
            {PROBLEMS.map((p, i) => (
              <span key={p.title} className="fy-problem__bar">
                <b>0{i + 1}</b>
                <i />
              </span>
            ))}
          </div>
          <ol className="fy-problem__panels">
            {PROBLEMS.map(({ icon: Icon, title, desc }, i) => (
              <li key={title} className="fy-problem__panel">
                <span className="fy-problem__num" aria-hidden>0{i + 1}</span>
                <div className="fy-problem__body">
                  <Icon className="fy-problem__icon" size={28} strokeWidth={1.6} aria-hidden />
                  <h3 className="fy-display">{title}</h3>
                  <p>{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
