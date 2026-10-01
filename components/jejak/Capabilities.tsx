"use client";
import { useRef, type CSSProperties } from "react";
import { useScrollScene } from "@/components/motion/scroll-scene";
import { FEATURES, FEATURES_COPY, pad } from "./data";
import { Lines, Rich, SceneLabel, buildStepper, useReveal } from "./primitives";

/** 04 / Capabilities by the forest river: an index of six, with one capability open at a time. */
export function Capabilities() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useScrollScene(root, ({ desktop }, el) => {
    if (desktop) buildStepper(el, { items: ".jk-feature", marks: ".jk-findex li" });
  });

  return (
    <section
      ref={root}
      className="jk-sec jk-steps jk-cap"
      data-beat="capabilities"
      style={{ "--steps": FEATURES.length } as CSSProperties}
      aria-labelledby="jk-cap-title"
    >
      <div className="jk-sticky">
        <div className="jk-wrap">
          <div className="jk-panel jk-cap__panel">
            <header data-reveal-group>
              <SceneLabel scene={3} />
              <p className="jk-kicker jk-sub" data-reveal>{FEATURES_COPY.title}</p>
              <h2 id="jk-cap-title" className="jk-h2"><Lines lines={FEATURES_COPY.heading} /></h2>
            </header>

            <div className="jk-cap__body">
              <ol className="jk-findex" aria-hidden>
                {FEATURES.map((f, i) => (
                  <li key={f.code}><span>{pad(i + 1)}</span>{f.code}</li>
                ))}
              </ol>
              <ol className="jk-stack">
                {FEATURES.map((f, i) => (
                  <li key={f.code} className="jk-step jk-feature">
                    <p className="jk-label jk-feature__code">
                      <span className="jk-label__num">{pad(i + 1)}</span>
                      <span className="jk-label__slash" aria-hidden>/</span>
                      <span>{f.code}</span>
                    </p>
                    <h3 className="jk-h3">{f.title}</h3>
                    <p className="jk-body"><Rich text={f.desc} /></p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
