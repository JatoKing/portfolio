"use client";
import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* Back/forward fire popstate just before the router renders the restored page. */
let lastPop = -Infinity;
if (typeof window !== "undefined") window.addEventListener("popstate", () => { lastPop = performance.now(); });

/**
 * Start every newly opened page at the top.
 *
 * Next.js scrolls to the top after a link navigation, but the scroll-driven pages create their
 * ScrollTriggers first. Those record the previous page's scroll position and restore it after
 * measuring their pins, so a case study could open halfway down. Rendered before the page in
 * the root layout, this layout effect runs before the page's own, so every trigger measures
 * from the top. The first load (browser restoration on refresh) and back/forward (router
 * restoration) are left alone.
 */
export function RouteScroll() {
  const pathname = usePathname();
  const first = useRef(true);

  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    if (performance.now() - lastPop < 1000) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
