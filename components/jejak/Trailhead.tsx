"use client";
import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { INFO, NAV, TECH, TRAILHEAD, pad } from "./data";
import { Lines, SceneLabel, useReveal } from "./primitives";

/* Topographic contour rings: the trailhead's quiet ornament. */
function Contours() {
  return (
    <svg className="jk-contours" viewBox="0 0 300 300" aria-hidden>
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <path
          key={i}
          d={`M150 ${44 + i * 13}c${52 - i * 4} -6 ${96 - i * 9} 30 ${98 - i * 10} ${84 - i * 8}s-${30 - i * 2} ${92 - i * 9} -${94 - i * 9} ${96 - i * 10}s-${104 - i * 10} -${34 - i * 3} -${100 - i * 10} -${92 - i * 9}s${44 - i * 4} -${86 - i * 8} ${96 - i * 9} -${88 - i * 8}z`}
        />
      ))}
      <circle cx="166" cy="150" r="3" />
    </svg>
  );
}

/** 08 / Trailhead: tech stack, project facts, and the way on to the next trail. */
export function Trailhead() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} className="jk-sec jk-trailhead" data-beat="trailhead" aria-labelledby="jk-trailhead-title">
      <div className="jk-wrap jk-trailhead__wrap">
        <header className="jk-panel jk-trailhead__head" data-reveal-group>
          <SceneLabel scene={7} />
          <h2 id="jk-trailhead-title" className="jk-h2"><Lines lines={TRAILHEAD.heading} /></h2>
        </header>

        <div className="jk-trailhead__foot">
          <div className="jk-grid" data-reveal-group>
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

            <div className="jk-mod jk-mod--word" data-reveal>
              <Contours />
              <p className="jk-word">
                <span>{TRAILHEAD.meaning.word}</span> <em>({TRAILHEAD.meaning.kind})</em>
              </p>
              <ol className="jk-word__senses">
                {TRAILHEAD.meaning.senses.map(s => <li key={s}>{s}</li>)}
              </ol>
            </div>
          </div>

          <nav className="jk-onward" aria-label="More projects" data-reveal-group>
            <Link href={NAV.prev.href} className="jk-onward__link" data-reveal>
              <span className="jk-kicker"><ArrowLeft size={12} /> Previous trail</span>
              <span className="jk-onward__name">{NAV.prev.label}</span>
            </Link>
            <Link href={NAV.home.href} className="jk-onward__link jk-onward__link--home" data-reveal>
              <span className="jk-kicker">Base camp</span>
              <span className="jk-onward__name">{NAV.home.label}</span>
            </Link>
            <Link href={NAV.next.href} className="jk-onward__link jk-onward__link--next" data-reveal>
              <span className="jk-kicker">Next trail <ArrowRight size={12} /></span>
              <span className="jk-onward__name">{NAV.next.label}</span>
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}
