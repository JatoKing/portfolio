"use client";

import {
  type CSSProperties, type FocusEvent, type PointerEvent, type RefObject,
  useEffect, useRef, useState,
} from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import type { PaduProject } from "./data";
import { ProjectDetailBody } from "./ProjectDetail";

/* Must match the immersive media query in padu.css. */
const IMMERSIVE = "(hover: hover) and (pointer: fine) and (min-width: 900px)";
/** Total vertical travel of the list driven by the cursor (px). */
const DRIFT = 72;
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

type Refs = { cursor: RefObject<HTMLDivElement | null>; list: RefObject<HTMLUListElement | null> };

/**
 * One requestAnimationFrame loop for the image follow, its tilt and the list
 * drift. It sleeps once everything settles, so an idle section costs nothing.
 */
function createMotion(refs: Refs) {
  const s = {
    enabled: false, reduced: false, visible: false, raf: 0, last: 0,
    tx: 0, ty: 0, x: 0, y: 0, rx: 0, ry: 0, listTarget: 0, list: 0,
  };

  const apply = () => {
    const cursor = refs.cursor.current, list = refs.list.current;
    if (cursor) {
      cursor.style.transform =
        `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) translate(-50%, -50%) perspective(900px) rotateX(${s.rx.toFixed(3)}deg) rotateY(${s.ry.toFixed(3)}deg)`;
    }
    if (list) list.style.transform = s.enabled && !s.reduced && s.list !== 0 ? `translate3d(0, ${s.list.toFixed(2)}px, 0)` : "";
  };

  function tick(now: number) {
    const dt = s.last ? Math.min(64, now - s.last) : 16;
    s.last = now;
    // Frame-rate independent exponential easing; `tau` is the time constant in ms.
    const ease = (tau: number) => (s.reduced ? 1 : 1 - Math.exp(-dt / tau));

    const px = s.x, py = s.y;
    s.x += (s.tx - s.x) * ease(95);
    s.y += (s.ty - s.y) * ease(95);
    // Tilt from the image's own velocity (px per 60 Hz frame), capped very low.
    const vx = ((s.x - px) / dt) * 16, vy = ((s.y - py) / dt) * 16;
    const targetRy = s.reduced ? 0 : clamp(vx * 0.3, -3, 3);
    const targetRx = s.reduced ? 0 : clamp(-vy * 0.22, -2, 2);
    s.ry += (targetRy - s.ry) * ease(140);
    s.rx += (targetRx - s.rx) * ease(140);
    s.list += (s.listTarget - s.list) * ease(420);
    if (Math.abs(s.list) < 0.05 && s.listTarget === 0) s.list = 0;
    apply();

    const moving = Math.abs(s.tx - s.x) > 0.1 || Math.abs(s.ty - s.y) > 0.1
      || Math.abs(s.rx) > 0.01 || Math.abs(s.ry) > 0.01 || Math.abs(s.listTarget - s.list) > 0.1;
    if (moving) s.raf = requestAnimationFrame(tick);
    else { s.raf = 0; s.last = 0; }
  }

  const kick = () => { if (!s.raf) s.raf = requestAnimationFrame(tick); };
  const stop = () => { cancelAnimationFrame(s.raf); s.raf = 0; s.last = 0; };
  /** Place the image at its target immediately (first appearance). */
  const snap = () => { s.x = s.tx; s.y = s.ty; s.rx = s.ry = 0; apply(); };

  return { s, apply, kick, stop, snap };
}

/**
 * The PADU projects as oversized names. Hovering a name reveals that
 * project's screenshot, which trails the cursor behind the type; the list
 * drifts gently with the cursor's height. Selecting a name expands the full
 * case study beneath it. Touch and narrow screens get a stacked list.
 */
