"use client";
import { useEffect, useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/*
 * Breakpoints shared by every section. `desktop` gets the pinned, scrubbed
 * sequences; `compact` gets lighter, un-pinned motion; `reduce` gets none.
 * Keep these in sync with the media queries in fyp.css.
 */
export const MOTION = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  compact: "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const;

export type MotionConditions = { desktop: boolean; compact: boolean; reduce: boolean };

/**
 * Runs `build` inside gsap.matchMedia(), with selector text scoped to `scope`.
 * Everything created in `build` is reverted when a breakpoint flips or the
 * component unmounts.
 */
export function useScrollScene<T extends Element>(
  scope: RefObject<T | null>,
  build: (conditions: MotionConditions, root: T) => void | (() => void),
) {
  useIsoLayoutEffect(() => {
    const root = scope.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION, ctx => build(ctx.conditions as MotionConditions, root), root);
    return () => mm.revert();
    // Scenes are built once per mount; breakpoint changes are handled by matchMedia.
  }, []);
}
