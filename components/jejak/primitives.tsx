"use client";
import { Fragment, type RefObject } from "react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { SCENES, pad } from "./data";

/** Renders the two inline marks used in data.ts: **emphasis** and `code_token`. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
        if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/** "02 / Challenge ——— Middle ridge": the journey's editorial metadata row. */
export function SceneLabel({ scene, title }: { scene: number; title?: string }) {
  const s = SCENES[scene];
  return (
    <p className="jk-label" data-reveal>
      <span className="jk-label__num">{pad(scene + 1)}</span>
      <span className="jk-label__slash" aria-hidden>/</span>
      <span>{title ?? s.label}</span>
      <span className="jk-label__rule" aria-hidden />
      <span className="jk-label__place">{s.place}</span>
    </p>
  );
}

/** Heading split into masked lines so each can rise into place. */
export function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map(line => (
        <span key={line} className="jk-line"><span>{line}</span></span>
      ))}
    </>
  );
}

type StepperOptions = {
  /** Overlapping items, one shown per step. */
  items: string;
  /** Markers that get .is-active / .is-past as the steps advance. */
  marks?: string;
  /** A progress line scaled along x from the first step to the last. */
  fill?: string;
  /** Extra tweens for step i, starting at timeline time `at`. */
  extra?: (tl: gsap.core.Timeline, i: number, at: number) => void;
  onStep?: (i: number) => void;
};

/**
 * Scrubbed step sequence for a sticky section (desktop only): the section's own
 * scroll length is split into holds and hand-overs, so each item gets reading
 * time and no single wheel tick jumps a step.
 */
export function buildStepper(section: HTMLElement, opts: StepperOptions) {
  const items = gsap.utils.toArray<HTMLElement>(opts.items, section);
  const marks = opts.marks ? gsap.utils.toArray<HTMLElement>(opts.marks, section) : [];
  const fill = opts.fill ? section.querySelector(opts.fill) : null;
  const switchAt: number[] = [];
  let current = -1;

  const mark = (n: number) => {
    if (n === current) return;
    current = n;
    marks.forEach((m, i) => {
      m.classList.toggle("is-active", i === n);
      m.classList.toggle("is-past", i < n);
    });
    opts.onStep?.(n);
  };

  gsap.set(items, { autoAlpha: (i: number) => (i === 0 ? 1 : 0) });
  if (fill) gsap.set(fill, { scaleX: 0 });
  mark(0);

  const tl = gsap.timeline({
    defaults: { ease: "power1.inOut" },
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: self => {
        const t = self.progress * (self.animation?.duration() ?? 0);
        mark(switchAt.filter(s => t >= s).length);
      },
    },
  });

  tl.to({}, { duration: 0.6 });
  items.forEach((item, i) => {
    if (i === 0) return;
    const at = tl.duration();
    switchAt.push(at + 0.3);
    tl.to(items[i - 1], { autoAlpha: 0, y: -28, filter: "blur(4px)", duration: 0.35 }, at)
      .fromTo(item,
        { autoAlpha: 0, y: 28, filter: "blur(4px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.4 }, at + 0.25);
    if (fill) tl.to(fill, { scaleX: i / (items.length - 1), duration: 0.6 }, at);
    opts.extra?.(tl, i, at);
    tl.to({}, { duration: 0.6 });
  });
  return tl;
}

/**
 * Time-based entrance for every [data-reveal-group] inside `root`: heading lines
 * rise out of their masks, then [data-reveal] items fade up out of a soft blur.
 * Plays forward on the way down and rewinds when scrolling back above it.
 */
export function useReveal<T extends HTMLElement>(root: RefObject<T | null>) {
  useScrollScene(root, ({ reduce }, el) => {
    if (reduce) return;
    el.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach(group => {
      const lines = group.querySelectorAll(".jk-line > span");
      const items = group.querySelectorAll("[data-reveal]");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: group, start: "top 82%", toggleActions: "play none none reverse" },
      });
      if (lines.length) tl.from(lines, { yPercent: 108, duration: 1.15, stagger: 0.09, ease: "power3.out" }, 0);
      if (items.length) {
        tl.from(items, {
          autoAlpha: 0, y: 24, filter: "blur(5px)",
          duration: 0.95, stagger: 0.08, ease: "power2.out", clearProps: "filter",
        }, 0.12);
      }
    });
  });
}
