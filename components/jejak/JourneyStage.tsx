"use client";
import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useScrollScene } from "@/components/motion/scroll-scene";
import { FOOTPRINTS, SCENES, type Gap } from "./data";
import { beatEl, gapEl, trackScenes } from "./beats";
import { Bird, Curtain, FxDefs, LeafCluster, ParticleField, Sprite, Trunk, useSprites, type Sprites } from "./fx";

/*
 * The fixed world behind the page. Every scene is the same mountain from a
 * lower vantage point, stacked in order. Each scene nests four wrappers so no
 * two timelines ever animate the same property:
 *
 *   .jk-scene         reveal  — owned by the transition INTO the scene
 *   .jk-scene__exit   leave   — owned by the transition OUT of the scene
 *   .jk-scene__drift  linger  — owned by the scene's content section
 *   .jk-scene__idle   breathe — CSS only, runs while the scene is current
 *
 * Desktop/compact share one set of timelines (compact hides the extras via
 * .jk-d); reduced motion swaps scenes with a short fade instead.
 */

const vw = (n: number) => () => (window.innerWidth * n) / 100;
const vh = (n: number) => () => (window.innerHeight * n) / 100;

type Move = { x: number; y: number; s: number };

/* 01 → 02: banks of cloud the camera flies into. Offsets are % of each sprite, centred on screen. */
const CLOUDS: { w: number; img: number; t: number; from: Move; peak: Move; out: Move; d?: boolean }[] = [
  { w: 92, img: 0, t: 0.02, from: { x: -95, y: 40, s: 0.7 }, peak: { x: -26, y: 16, s: 1.7 }, out: { x: -125, y: 30, s: 2.6 } },
  { w: 92, img: 1, t: 0.05, from: { x: 95, y: 35, s: 0.7 }, peak: { x: 28, y: 8, s: 1.8 }, out: { x: 125, y: 20, s: 2.7 } },
  { w: 84, img: 2, t: 0.08, from: { x: -60, y: 115, s: 0.6 }, peak: { x: -10, y: 46, s: 2 }, out: { x: -45, y: 150, s: 3 } },
  { w: 84, img: 0, t: 0.12, from: { x: 70, y: 120, s: 0.6 }, peak: { x: 12, y: 50, s: 2.1 }, out: { x: 60, y: 160, s: 3 } },
  { w: 72, img: 1, t: 0.15, from: { x: -40, y: -115, s: 0.6 }, peak: { x: -8, y: -42, s: 1.9 }, out: { x: -45, y: -150, s: 2.8 }, d: true },
  { w: 72, img: 2, t: 0.18, from: { x: 50, y: -105, s: 0.6 }, peak: { x: 16, y: -36, s: 1.9 }, out: { x: 60, y: -140, s: 2.8 }, d: true },
  { w: 64, img: 0, t: 0.24, from: { x: 0, y: 30, s: 0.3 }, peak: { x: 0, y: 0, s: 2.6 }, out: { x: 0, y: -70, s: 4 }, d: true },
];

/* 02 → 03: a flock crossing left to right — far, mid, then one bird right past the lens. */
const FLOCK: { y: number; w: number; t: number; dur: number; dy: number; grow: number; depth: "far" | "mid" | "near"; d?: boolean }[] = [
  { depth: "far", y: 13, w: 1.6, t: 0, dur: 0.66, dy: -3, grow: 1.3 },
  { depth: "far", y: 17, w: 1.3, t: 0.03, dur: 0.62, dy: -2, grow: 1.3, d: true },
  { depth: "far", y: 11, w: 1.2, t: 0.06, dur: 0.64, dy: -4, grow: 1.2 },
  { depth: "far", y: 20, w: 1.5, t: 0.08, dur: 0.6, dy: -1, grow: 1.4, d: true },
  { depth: "far", y: 15, w: 1.1, t: 0.11, dur: 0.62, dy: -3, grow: 1.2 },
  { depth: "far", y: 23, w: 1.4, t: 0.14, dur: 0.58, dy: 0, grow: 1.4, d: true },
  { depth: "far", y: 9, w: 1, t: 0.16, dur: 0.6, dy: -2, grow: 1.2, d: true },
  { depth: "far", y: 19, w: 1.2, t: 0.19, dur: 0.56, dy: -3, grow: 1.3, d: true },
  { depth: "mid", y: 30, w: 3.6, t: 0.16, dur: 0.48, dy: -6, grow: 1.8 },
  { depth: "mid", y: 38, w: 4.2, t: 0.22, dur: 0.44, dy: -9, grow: 1.9, d: true },
  { depth: "mid", y: 26, w: 3.2, t: 0.28, dur: 0.42, dy: -5, grow: 1.7 },
  { depth: "mid", y: 44, w: 4.8, t: 0.32, dur: 0.4, dy: -10, grow: 2, d: true },
  { depth: "near", y: 56, w: 12, t: 0.36, dur: 0.34, dy: -22, grow: 1.9, d: true },
];

