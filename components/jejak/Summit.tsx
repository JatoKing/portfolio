"use client";
import { useRef } from "react";
import { INFO, SCENES, SUMMIT, TECH, pad } from "./data";
import { Lines, SceneLabel, useReveal } from "./primitives";

const TOP = SCENES[SCENES.length - 1].alt;
const CLIMB = TOP - SCENES[0].alt;

/** 08 / Summit: the climax. What was achieved, what it was built with, and the project facts. */
export function Summit() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} className="jk-sec jk-summit" data-beat="summit" aria-labelledby="jk-summit-title">
      <div className="jk-wrap jk-summit__wrap">
        <header className="jk-summit__head jk-scrimmed" data-reveal-group>
          <SceneLabel scene={7} />
          <h2 id="jk-summit-title" className="jk-h2 jk-h2--hero"><Lines lines={SUMMIT.heading} /></h2>
          <p className="jk-body jk-summit__text" data-reveal>{SUMMIT.text}</p>
          <dl className="jk-summit__stats" data-reveal>
            <div><dt>Summit</dt><dd>{TOP.toLocaleString("en-US")} m</dd></div>
            <div><dt>Climbed</dt><dd>{CLIMB.toLocaleString("en-US")} m</dd></div>
            <div><dt>Stages</dt><dd>{pad(SCENES.length)}</dd></div>
          </dl>
        </header>

        <div className="jk-grid jk-summit__grid" data-reveal-group>
          <div className="jk-mod jk-mod--tech" data-reveal>
            <p className="jk-kicker">Tech Stack</p>
            <ul className="jk-tech">
              {TECH.map((t, i) => (
                <li key={t}><span>{pad(i + 1)}</span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="jk-mod jk-mod--info" data-reveal>
            <p className="jk-kicker">Project Info</p>
            <dl className="jk-info">
              {INFO.map(r => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
