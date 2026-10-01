"use client";
import { useRef } from "react";
import { OUTCOME } from "./data";
import { Lines, Rich, SceneLabel, useReveal } from "./primitives";

/** 07 / Outcome on the forest trail. Held in place while the footprints light up behind it. */
export function Outcome() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} className="jk-sec jk-hold jk-outcome" data-beat="outcome" aria-labelledby="jk-outcome-title">
      <div className="jk-sticky">
        <div className="jk-wrap jk-outcome__wrap">
          <div className="jk-panel jk-outcome__panel" data-reveal-group>
            <SceneLabel scene={6} />
            <h2 id="jk-outcome-title" className="jk-h2"><Lines lines={OUTCOME.heading} /></h2>
            <p className="jk-body jk-outcome__text" data-reveal><Rich text={OUTCOME.text} /></p>
            <p className="jk-kicker jk-outcome__meta" data-reveal>{OUTCOME.meta}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
