"use client";
import { useRef } from "react";
import { CHALLENGE, MISSION, pad } from "./data";
import { Lines, Rich, SceneLabel, useReveal } from "./primitives";

/** 02 / Challenge & Mission, over the middle ridge. Reads top to bottom; no pin. */
export function ChallengeSection() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} className="jk-sec jk-challenge" data-beat="challenge" aria-labelledby="jk-challenge-title">
      <div className="jk-wrap">
        <div className="jk-panel jk-challenge__lead" data-reveal-group>
          <SceneLabel scene={1} title={CHALLENGE.label} />
          <h2 id="jk-challenge-title" className="jk-h2"><Lines lines={CHALLENGE.heading} /></h2>
          <p className="jk-kicker" data-reveal>{CHALLENGE.problemLabel}</p>
          <p className="jk-statement" data-reveal><Rich text={CHALLENGE.problem} /></p>
          <ul className="jk-tags" data-reveal>
            {CHALLENGE.tags.map(t => <li key={t}>{t}</li>)}
          </ul>
        </div>

        <div className="jk-panel jk-mission" data-reveal-group>
          <p className="jk-kicker jk-mission__head" data-reveal>{CHALLENGE.missionLabel}</p>
          <ol className="jk-mission__list">
            {MISSION.map((m, i) => (
              <li key={m.title} className="jk-mission__item" data-reveal>
                <span className="jk-mission__num">{pad(i + 1)}</span>
                <h3 className="jk-h3">{m.title}</h3>
                <p className="jk-body"><Rich text={m.desc} /></p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
