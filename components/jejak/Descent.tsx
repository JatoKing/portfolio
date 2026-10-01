"use client";
import { useRef } from "react";
import { DESCENT } from "./data";
import { Lines, SceneLabel, useReveal } from "./primitives";

/** 05 / Descent. The waterfall is the content here; the words stay small and out of its way. */
export function Descent() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} className="jk-sec jk-hold jk-descent" data-beat="descent" aria-labelledby="jk-descent-title">
      <div className="jk-sticky">
        <div className="jk-wrap">
          <div className="jk-descent__copy" data-reveal-group>
            <SceneLabel scene={4} />
            <h2 id="jk-descent-title" className="jk-h2 jk-h2--quiet"><Lines lines={DESCENT.heading} /></h2>
          </div>
        </div>
      </div>
    </section>
  );
}
