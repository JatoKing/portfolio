"use client";
import { useRef } from "react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { TICKER_ITEMS } from "./data";

function Track({ items, hidden }: { items: string[]; hidden?: boolean }) {
  return (
    <div className="fy-ticker__group" aria-hidden={hidden || undefined}>
      {items.map(item => (
        <span key={item} className="fy-ticker__item">
          <span className="fy-ticker__sep" aria-hidden />
          {item}
        </span>
      ))}
    </div>
  );
}

/* Two crossing broadcast tapes: the black scoreboard strip in front, a gold
   tape behind running the other way. The CSS marquee runs continuously;
   scroll only nudges the tapes apart for a little depth. */
export function StadiumTicker() {
  const root = useRef<HTMLDivElement>(null);

  useScrollScene(root, ({ reduce }, el) => {
    if (reduce) return;
    const scroll = { trigger: el, start: "top bottom", end: "bottom top", scrub: true };
    gsap.fromTo(".fy-ticker__tape--front", { xPercent: 2 }, { xPercent: -2, ease: "none", scrollTrigger: scroll });
    gsap.fromTo(".fy-ticker__tape--back", { xPercent: -2 }, { xPercent: 2, ease: "none", scrollTrigger: scroll });
  });

  return (
    <div ref={root} className="fy-ticker" role="region" aria-label="Project highlights">
      <div className="fy-ticker__tape fy-ticker__tape--back" aria-hidden>
        <div className="fy-ticker__run fy-ticker__run--reverse">
          {Array.from({ length: 2 }, (_, g) => (
            <div key={g} className="fy-ticker__group">
              {Array.from({ length: 6 }, (_, i) => <span key={i}>Smart Ticket System</span>)}
            </div>
          ))}
        </div>
      </div>

      <div className="fy-ticker__tape fy-ticker__tape--front">
        <div className="fy-ticker__tag">
          <span className="fy-dot" aria-hidden /> FYP · 2025
        </div>
        <div className="fy-ticker__viewport">
          <div className="fy-ticker__run">
            <Track items={TICKER_ITEMS} />
            <Track items={TICKER_ITEMS} hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
