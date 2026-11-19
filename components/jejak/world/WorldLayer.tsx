"use client";
import { useEffect, useRef } from "react";
import { gsap, MOTION, ScrollTrigger } from "@/components/motion/scroll-scene";
import { SCENES } from "../data";

/*
 * The fixed 3D layer behind the content. Scroll position becomes σ, the
 * continuous stage number the world is drawn at:
 *
 *   inside a section   σ drifts a little around its stage (i − 0.14 … i + 0.14),
 *                      so the hiker keeps walking slowly while you read
 *   between sections   σ travels the rest of the way to the next stage
 *   the ending         σ runs from 7 to 8: evening light, the whole trail drawn
 *
 * Every scrolled pixel also turns the hiker's stride. Three.js loads after
 * first paint; without WebGL the soft sky gradient alone stays behind the copy.
 */

const STRIDE_PX = 260;
const HOLD = 0.14;

export function WorldLayer() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const root = el?.closest<HTMLElement>(".jk");
    if (!el || !root) return;
    let live = true;
    let cleanup = () => {};

    import("./world").then(({ createWorld }) => {
      if (!live) return;
      const reduce = window.matchMedia(MOTION.reduce);
      const lowPower = window.matchMedia("(max-width: 767.98px)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;
      let world: ReturnType<typeof createWorld>;
      try {
        world = createWorld(el, lowPower);
      } catch (error) {
        console.warn("JEJAK: no WebGL, the sky stays empty.", error);
        return;
      }

      // Scroll anchors [y, σ], measured from the sections themselves.
      let anchors: [number, number][] = [[0, 0]];
      const measure = () => {
        const vh = window.innerHeight;
        const max = document.documentElement.scrollHeight - vh;
        const top = (n: Element) => n.getBoundingClientRect().top + window.scrollY;
        const list: [number, number][] = [[0, 0]];
        SCENES.forEach((s, i) => {
          const beat = document.querySelector(`[data-beat="${s.key}"]`);
          if (!beat) return;
          const t = top(beat);
          const b = t + beat.getBoundingClientRect().height;
          if (i > 0) list.push([Math.max(0, t - vh * 0.35), i - HOLD]);
          list.push([Math.max(0, b - vh * 0.65), i + HOLD]);
        });
        const ending = document.querySelector(`[data-beat="ending"]`);
        if (ending) list.push([Math.max(0, top(ending) - vh * 0.6), 7.3]);
        list.push([max, 8]);
        // Keep it monotonic whatever the layout does.
        for (let i = 1; i < list.length; i++) list[i][0] = Math.max(list[i][0], list[i - 1][0] + 1);
        anchors = list;
        world.resize();
        snap = true;
      };
      const sigmaAt = (y: number) => {
        if (y <= anchors[0][0]) return anchors[0][1];
        for (let i = 1; i < anchors.length; i++) {
          const [y1, s1] = anchors[i];
          if (y <= y1) {
            const [y0, s0] = anchors[i - 1];
            return s0 + ((s1 - s0) * (y - y0)) / (y1 - y0);
          }
        }
        return anchors[anchors.length - 1][1];
      };

      let lastY = window.scrollY;
      let speed = 0;
      let phase = 0;
      let snap = true;
      let sky = "";

      const tick = (time: number, delta: number) => {
        const y = window.scrollY;
        const dy = y - lastY;
        lastY = y;
        const dt = Math.min(0.1, Math.max(0.001, delta / 1000));
        const still = reduce.matches;
        const sigma = sigmaAt(y);
        // Strides fade in as scrolling starts and out as it stops; no walking at the summit.
        const gait = 1 - Math.max(0, Math.min(1, (sigma - 6.7) / 0.3));
        const target = still ? 0 : Math.min(1, Math.abs(dy) / dt / 600) * gait;
        speed += (target - speed) * Math.min(1, dt * (target > speed ? 9 : 4));
        if (!still) phase += (Math.abs(dy) / STRIDE_PX) * Math.PI * 2 * gait;
        if (speed < 0.02) phase += (Math.round(phase / Math.PI) * Math.PI - phase) * Math.min(1, dt * 6);

        const out = world.update({ sigma, stride: speed, phase, breath: still ? 0 : time, time: still ? 0 : time, dt, snap: snap || still });
        snap = false;
        const key = out.top + out.horizon;
        if (key !== sky) {
          sky = key;
          root.style.setProperty("--jk-sky-top", out.top);
          root.style.setProperty("--jk-sky-horizon", out.horizon);
        }
      };

      const onRefresh = () => measure();
      ScrollTrigger.addEventListener("refresh", onRefresh);
      window.addEventListener("resize", measure);
      measure();
      gsap.ticker.add(tick);
      el.classList.add("is-ready");

      cleanup = () => {
        gsap.ticker.remove(tick);
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        window.removeEventListener("resize", measure);
        world.dispose();
      };
    });

    return () => {
      live = false;
      cleanup();
    };
  }, []);

  return <canvas ref={canvas} className="jk-world" aria-hidden />;
}
