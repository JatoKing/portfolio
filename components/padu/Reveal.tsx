"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** Fades, lifts and de-blurs its children once they scroll into view. */
export function Reveal({
  children, delay = 0, className = "", style, as: Tag = "div",
}: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`pd-reveal ${visible ? "is-in" : ""} ${className}`}
      style={{ ...style, "--pd-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
