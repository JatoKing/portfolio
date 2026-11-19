"use client";
import { useRef } from "react";
import { COVERAGE, DISCOVERY, SOURCES, STAGING } from "./data";
import { Lines, Rich, SceneLabel, useReveal } from "./primitives";

/**
 * 06 / Falls: the rest point. The hiker stops to watch the water while the panel explains the
 * intelligence underneath JEJAK: how each segment is classified, how honestly it is staged, and
 * what open data it is built from. Held in place so the falls keep moving behind it.
 */
export function Discovery() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} className="jk-sec jk-hold jk-falls" data-beat="falls" aria-labelledby="jk-falls-title">
      <div className="jk-sticky">
        <div className="jk-wrap">
          <div className="jk-panel jk-falls__panel" data-reveal-group>
            <SceneLabel scene={5} />
            <p className="jk-kicker jk-sub" data-reveal>{DISCOVERY.title}</p>
            <h2 id="jk-falls-title" className="jk-h2"><Lines lines={DISCOVERY.heading} /></h2>
            <p className="jk-body jk-falls__lead" data-reveal><Rich text={DISCOVERY.lead} /></p>

            <div className="jk-falls__grid">
              <div data-reveal>
                <p className="jk-kicker">Every segment, classified</p>
                <ul className="jk-classes">
                  {COVERAGE.map(c => (
                    <li key={c.code} data-tone={c.tone}>
                      <code>{c.code}</code>
                      <span>{c.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div data-reveal>
                <p className="jk-kicker">Honestly staged</p>
                <ul className="jk-classes jk-classes--plain">
                  {STAGING.map(s => (
                    <li key={s.code}>
                      <code>{s.code}</code>
                      <span>{s.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="jk-falls__sources" data-reveal>
              <p className="jk-kicker">Built on open data</p>
              <ul>{SOURCES.map(s => <li key={s}>{s}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
