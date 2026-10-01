"use client";
import { useId, useRef } from "react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";

/*
 * The JEJAK wordmark, revealed by a hand torch.
 *
 * Layers, bottom to top:
 *   beam    a blurred pool of light on the scenery behind the letters
 *   base    the letters, barely there
 *   trail   the letters fully settled, uncovered by a soft edge that follows the torch: the trace it leaves
 *   stroke  fine outlines, visible only in the torch's halo
 *   lit     a warm fill, visible only in the torch's core
 *
 * The type is set once in <defs> and reused by every layer through <use>. Letters sit on an
 * even beat (text-anchor: middle), so the spacing never depends on glyph widths.
 *
 * Decorative: the real heading is the visually hidden <h1> beside it. Without JS the title
 * settles by itself (CSS); with reduced motion it is simply shown.
 */

const BASELINE = 140;
const MID = BASELINE - 57; // optical centre of the capitals (Geist cap height ≈ 0.71 em at 160)
const STEP = 205; // letter centre to letter centre
const LETTERS = Array.from("JEJAK", (ch, i) => ({ ch, x: 46 + i * STEP }));
const DOTS = LETTERS.slice(1).map(l => l.x - STEP / 2);
const VIEW = { x: 0, y: 20, w: 920, h: 136 };
const FROM_X = -320;
const TO_X = VIEW.w + 320;
const LATE_MS = 1800; // hydrated after the CSS fallback already settled the title: don't replay it

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function JejakFlashlightTitle({ className }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);
  const played = useRef(false);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = (name: string) => `jk-torch-${name}-${id}`;
  const url = (name: string) => `url(#${ref(name)})`;

  useScrollScene(root, ({ desktop, reduce }, svg) => {
    if (reduce) return;
    svg.classList.add("is-armed");

    const follow = svg.querySelectorAll(".jk-torch__follow");
    const edge = svg.querySelector(".jk-torch__edge");
    const beam = svg.querySelector(".jk-torch__beam");
    const lights = svg.querySelectorAll(".jk-torch__lit, .jk-torch__stroke");
    gsap.set(follow, { x: FROM_X, y: MID });
    gsap.set([beam, ...lights], { opacity: 0 });

    if (!played.current && performance.now() < LATE_MS) {
      // The signature moment: the torch crosses once, leaving the title lit behind it.
      gsap.set(edge, { x: -1500 });
      gsap.timeline({ delay: 0.3, defaults: { ease: "sine.inOut" }, onComplete: () => { played.current = true; } })
        .to(beam, { opacity: 0.6, duration: 0.8, ease: "sine.out" }, 0)
        .to(lights, { opacity: 1, duration: 0.6, ease: "sine.out" }, 0.15)
        .to(follow, { x: TO_X, duration: 2.9 }, 0)
        .to(follow, { y: MID - 18, duration: 1.45, yoyo: true, repeat: 1 }, 0)
        .to(edge, { x: 0, duration: 2.9 }, 0.3)
        .to(beam, { opacity: 0, duration: 0.7, ease: "sine.in" }, 2.3)
        .to(lights, { opacity: 0, duration: 0.6, ease: "sine.in" }, 2.45);
    } else {
      played.current = true;
    }

    if (!desktop || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    // Afterwards, a torch that trails the pointer near the title. Never needed to read it.
    const hero = svg.closest("section") ?? svg;
    const pos = { x: TO_X, y: MID, a: 0 };
    const goal = { ...pos };
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const k = 1 - Math.pow(0.0015, dt); // ≈ 0.1 per frame at 60 fps
      pos.x += (goal.x - pos.x) * k;
      pos.y += (goal.y - pos.y) * k;
      pos.a += (goal.a - pos.a) * k;
      gsap.set(follow, { x: pos.x, y: pos.y });
      gsap.set(beam, { opacity: pos.a * 0.45 });
      gsap.set(lights, { opacity: pos.a * 0.8 });
      const settling = Math.abs(goal.x - pos.x) + Math.abs(goal.y - pos.y) + Math.abs(goal.a - pos.a) * 100;
      if (settling > 0.3) raf = requestAnimationFrame(frame);
      else { raf = 0; last = 0; }
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const onMove = (e: PointerEvent) => {
      if (!played.current) return;
      const r = svg.getBoundingClientRect();
      const scale = VIEW.w / r.width;
      goal.x = clamp((e.clientX - r.left) * scale, -60, VIEW.w + 60);
      goal.y = clamp(VIEW.y + (e.clientY - r.top) * scale, MID - 40, MID + 40);
      // Brightest over the title, gone ~220px away from it.
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      goal.a = Math.max(0, 1 - Math.hypot(dx, dy) / 220);
      wake();
    };
    const onLeave = () => { goal.a = 0; wake(); };

    hero.addEventListener("pointermove", onMove as EventListener);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("pointermove", onMove as EventListener);
      hero.removeEventListener("pointerleave", onLeave);
    };
  });

  return (
    <svg
      ref={root}
      className={`jk-torch ${className ?? ""}`}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      aria-hidden
      focusable="false"
    >
      <defs>
        <g id={ref("type")}>
          {LETTERS.map(l => (
            <text key={l.x} x={l.x} y={BASELINE} textAnchor="middle">{l.ch}</text>
          ))}
          {DOTS.map(x => <circle key={x} cx={x} cy={MID} r="5" opacity="0.6" />)}
        </g>

        {/* Mask paint: white shows, transparent hides. */}
        <radialGradient id={ref("core")}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={ref("halo")}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ref("sweep")}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.86" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* The light itself: a warm core falling off into a faint green-white spill. */}
        <radialGradient id={ref("light")}>
          <stop offset="0" stopColor="rgb(255,255,235)" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="rgb(225,245,215)" stopOpacity="0.15" />
          <stop offset="1" stopColor="rgb(225,245,215)" stopOpacity="0" />
        </radialGradient>
        <filter id={ref("soft")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>

        <mask id={ref("core-mask")} maskUnits="userSpaceOnUse" x="-600" y="-400" width="2200" height="900">
          <g className="jk-torch__follow"><ellipse rx="150" ry="118" fill={url("core")} /></g>
        </mask>
        <mask id={ref("halo-mask")} maskUnits="userSpaceOnUse" x="-600" y="-400" width="2200" height="900">
          <g className="jk-torch__follow"><ellipse rx="250" ry="170" fill={url("halo")} /></g>
        </mask>
        <mask id={ref("trail-mask")} maskUnits="userSpaceOnUse" x="-600" y="-400" width="2200" height="900">
          <rect className="jk-torch__edge" x="0" y="-400" width="1400" height="900" fill={url("sweep")} />
        </mask>
      </defs>

      <g className="jk-torch__beam">
        <g className="jk-torch__follow">
          <ellipse rx="260" ry="150" fill={url("light")} filter={url("soft")} />
        </g>
      </g>
      <use href={`#${ref("type")}`} className="jk-torch__base" />
      <use href={`#${ref("type")}`} className="jk-torch__trail" mask={url("trail-mask")} />
      <use href={`#${ref("type")}`} className="jk-torch__stroke" mask={url("halo-mask")} />
      <use href={`#${ref("type")}`} className="jk-torch__lit" mask={url("core-mask")} />
    </svg>
  );
}
