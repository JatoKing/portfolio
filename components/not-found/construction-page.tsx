"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./construction.css";

export function ConstructionPage() {
  const mount = useRef<HTMLDivElement>(null);
  const poolLink = useRef<HTMLAnchorElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let scene: ReturnType<typeof import("./construction-scene").createConstructionScene> | undefined;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => scene?.setPaused(motion.matches);
    motion.addEventListener("change", syncMotion);
    import("./construction-scene").then(({ createConstructionScene }) => {
      if (cancelled || !mount.current || !poolLink.current) return;
      scene = createConstructionScene(mount.current, poolLink.current, motion.matches);
      setReady(true);
    }).catch((error: unknown) => {
      console.warn("The construction scene is using its static fallback.", error);
    });
    return () => {
      cancelled = true;
      motion.removeEventListener("change", syncMotion);
      scene?.dispose();
    };
  }, []);

  return (
    <main className={`construction-page${ready ? " is-ready" : ""}`} aria-labelledby="construction-title">
      <h1 id="construction-title" className="sr-only">Error 404 — Page not found</h1>
      <div className="construction-plate" aria-hidden="true" />
      <div ref={mount} className="construction-canvas" aria-hidden="true" />
      <Link href="/" ref={poolLink} className="construction-pool-link">
        <span className="sr-only">Back to Portfolio</span>
      </Link>
    </main>
  );
}
