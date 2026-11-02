"use client";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/components/motion/scroll-scene";

/**
 * Lenis smooth wheel scrolling, driven by GSAP's ticker so ScrollTrigger scrubs and pins read
 * the same scroll position Lenis just wrote.
 *
 * Each page gets a fresh instance, so leftover inertia never drags a newly opened page back
 * down. A layout effect, so the old instance is gone before RouteScroll resets to the top.
 * The home page is skipped: its frame sequence already smooths scroll on its own.
 * Touch stays native, and Lenis turns itself off under prefers-reduced-motion.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname === "/") return;
    const lenis = new Lenis({
      // Scrollable panels (PADU inspector, modal copy) keep their own wheel scrolling.
      allowNestedScroll: true,
      // A wheel something else already claimed (e.g. the ecosystem model's zoom) is left alone.
      virtualScroll: ({ event }) => !event.defaultPrevented,
    });
    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
