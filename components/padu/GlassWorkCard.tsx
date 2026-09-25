"use client";
import { useEffect, useRef, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";

export interface GlassWorkCardProps {
  icon: string;
  idx: string;
  title: string;
  description: string;
  /** In-page anchor of the project detail, e.g. "#awam". */
  href: string;
  accent: string; // "r,g,b"
  internal?: boolean;
  onSelect?: (id: string) => void;
}

/**
 * Thin pane of glass for one PADU project. Tilts a few degrees toward the
 * pointer on fine-pointer devices; writes CSS variables directly so hover
 * never triggers a React re-render.
 */
export function GlassWorkCard({
  icon, idx, title, description, href, accent, internal, onSelect,
}: GlassWorkCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const tilt = useRef(false);
  const rect = useRef<DOMRect | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tilt.current = fine && !reduced;
  }, []);

  const onEnter = () => { if (tilt.current) rect.current = ref.current?.getBoundingClientRect() ?? null; };
  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const r = rect.current;
    if (!tilt.current || !r) return;
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    const s = e.currentTarget.style;
    s.setProperty("--tilt-y", `${((nx - 0.5) * 6).toFixed(2)}deg`); // ±3deg
    s.setProperty("--tilt-x", `${((0.5 - ny) * 4).toFixed(2)}deg`); // ±2deg
    s.setProperty("--px", `${(nx * 100).toFixed(1)}%`);
    s.setProperty("--py", `${(ny * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const s = ref.current?.style;
    if (!s) return;
    s.setProperty("--tilt-x", "0deg");
    s.setProperty("--tilt-y", "0deg");
    rect.current = null;
  };
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onSelect) return;
    e.preventDefault();
    onSelect(href.replace(/^#/, ""));
  };

  return (
    <a
      ref={ref}
      href={href}
      className="pd-glass pd-wcard"
      data-orbit-card=""
      aria-label={`View ${title}`}
      style={{ "--pd-acc": accent } as CSSProperties}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onClick}
    >
      <span className="pd-wcard-sheen" aria-hidden="true" />
      <div className="pd-wcard-top">
        <span className="pd-wcard-icon" aria-hidden="true">{icon}</span>
        <span className="pd-wcard-idx pd-mono">{idx}</span>
        <span className="pd-wcard-arrow" aria-hidden="true"><ArrowUpRight size={14} /></span>
      </div>
      <div>
        <div className="pd-wcard-title">{title}</div>
        <div className="pd-wcard-desc pd-mono">{description}</div>
      </div>
      <div className="pd-wcard-foot">
        <span className="pd-tag pd-tag--active">Active</span>
        {internal && <span className="pd-tag pd-tag--internal">🔒 Internal Use</span>}
      </div>
    </a>
  );
}
