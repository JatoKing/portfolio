"use client";
import { useRef } from "react";
import { gsap, MOTION, useScrollScene } from "@/components/motion/scroll-scene";
import { SCENES, pad } from "./data";
import { sceneTop, trackScenes } from "./beats";

/** The eight-stop strip along the bottom: where you are on the mountain, and a way to jump. */
export function JourneyIndex() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, (_, el) => {
    const items = Array.from(el.querySelectorAll<HTMLElement>(".jk-index__item"));
    const fills = items.map(item => item.querySelector(".jk-index__fill"));
    let current = -1;
    trackScenes((i, progress) => {
      if (i !== current) {
        current = i;
        items.forEach((item, k) => {
          item.classList.toggle("is-active", k === i);
          const button = item.querySelector("button");
          if (k === i) button?.setAttribute("aria-current", "step");
          else button?.removeAttribute("aria-current");
          // Stops already passed read as walked; the ones ahead as untouched.
          if (k !== i) gsap.set(fills[k], { scaleX: k < i ? 1 : 0 });
        });
      }
      gsap.set(fills[i], { scaleX: progress });
    });
  });

  const go = (i: number) => {
    const smooth = !window.matchMedia(MOTION.reduce).matches;
    window.scrollTo({ top: sceneTop(i, SCENES[i].key), behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <nav ref={root} className="jk-index" aria-label="Journey">
      <ol>
        {SCENES.map((s, i) => (
          <li key={s.key} className="jk-index__item">
            <button type="button" onClick={() => go(i)} aria-label={`${pad(i + 1)} ${s.label}`}>
              <span className="jk-index__num">{pad(i + 1)}</span>
              <span className="jk-index__label">{s.label}</span>
              <span className="jk-index__bar" aria-hidden><i className="jk-index__fill" /></span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