/* 03 → 04: branches that sweep past while the camera slips behind the trunk. x in vw. */
const BRANCHES: { seed: number; w: number; y: number; t: number; dur: number; from: number; to: number; rot: number; d?: boolean }[] = [
  { seed: 3, w: 46, y: -14, t: 0.16, dur: 0.42, from: 110, to: -150, rot: -18 },
  { seed: 5, w: 38, y: 62, t: 0.24, dur: 0.36, from: 120, to: -160, rot: 12, d: true },
  { seed: 9, w: 70, y: 18, t: 0.38, dur: 0.3, from: 130, to: -190, rot: -6 },
  { seed: 13, w: 32, y: 78, t: 0.5, dur: 0.34, from: 120, to: -140, rot: 20, d: true },
  { seed: 17, w: 54, y: -8, t: 0.56, dur: 0.3, from: 120, to: -170, rot: 8 },
];

/* 04 → 05: foam thrown up by the rapids. */
const RIVER_MIST: { w: number; img: number; x: number; d?: boolean }[] = [
  { w: 120, img: 1, x: 20 },
  { w: 110, img: 2, x: -25 },
  { w: 100, img: 0, x: 40, d: true },
  { w: 130, img: 1, x: -5 },
];

/* 05 → 06: spray rising off the plunge pool. x is an offset from centre in vw. */
const MIST: { w: number; img: number; x: number; t: number; d?: boolean }[] = [
  { w: 110, img: 0, x: -30, t: 0.06 },
  { w: 110, img: 1, x: 30, t: 0.1 },
  { w: 96, img: 2, x: 0, t: 0.16 },
  { w: 90, img: 0, x: -46, t: 0.2, d: true },
  { w: 90, img: 1, x: 46, t: 0.24, d: true },
  { w: 120, img: 2, x: 0, t: 0.28, d: true },
];

/* 07 → 08: near leaves brushing past in front of the foliage. */
const BRUSH: { seed: number; w: number; y: number; t: number; from: number; to: number; d?: boolean }[] = [
  { seed: 21, w: 60, y: 8, t: 0.2, from: -8, to: -150 },
  { seed: 29, w: 64, y: 56, t: 0.26, from: 46, to: 190, d: true },
];

const dClass = (d?: boolean) => (d ? " jk-d" : "");

/* Moving water, glints and painted footprints, pinned to the artwork in % of the image. */
function SceneDetail({ index, sprites }: { index: number; sprites: Sprites | null }) {
  if (index === 0) {
    return (
      <>
        <Sprite className="jk-amb jk-amb--a" src={sprites?.cloud[1]} />
        <Sprite className="jk-amb jk-amb--b" src={sprites?.cloud[2]} />
      </>
    );
  }
  if (index === 3 || index === 5) {
    const glints = index === 3
      ? [[55, 64], [60, 70], [66, 74], [72, 80], [58, 83], [78, 88], [85, 95], [64, 92], [51, 67], [90, 89], [70, 97]]
      : [[70, 76], [76, 81], [82, 86], [88, 90], [74, 89], [93, 94], [66, 72], [85, 97]];
    return (
      <div className={`jk-river jk-river--${index}`}>
        {glints.map(([x, y], k) => (
          <i key={k} className="jk-glint" style={{ left: `${x}%`, top: `${y}%`, "--d": `${(k * 0.83) % 3.2}s` } as CSSProperties} />
        ))}
      </div>
    );
  }
  if (index === 4) {
    return (
      <>
        <div className="jk-fall jk-fall--main" />
        <div className="jk-fall jk-fall--left" />
        <div className="jk-fall jk-fall--right" />
        <div className="jk-fall jk-fall--upper" />
        <Sprite className="jk-pool jk-pool--a" src={sprites?.mist[0]} />
        <Sprite className="jk-pool jk-pool--b" src={sprites?.mist[1]} />
      </>
    );
  }
  if (index === 6) {
    return (
      <>
        {FOOTPRINTS.map(([x, y, w, h], k) => (
          <span key={k} className="jk-print" style={{ "--x": x, "--y": y, "--w": w, "--h": h } as CSSProperties}>
            <i />
          </span>
        ))}
      </>
    );
  }
  return null;
}

