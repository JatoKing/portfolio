"use client";
import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ENDING, NAV } from "./data";
import { Lines, useReveal } from "./primitives";

/* Topographic contour rings: the ending's quiet ornament. */
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

/**
 * The closing frame, a callback to the opening one: the same hiker, large again, now standing
 * tall before the peak in evening light. The words stay low and to the side so the picture
 * carries the ending; below them, the way on to the next trail.
 */
export function Ending() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <footer ref={root} className="jk-sec jk-ending" data-beat="ending" aria-labelledby="jk-ending-title">
      <div className="jk-wrap jk-ending__wrap">
        <div className="jk-ending__copy jk-scrimmed" data-reveal-group>
          <p className="jk-kicker" data-reveal>{ENDING.label}</p>
          <h2 id="jk-ending-title" className="jk-h2 jk-h2--hero"><Lines lines={ENDING.heading} /></h2>
          <div className="jk-ending__word" data-reveal>
            <Contours />
            <p className="jk-word">
              <span>{ENDING.meaning.word}</span> <em>({ENDING.meaning.kind})</em>
            </p>
            <ol className="jk-word__senses">
              {ENDING.meaning.senses.map(s => <li key={s}>{s}</li>)}
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
    </footer>
  );
}
