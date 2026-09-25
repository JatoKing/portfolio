"use client";
import { useEffect, useState, type CSSProperties, type RefObject } from "react";

interface Link { d: string; x1: number; y1: number; x2: number; y2: number; dot: { x: number; y: number } }

/** Layout position inside `root`, ignoring transforms (float, parallax, reveal). */
function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let x = 0, y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft; y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

function cubic(t: number, a: number, b: number, c: number, d: number) {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

/**
 * Faint curves from the PADU core to each floating card. Measured from
 * resting layout (only on resize), so animation never triggers work here.
 * Lines fade out before reaching the cards, hiding any drift from parallax.
 */
export function EcosystemLinks({ rootRef }: { rootRef: RefObject<HTMLElement | null> }) {
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    let raf = 0;

    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const core = root.querySelector<HTMLElement>("[data-orbit-core]");
        if (!mq.matches || !core) { setLinks([]); return; }
        const c = offsetWithin(core, root);
        const cx = c.x + core.offsetWidth / 2;
        const cy = c.y + core.offsetHeight / 2;
        const radius = core.offsetWidth * 0.3;

        const plat = root.querySelector<HTMLElement>("[data-orbit-platform]");
        const pl = plat ? offsetWithin(plat, root) : null;
        // The platform is a square tilted flat; its rim sits at 44% of its width.
        const rim = plat && pl ? { y: pl.y + plat.offsetHeight / 2, r: plat.offsetWidth * 0.44 } : null;

        const next: Link[] = [];
        root.querySelectorAll<HTMLElement>("[data-orbit-card]").forEach((card) => {
          const b = offsetWithin(card, root);
          const w = card.offsetWidth, h = card.offsetHeight;
          const mid = b.x + w / 2;
          // The centred card rests on the platform itself; it needs no line.
          if (Math.abs(mid - cx) < 60) return;
          const left = mid < cx;

          // End short of the card's inner edge.
          const ex = left ? b.x + w + 14 : b.x - 14;
          const ey = b.y + h / 2;

          // Upper cards connect to the object; lower cards to the platform rim.
          let sx: number, sy: number;
          if (rim && ey > cy + core.offsetHeight * 0.25) {
            sx = cx + (left ? -rim.r : rim.r) * 0.86;
            sy = rim.y;
          } else {
            const ang = Math.atan2(ey - cy, ex - cx);
            sx = cx + Math.cos(ang) * radius;
            sy = cy + Math.sin(ang) * radius;
          }
          const c1x = sx + (ex - sx) * 0.5, c1y = sy, c2x = c1x, c2y = ey;

          next.push({
            d: `M ${sx} ${sy} C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`,
            x1: sx, y1: sy, x2: ex, y2: ey,
            dot: { x: cubic(0.42, sx, c1x, c2x, ex), y: cubic(0.42, sy, c1y, c2y, ey) },
          });
        });
        setLinks(next);
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    mq.addEventListener("change", measure);
    document.fonts?.ready.then(measure);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); mq.removeEventListener("change", measure); };
  }, [rootRef]);

  if (!links.length) return null;

  return (
    <svg className="pd-orbit-links" aria-hidden="true">
      <defs>
        {links.map((l, i) => (
          <linearGradient key={i} id={`pd-link-${i}`} gradientUnits="userSpaceOnUse" x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}>
            <stop offset="0" stopColor="#8fb6ff" stopOpacity="0.45" />
            <stop offset="0.65" stopColor="#8fb6ff" stopOpacity="0.14" />
            <stop offset="1" stopColor="#8fb6ff" stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {links.map((l, i) => (
        <g key={i}>
          <path d={l.d} stroke={`url(#pd-link-${i})`} />
          <circle cx={l.dot.x} cy={l.dot.y} r="1.6" style={{ "--d": `${i * -1.1}s` } as CSSProperties} />
        </g>
      ))}
    </svg>
  );
}
