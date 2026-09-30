"use client";
import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { gsap, ScrollTrigger, useScrollScene } from "@/components/motion/scroll-scene";
import { NAV } from "./data";

export function TopNav() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, (_, el) => {
    ScrollTrigger.create({
      start: 60,
      end: "max",
      onToggle: self => el.classList.toggle("is-solid", self.isActive),
    });
    gsap.to(".fy-nav__progress", {
      scaleX: 1, ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });
  });

  return (
    <nav ref={root} className="fy-nav" aria-label="Site">
      <Link href={NAV.home.href} className="fy-nav__back">
        <ArrowLeft size={14} /> {NAV.home.label}
      </Link>
      <span className="fy-nav__tag">
        <span className="fy-dot" aria-hidden /> FYP · 2025
      </span>
      <span className="fy-nav__progress" aria-hidden />
    </nav>
  );
}