export function ProjectShowcase({
  projects, openId, onToggle,
}: { projects: PaduProject[]; openId: string | null; onToggle: (id: string) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<ReturnType<typeof createMotion> | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const visible = active !== null && projects[active].imgs.length > 0;

  /* Track which interaction model applies, and react to changes live. */
  useEffect(() => {
    const motion = createMotion({ cursor: cursorRef, list: listRef });
    motionRef.current = motion;
    const immersive = window.matchMedia(IMMERSIVE);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      motion.s.enabled = immersive.matches;
      motion.s.reduced = reduced.matches;
      if (!motion.s.enabled || motion.s.reduced) motion.s.list = motion.s.listTarget = 0;
      motion.apply();
    };
    sync();
    immersive.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      immersive.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      motion.stop();
      motionRef.current = null;
    };
  }, []);

  /* Appear at the current target instead of flying in from the last spot. */
  useEffect(() => {
    const motion = motionRef.current;
    if (!motion) return;
    if (visible && !motion.s.visible) motion.snap();
    motion.s.visible = visible;
  }, [visible]);

  /* Reading an open case study: hold the list still. */
  useEffect(() => {
    const motion = motionRef.current;
    if (!motion || !openId) return;
    motion.s.listTarget = 0;
    motion.kick();
  }, [openId]);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const motion = motionRef.current, root = rootRef.current;
    if (!motion || !motion.s.enabled || event.pointerType === "touch" || !root) return;
    const { s } = motion;
    const r = root.getBoundingClientRect();
    s.tx = event.clientX - r.left;
    s.ty = event.clientY - r.top;
    if (!s.reduced && !openId) {
      // Top of the list: resting position. Bottom: drifted up.
      const ny = clamp((event.clientY - r.top) / r.height);
      s.listTarget = DRIFT / 2 - DRIFT * ny;
    }
    if (!s.visible) { s.x = s.tx; s.y = s.ty; }
    motion.kick();
  };

  const onPointerLeave = () => {
    setActive(null);
    const motion = motionRef.current;
    if (!motion) return;
    motion.s.listTarget = 0;
    motion.kick();
  };

  const onRowFocus = (index: number, event: FocusEvent<HTMLButtonElement>) => {
    const motion = motionRef.current, row = event.currentTarget, root = rootRef.current;
    // Keyboard only: a mouse click already positions the image at the cursor.
    if (!motion || !motion.s.enabled || !root || !row.matches(":focus-visible")) return;
    setActive(index);
    const r = root.getBoundingClientRect(), b = row.getBoundingClientRect();
    motion.s.tx = r.width * 0.68;
    motion.s.ty = b.top - r.top + b.height / 2;
    if (!motion.s.visible) { motion.s.x = motion.s.tx; motion.s.y = motion.s.ty; }
    motion.kick();
  };

  return (
    <div
      ref={rootRef}
      className={`pd-showcase${active !== null ? " has-active" : ""}${openId ? " has-open" : ""}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <ul ref={listRef} className="pd-showcase-list">
        {projects.map((p, index) => {
          const open = openId === p.id;
          return (
            <li key={p.id} id={p.id} className="pd-showcase-item" data-open={open || undefined} style={{ "--i": index } as CSSProperties}>
              <button
                type="button"
                className="pd-showcase-row"
                aria-expanded={open}
                aria-controls={`${p.id}-detail`}
                data-active={active === index || undefined}
                onClick={() => onToggle(p.id)}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                onFocus={event => onRowFocus(index, event)}
                onBlur={() => setActive(null)}
              >
                <span className="pd-showcase-title">{p.title}</span>
                <Plus className="pd-showcase-toggle" size={22} strokeWidth={1.25} aria-hidden="true" />
                {p.imgs[0] && (
                  <span className="pd-showcase-inline" aria-hidden="true">
                    <Image src={p.imgs[0]} alt="" fill sizes="(max-width: 900px) 92vw, 1px"
                      style={{ objectFit: p.imgFit ?? "cover" }} />
                  </span>
                )}
              </button>

              <div id={`${p.id}-detail`} className="pd-showcase-detail" role="region" aria-label={p.title} inert={!open}>
                <div className="pd-showcase-detail-inner">
                  <ProjectDetailBody proj={p} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div ref={cursorRef} className="pd-showcase-cursor" data-visible={visible || undefined} aria-hidden="true">
        <div className="pd-showcase-cursor-card">
          {projects.map((p, index) => p.imgs[0] && (
            <Image
              key={p.id}
              src={p.imgs[0]}
              alt=""
              fill
              sizes="520px"
              className="pd-showcase-cursor-img"
              data-active={active === index || undefined}
              style={{ objectFit: p.imgFit ?? "cover" }}
            />
          ))}
          <span className="pd-showcase-cursor-sheen" />
        </div>
      </div>
    </div>
  );
}
