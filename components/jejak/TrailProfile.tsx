"use client";
import { useRef, type CSSProperties } from "react";
import { MOTION, useScrollScene } from "@/components/motion/scroll-scene";
import { SCENES, pad } from "./data";
import { sceneTop, trackScenes } from "./beats";

/*
 * The elevation profile along the bottom: the whole climb as one line, eight
 * waypoints on it, the walked part drawn in as you go and a marker where the
 * hiker is now. Each waypoint jumps to its stage.
 */

const LO = SCENES[0].alt;
const HI = SCENES[SCENES.length - 1].alt;
/** Waypoints in the chart's 0..100 box: x across, y down. */
const POINTS = SCENES.map((s, i) => ({
  x: 3 + (i * 94) / (SCENES.length - 1),
  y: 84 - ((s.alt - LO) / (HI - LO)) * 66,
}));

const line = POINTS.map((p, i) => `${i ? "L" : "M"}${(p.x * 10).toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
const area = `${line} L${POINTS[POINTS.length - 1].x * 10} 100 L${POINTS[0].x * 10} 100 Z`;

const fmt = (n: number) => `${n.toLocaleString("en-US")} m`;

export function TrailProfile() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, (_, el) => {
    const marks = Array.from(el.querySelectorAll<HTMLElement>(".jk-profile__mark"));
    const me = el.querySelector<HTMLElement>(".jk-profile__me");
    const clip = el.querySelector<SVGRectElement>(".jk-profile__clip");
    const num = el.querySelector<HTMLElement>(".jk-profile__num");
    const label = el.querySelector<HTMLElement>(".jk-profile__label");
    const alt = el.querySelector<HTMLElement>(".jk-profile__alt");
    let current = -1;

    trackScenes((i, progress) => {
      if (i !== current) {
        current = i;
        marks.forEach((m, k) => {
          m.classList.toggle("is-active", k === i);
          m.classList.toggle("is-past", k < i);
          const button = m.querySelector("button");
          if (k === i) button?.setAttribute("aria-current", "step");
          else button?.removeAttribute("aria-current");
        });
        if (num) num.textContent = pad(i + 1);
        if (label) label.textContent = SCENES[i].label;
      }
      // The hiker eases along the profile through each stage toward the next waypoint.
      const a = POINTS[i];
      const b = POINTS[Math.min(i + 1, POINTS.length - 1)];
      const t = i < POINTS.length - 1 ? progress : 0;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      if (me) {
        me.style.left = `${x}%`;
        me.style.top = `${y}%`;
      }
      clip?.setAttribute("width", (x * 10).toFixed(1));
      if (alt) {
        const m = SCENES[i].alt + ((SCENES[Math.min(i + 1, SCENES.length - 1)].alt - SCENES[i].alt) * t);
        // Exact at a waypoint; rounded to 10 m while walking between two.
        alt.textContent = fmt(t < 0.02 ? SCENES[i].alt : Math.round(m / 10) * 10);
      }
    });
  });

  const go = (i: number) => {
    const smooth = !window.matchMedia(MOTION.reduce).matches;
    window.scrollTo({ top: sceneTop(i, SCENES[i].key), behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <nav ref={root} className="jk-profile" aria-label="Journey">
      <p className="jk-profile__now" aria-live="polite">
        <span className="jk-profile__num">01</span>
        <span className="jk-profile__label">{SCENES[0].label}</span>
        <span className="jk-profile__alt">{fmt(LO)}</span>
      </p>

      <div className="jk-profile__chart">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="jk-prof-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#2f8f5b" stopOpacity="0.22" />
              <stop offset="1" stopColor="#2f8f5b" stopOpacity="0" />
            </linearGradient>
            <clipPath id="jk-prof-clip">
              <rect className="jk-profile__clip" x="0" y="0" width="0" height="100" />
            </clipPath>
          </defs>
          <path d={area} className="jk-profile__area" />
          <path d={line} className="jk-profile__line" vectorEffect="non-scaling-stroke" />
          <g clipPath="url(#jk-prof-clip)">
            <path d={area} fill="url(#jk-prof-fill)" />
            <path d={line} className="jk-profile__line jk-profile__line--walked" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>

        <ol>
          {SCENES.map((s, i) => (
            <li
              key={s.key}
              className="jk-profile__mark"
              style={{ left: `${POINTS[i].x}%`, top: `${POINTS[i].y}%` } as CSSProperties}
            >
              <button type="button" onClick={() => go(i)} aria-label={`${pad(i + 1)} ${s.label}, ${s.topic}, ${fmt(s.alt)}`}>
                <i aria-hidden />
                <span className="jk-profile__tip" aria-hidden>
                  <b>{pad(i + 1)}</b> {s.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <span className="jk-profile__me" aria-hidden />
      </div>

      <p className="jk-profile__end" aria-hidden>
        <span>Summit</span> {fmt(HI)}
      </p>
    </nav>
  );
}
