"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import "./waterfall.css";

export function WaterfallPage() {
  const video = useRef<HTMLVideoElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const film = video.current;
    if (!film || !mount.current) return;
    let cancelled = false;
    let scene: ReturnType<typeof import("./waterfall-scene").createWaterfallScene> | undefined;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      scene?.setPaused(motion.matches || document.hidden);
      if (motion.matches || document.hidden) film.pause();
      else void film.play().catch(() => { /* The original video poster remains visible when autoplay is blocked. */ });
    };
    film.muted = true;
    syncPlayback();
    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    import("./waterfall-scene").then(({ createWaterfallScene }) => {
      if (cancelled || !mount.current) return;
      scene = createWaterfallScene(mount.current, film);
      syncPlayback();
      setReady(true);
    }).catch((error: unknown) => console.warn("Using the waterfall scene’s static lettering.", error));
    return () => {
      cancelled = true; film.pause();
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      scene?.dispose();
    };
  }, []);

  return (
    <main className={`waterfall-page${ready ? " is-ready" : ""}`} aria-labelledby="waterfall-title">
      <h1 id="waterfall-title" className="sr-only">Error 404 — Page not found</h1>
      <video ref={video} className="waterfall-video" src="/video/waterfallanimation.mp4" poster="/video/waterfall-poster.webp" muted loop playsInline preload="auto" aria-hidden="true" />
      <div className="waterfall-lettering-poster" aria-hidden="true" />
      <div ref={mount} className="waterfall-render" aria-hidden="true" />
      <Link href="/" className="waterfall-home"><span>Back to Portfolio</span><ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" /></Link>
    </main>
  );
}
