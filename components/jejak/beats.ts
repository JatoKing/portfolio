"use client";
import { ScrollTrigger } from "@/components/motion/scroll-scene";
import type { Gap } from "./data";

/*
 * The page is a strip of "beats" (content sections, data-beat) separated by
 * "gaps" (empty scroll the camera travels through, data-gap). Each gap holds a
 * marker at the point where its transition swaps scenes; a scene "owns" the
 * scroll from the marker before it to the marker after it.
 */

export const beatEl = (key: string) => document.querySelector<HTMLElement>(`[data-beat="${key}"]`);
export const gapEl = (gap: Gap) => document.querySelector<HTMLElement>(`[data-gap="${gap}"]`);

/**
 * Calls `onScene(index, progress)` with the scene the camera is at and how far through it.
 *
 * Worked out from the scroll position on every update and refresh rather than from per-scene
 * enter/leave callbacks, so it is right at scroll 0, at the very bottom, after a reload
 * mid-page, and after a jump that skips scenes entirely. Call inside a gsap context.
 */
export function trackScenes(onScene: (index: number, progress: number) => void) {
  let starts: number[] = [0];
  const measure = () => {
    const marks = document.querySelectorAll<HTMLElement>("[data-gap-mark]");
    // A marker takes over when it reaches the bottom of the viewport.
    starts = [0, ...Array.from(marks, m => m.getBoundingClientRect().top + window.scrollY - window.innerHeight)];
  };
  const emit = (y: number, max: number) => {
    let i = 0;
    while (i + 1 < starts.length && y >= starts[i + 1]) i++;
    const end = starts[i + 1] ?? max;
    onScene(i, end > starts[i] ? Math.min(1, Math.max(0, (y - starts[i]) / (end - starts[i]))) : 1);
  };
  return ScrollTrigger.create({
    start: 0,
    end: "max",
    onRefresh: self => { measure(); emit(self.scroll(), self.end); },
    onUpdate: self => emit(self.scroll(), self.end),
  });
}

/** Scroll offset that brings scene i's content into view. */
export function sceneTop(i: number, key: string) {
  if (i === 0) return 0;
  const el = beatEl(key);
  return el ? el.getBoundingClientRect().top + window.scrollY : 0;
}
