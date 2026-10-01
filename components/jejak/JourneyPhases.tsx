"use client";
import { useRef, type CSSProperties } from "react";
import { useScrollScene } from "@/components/motion/scroll-scene";
import { PHASES, PHASES_COPY, pad } from "./data";
import { Lines, Rich, SceneLabel, buildStepper, useReveal } from "./primitives";

/** 03 / Journey: the 5-phase agenda as trail markers, one milestone per stretch of scroll. */
export function JourneyPhases() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useScrollScene(root, ({ desktop }, el) => {
    if (desktop) buildStepper(el, { items: ".jk-phase", marks: ".jk-rail__mark", fill: ".jk-rail__fill" });
  });

  return (
    <section
      ref={root}
      className="jk-sec jk-steps jk-phases"
      data-beat="journey"
      style={{ "--steps": PHASES.length } as CSSProperties}
      aria-labelledby="jk-phases-title"
    >
      <div className="jk-sticky">
        <div className="jk-wrap jk-phases__wrap">
          <div className="jk-panel jk-phases__panel">
            <header data-reveal-group>
              <SceneLabel scene={2} />
              <p className="jk-kicker jk-sub" data-reveal>{PHASES_COPY.title}</p>
              <h2 id="jk-phases-title" className="jk-h2"><Lines lines={PHASES_COPY.heading} /></h2>
            </header>

            <div className="jk-rail" aria-hidden>
              <span className="jk-rail__line"><i className="jk-rail__fill" /></span>
              {PHASES.map((p, i) => (
                <span key={p.title} className="jk-rail__mark"><b>{pad(i + 1)}</b></span>
              ))}
            </div>

            <ol className="jk-stack">
              {PHASES.map((p, i) => (
                <li key={p.title} className="jk-step jk-phase">
                  <span className="jk-step__num">{pad(i + 1)}</span>
                  <h3 className="jk-h3">{p.title}</h3>
                  <p className="jk-body"><Rich text={p.desc} /></p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
