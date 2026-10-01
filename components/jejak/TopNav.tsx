"use client";
import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ScrollTrigger, useScrollScene } from "@/components/motion/scroll-scene";
import { NAV } from "./data";

export function TopNav() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, (_, el) => {
    // Not onToggle: a trigger ending at "max" deactivates at the very bottom of the page.
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: self => el.classList.toggle("is-solid", self.scroll() > 60),
      onRefresh: self => el.classList.toggle("is-solid", self.scroll() > 60),
    });
  });

  return (
    <nav ref={root} className="jk-nav" aria-label="Site">
      <Link href={NAV.home.href} className="jk-nav__back">
        <ArrowLeft size={14} /> <span>{NAV.home.label}</span>
      </Link>
      <span className="jk-nav__rule" aria-hidden />
      <div className="jk-nav__projects">
        <Link href={NAV.prev.href} aria-label={`Previous project: ${NAV.prev.label}`}>
          <ArrowLeft size={12} /> {NAV.prev.label}
        </Link>
        <span className="jk-nav__here" aria-current="page">JEJAK</span>
        <Link href={NAV.next.href} aria-label={`Next project: ${NAV.next.label}`}>
          {NAV.next.label} <ArrowRight size={12} />
        </Link>
      </div>
      <span className="jk-nav__rule jk-nav__rule--wide" aria-hidden />
      <span className="jk-nav__tag">
        <span className="jk-dot" aria-hidden /> {NAV.tag}
      </span>
    </nav>
  );
}