export function JourneyStage() {
  const root = useRef<HTMLDivElement>(null);
  const sprites = useSprites();
  // Highest scene reached. Backgrounds load two scenes ahead of the camera.
  const [reach, setReach] = useState(0);

  useScrollScene(root, ({ compact, reduce }, el) => {
    const q = <E extends Element = HTMLElement>(sel: string) => el.querySelector(sel) as E;
    const all = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, el);
    const scenes = all(".jk-scene");
    const scene = (i: number) => scenes[i];
    const exit = (i: number) => q(`[data-scene="${i}"] .jk-scene__exit`);
    const drift = (i: number) => q(`[data-scene="${i}"] .jk-scene__drift`);

    if (reduce) gsap.set(scenes, { autoAlpha: (i: number) => (i === 0 ? 1 : 0) });

    // Which scene the camera is at: drives idle motion, preloading, and the reduced-motion swap.
    let current = -1;
    trackScenes(i => {
      if (i === current) return;
      current = i;
      scenes.forEach((s, j) => s.classList.toggle("is-live", j === i));
      setReach(r => Math.max(r, i));
      if (reduce) gsap.to(scenes, { autoAlpha: (j: number) => (j === i ? 1 : 0), duration: 0.6, overwrite: true });
    });
    if (reduce) return;

    const scrub = compact ? 0.9 : 1.2;
    const gapTl = (gap: Gap, layer?: string) => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: gapEl(gap), start: "top bottom", end: "bottom bottom", scrub, invalidateOnRefresh: true },
      });
      // Effect layers only exist (visibility) while their own transition runs.
      if (layer) {
        tl.fromTo(q(layer), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, 0.001)
          .to(q(layer), { autoAlpha: 0, duration: 0.001 }, 0.998);
      }
      tl.set({}, {}, 1);
      return tl;
    };
    const lingerOn = (i: number, beat: string, from: gsap.TweenVars, to: gsap.TweenVars, end = "bottom top") =>
      gsap.fromTo(drift(i), from, {
        ...to, ease: to.ease ?? "none",
        scrollTrigger: { trigger: beatEl(beat), start: "top bottom", end, scrub },
      });

    /* ── 01 → 02  CLOUDS: push toward the summit, fly into cloud, ridge appears behind it ── */
    {
      const tl = gapTl("clouds", ".jk-fx--clouds");
      tl.to(exit(0), { scale: 1.3, yPercent: -2, duration: 0.66, ease: "power1.in" }, 0);
      all(".jk-cloud").forEach((c, k) => {
        const p = CLOUDS[k];
        tl.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16 }, p.t)
          .fromTo(c,
            { xPercent: p.from.x, yPercent: p.from.y, scale: p.from.s },
            { xPercent: p.peak.x, yPercent: p.peak.y, scale: p.peak.s, duration: 0.6 - p.t, ease: "power1.in" }, p.t)
          .to(c, { autoAlpha: 0, xPercent: p.out.x, yPercent: p.out.y, scale: p.out.s, duration: 0.32, ease: "power1.out" }, 0.64);
      });
      tl.fromTo(q(".jk-veil--sky"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16 }, 0.44)
        .to(q(".jk-veil--sky"), { autoAlpha: 0, duration: 0.22 }, 0.66)
        .fromTo(scene(1), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.6)
        .fromTo(scene(1), { scale: 1.2 }, { scale: 1, duration: 0.4, ease: "power2.out" }, 0.6)
        .set(exit(0), { visibility: "hidden" }, 0.61);
    }

    lingerOn(1, "challenge", { scale: 1, xPercent: 0 }, { scale: 1.06, xPercent: -1.6 });

    /* ── 02 → 03  BIRDS: the flock grows as it nears; one bird crosses the lens and drags the hillside in ── */
    {
      const tl = gapTl("birds", ".jk-fx--birds");
      tl.to(exit(1), { xPercent: -2.5, scale: 1.07, duration: 0.6, ease: "power1.inOut" }, 0);
      all(".jk-flock .jk-bird").forEach((b, k) => {
        const f = FLOCK[k];
        tl.fromTo(b,
          { x: vw(-f.w * 1.3), y: 0, scale: 1 },
          { x: vw(104), y: vh(f.dy), scale: f.grow, duration: f.dur }, f.t);
      });
      tl.fromTo(q(".jk-bird--lens"),
        { x: vw(-92), y: vh(30), scale: 0.7, rotate: -8 },
        { x: vw(100), y: vh(-14), scale: 2.1, rotate: 6, duration: 0.34, ease: "power1.in" }, 0.5)
        .fromTo(scene(2), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.5)
        .fromTo(scene(2), { "--wipe": "100%", scale: 1.08 }, { "--wipe": "0%", scale: 1, duration: 0.36, ease: "power1.in" }, 0.5)
        .set(exit(1), { visibility: "hidden" }, 0.87);
    }

    lingerOn(2, "journey", { scale: 1 }, { scale: 1.1 });

    /* ── 03 → 04  TREE: walk the trail, a trunk grows past the lens, the river forest is behind it ── */
    {
      const tl = gapTl("tree", ".jk-fx--tree");
      tl.to(exit(2), { scale: 1.24, xPercent: 1.5, duration: 0.52, ease: "power1.in" }, 0)
        .fromTo(q(".jk-trunk-wrap"), { x: vw(48), scale: 0.5 }, { x: 0, scale: 3.6, duration: 0.4, ease: "power2.in" }, 0.1)
        .to(q(".jk-trunk-wrap"), { x: vw(-190), scale: 4.6, duration: 0.26, ease: "power1.out" }, 0.5);
      all(".jk-branch").forEach((b, k) => {
        const p = BRANCHES[k];
        tl.fromTo(b,
          { x: vw(p.from), rotate: p.rot, scale: 0.8 },
          { x: vw(p.to), rotate: -p.rot * 0.5, scale: 1.5, duration: p.dur, ease: "power1.inOut" }, p.t);
      });
      tl.fromTo(scene(3), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.5)
        .fromTo(scene(3), { scale: 1.12, xPercent: 3 }, { scale: 1, xPercent: 0, duration: 0.48, ease: "power2.out" }, 0.5)
        .set(exit(2), { visibility: "hidden" }, 0.51);
    }

    lingerOn(3, "capabilities", { scale: 1, xPercent: 0 }, { scale: 1.08, xPercent: -2 });

    /* ── 04 → 05  RIVER: ride the rapids downstream into their foam; pull back out over the brink of the falls ── */
    {
      const tl = gapTl("river", ".jk-fx--river");
      tl.to(exit(3), { scale: 1.8, yPercent: -3, duration: 0.6, ease: "power2.in" }, 0);
      all(".jk-rmist").forEach((m, k) => {
        const t = 0.14 + k * 0.05;
        tl.fromTo(m, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16 }, t)
          .fromTo(m, { yPercent: 120, scale: 0.9 }, { yPercent: -15, scale: 1.7, duration: 0.5 - k * 0.05, ease: "power1.out" }, t)
          .to(m, { autoAlpha: 0, yPercent: -110, scale: 2.4, duration: 0.34, ease: "power1.in" }, 0.6);
      });
      tl.fromTo(q(".jk-veil--river"), { autoAlpha: 0 }, { autoAlpha: 0.94, duration: 0.2 }, 0.32)
        .to(q(".jk-veil--river"), { autoAlpha: 0, duration: 0.3 }, 0.58)
        .fromTo(scene(4), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.5)
        .fromTo(scene(4), { scale: 1.75 }, { scale: 1, duration: 0.48, ease: "power2.out" }, 0.5)
        .set(exit(3), { visibility: "hidden" }, 0.57);
    }

    lingerOn(4, "descent", { scale: 1, yPercent: 0 }, { scale: compact ? 1.28 : 1.5, yPercent: -5, ease: "power1.in" });

    /* ── 05 → 06  MIST: keep falling into the spray; the valley floor appears as it clears ── */
    {
      const tl = gapTl("mist", ".jk-fx--mist");
      tl.to(exit(4), { scale: 1.35, yPercent: -6, duration: 0.56, ease: "power1.in" }, 0);
      all(".jk-fx--mist .jk-mist").forEach((m, k) => {
        const p = MIST[k];
        tl.fromTo(m,
          { autoAlpha: 0, yPercent: 150, scale: 0.9 },
          { autoAlpha: 1, yPercent: -10, scale: 1.7, duration: 0.5 - p.t * 0.5, ease: "power1.out" }, p.t)
          .to(m, { autoAlpha: 0, yPercent: -170, scale: 2.6, duration: 0.36, ease: "power1.in" }, 0.6);
      });
      tl.fromTo(q(".jk-spray"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0.02)
        .to(q(".jk-spray"), { autoAlpha: 0, duration: 0.3 }, 0.66)
        .fromTo(q(".jk-veil--mist"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 }, 0.34)
        .to(q(".jk-veil--mist"), { autoAlpha: 0, duration: 0.26 }, 0.6)
        .fromTo(scene(5), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.53)
        .fromTo(scene(5), { scale: 1.16, yPercent: 6 }, { scale: 1, yPercent: 0, duration: 0.45, ease: "power2.out" }, 0.53)
        .set(exit(4), { visibility: "hidden" }, 0.54);
    }

    lingerOn(5, "experience", { scale: 1.02, xPercent: 0 }, { scale: 1.08, xPercent: -2.5 });

    /* ── 06 → 07  FOOTSTEPS: push up the valley trail and through it onto the forest path ── */
    {
      const tl = gapTl("footsteps");
      tl.to(exit(5), { scale: 1.32, duration: 0.78, ease: "power1.in" }, 0)
        .fromTo(scene(6), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.18)
        .fromTo(scene(6), { "--r": 0, scale: 0.84 }, { "--r": 250, scale: 1, duration: 0.66, ease: "power2.in" }, 0.18)
        .set(exit(5), { visibility: "hidden" }, 0.86);
    }

    lingerOn(6, "outcome", { scale: 1 }, { scale: compact ? 1.08 : 1.14 });

    // The painted boot prints light up nearest first, a trace left behind as the camera walks on.
    {
      const tl = gsap.timeline({
        defaults: { ease: "power1.out" },
        scrollTrigger: { trigger: beatEl("outcome"), start: "top bottom", end: "bottom bottom", scrub: 0.8 },
      });
      all(".jk-print").forEach((p, k) => {
        const at = k * 0.22;
        tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, at)
          .to(p, { autoAlpha: 0.5, duration: 0.6 }, at + 0.3)
          .fromTo(p.querySelector("i"), { scale: 0.6, autoAlpha: 0.9 }, { scale: 2, autoAlpha: 0, duration: 0.7 }, at);
      });
      gsap.timeline({ scrollTrigger: { trigger: beatEl("outcome"), start: "top bottom", end: "bottom top", scrub } })
        .fromTo(q(".jk-dust"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
        .to(q(".jk-dust"), { autoAlpha: 0, duration: 0.2 }, 0.8);
    }

    /* ── 07 → 08  TRAIL: walk into the undergrowth; it parts on the sunlit clearing ── */
    {
      const tl = gapTl("trail", ".jk-fx--trail");
      tl.to(exit(6), { scale: 1.42, duration: 0.6, ease: "power1.in" }, 0)
        .fromTo(q(".jk-curtain--l"), { xPercent: -102 }, { xPercent: 0, duration: 0.46, ease: "power2.in" }, 0.06)
        .fromTo(q(".jk-curtain--r"), { xPercent: 102 }, { xPercent: 0, duration: 0.46, ease: "power2.in" }, 0.06)
        .to(q(".jk-curtain--l"), { xPercent: -140, scale: 1.25, duration: 0.36, ease: "power2.out" }, 0.58)
        .to(q(".jk-curtain--r"), { xPercent: 140, scale: 1.25, duration: 0.36, ease: "power2.out" }, 0.58);
      all(".jk-brush").forEach((b, k) => {
        const p = BRUSH[k];
        tl.fromTo(b, { x: vw(p.from), scale: 0.9 }, { x: vw(p.to), scale: 2.2, duration: 0.5, ease: "power1.in" }, p.t);
      });
      tl.fromTo(q(".jk-bloom"), { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.14 }, 0.5)
        .to(q(".jk-bloom"), { autoAlpha: 0, duration: 0.36 }, 0.64)
        .fromTo(scene(7), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.54)
        .fromTo(scene(7), { scale: 1.14 }, { scale: 1, duration: 0.46, ease: "power2.out" }, 0.54)
        .set(exit(6), { visibility: "hidden" }, 0.55);
    }

    lingerOn(7, "trailhead", { scale: 1.05 }, { scale: 1 }, "bottom bottom");

    /* ── Particles: only animate while they can be seen ── */
    const spray = new ParticleField(q<HTMLCanvasElement>(".jk-spray"), "spray", compact ? 50 : 140);
    const dust = new ParticleField(q<HTMLCanvasElement>(".jk-dust"), "dust", compact ? 24 : 60);
    ScrollTrigger.create({
      trigger: gapEl("mist"), start: "top 150%", end: "bottom top",
      onToggle: s => (s.isActive ? spray.start() : spray.stop()),
    });
    ScrollTrigger.create({
      trigger: beatEl("outcome"), start: "top 150%", end: "bottom -50%",
      onToggle: s => (s.isActive ? dust.start() : dust.stop()),
    });
    const onResize = () => { spray.resize(); dust.resize(); };
    window.addEventListener("resize", onResize);
    return () => {
      spray.stop();
      dust.stop();
      window.removeEventListener("resize", onResize);
    };
  });

  return (
    <div ref={root} className="jk-stage" aria-hidden>
      <FxDefs />

      {SCENES.map((s, i) => (
        <div key={s.key} className="jk-scene" data-scene={i}>
          <div className="jk-scene__exit">
            <div className="jk-scene__drift">
              <div className="jk-scene__idle">
                <div className="jk-plate">
                  {i <= reach + 2 && (
                    <Image
                      src={s.img}
                      alt=""
                      fill
                      sizes="(max-aspect-ratio: 1672/941) 178vh, 100vw"
                      placeholder="blur"
                      className="jk-plate__img"
                      {...(i === 0 ? { preload: true } : { loading: "eager" as const })}
                    />
                  )}
                  <SceneDetail index={i} sprites={sprites} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="jk-fx jk-fx--clouds">
        <div className="jk-veil jk-veil--sky" />
        {CLOUDS.map((c, k) => (
          <Sprite
            key={k}
            className={`jk-cloud${dClass(c.d)}`}
            src={sprites?.cloud[c.img]}
            style={{ "--w": c.w } as CSSProperties}
          />
        ))}
      </div>

      <div className="jk-fx jk-fx--birds">
        <div className="jk-flock">
          {FLOCK.map((f, k) => (
            <Bird
              key={k}
              className={`jk-bird--${f.depth}${dClass(f.d)}`}
              style={{ "--y": f.y, "--w": f.w, "--flap": `${0.36 + (k % 4) * 0.05}s` } as CSSProperties}
            />
          ))}
        </div>
        <Bird className="jk-bird--lens" filter="silhouette" />
      </div>

      <div className="jk-fx jk-fx--tree">
        <div className="jk-trunk-wrap"><Trunk /></div>
        {BRANCHES.map((b, k) => (
          <div key={k} className={`jk-branch${dClass(b.d)}`} style={{ "--w": b.w, "--y": b.y } as CSSProperties}>
            <LeafCluster seed={b.seed} />
          </div>
        ))}
      </div>

      <div className="jk-fx jk-fx--river">
        <div className="jk-veil jk-veil--river" />
        {RIVER_MIST.map((m, k) => (
          <Sprite
            key={k}
            className={`jk-mist jk-rmist${dClass(m.d)}`}
            src={sprites?.mist[m.img]}
            style={{ "--w": m.w, "--x": m.x } as CSSProperties}
          />
        ))}
      </div>

      <div className="jk-fx jk-fx--mist">
        <div className="jk-veil jk-veil--mist" />
        {MIST.map((m, k) => (
          <Sprite
            key={k}
            className={`jk-mist${dClass(m.d)}`}
            src={sprites?.mist[m.img]}
            style={{ "--w": m.w, "--x": m.x } as CSSProperties}
          />
        ))}
      </div>
      <canvas className="jk-particles jk-spray" />
      <canvas className="jk-particles jk-dust" />

      <div className="jk-fx jk-fx--trail">
        <div className="jk-bloom" />
        <Curtain side="l" />
        <Curtain side="r" />
        {BRUSH.map((b, k) => (
          <div key={k} className={`jk-brush${dClass(b.d)}`} style={{ "--w": b.w, "--y": b.y } as CSSProperties}>
            <LeafCluster seed={b.seed} soft="brush" />
          </div>
        ))}
      </div>
    </div>
  );
}
