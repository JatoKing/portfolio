"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  BackgroundEffects, HeroSection, ProjectShowcase, Reveal, ScrollProgress, TechMarquee,
  PROJECTS, STACK_TOP, STACK_BOT,
} from "@/components/padu";
import "@/components/padu/padu.css";

export default function PaduPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  /* Hero cards open the matching case study, then bring it into view. */
  const navTo = (id: string) => {
    setOpenId(id);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }));
  };
  const toggle = (id: string) => setOpenId(current => (current === id ? null : id));

  return (
    <div className="pd">
      <BackgroundEffects />
      <ScrollProgress />

      {/* Next case study (wide screens) */}
      <Link href="/projects/jejak" className="pd-glass pd-glass--interactive pd-sidenav" aria-label="Next project: JEJAK">
        <ArrowRight size={22} />
        <span>JEJAK</span>
      </Link>

      <HeroSection projects={PROJECTS} onNav={navTo} />

      {/* ══ STACK ══ */}
      <TechMarquee top={STACK_TOP} bottom={STACK_BOT} />

      {/* ══ PROJECTS ══ */}
      <section className="pd-projects" aria-labelledby="pd-projects-heading">
        <div className="pd-container">
          <div className="pd-projects-head">
            <h2 id="pd-projects-heading" className="pd-eyebrow">Selected Projects</h2>
            <span className="pd-mono">{PROJECTS.length} Projects · 2025</span>
          </div>
          <Reveal>
            <ProjectShowcase projects={PROJECTS} openId={openId} onToggle={toggle} />
          </Reveal>
        </div>
      </section>

      {/* Next case study (smaller screens) */}
      <div className="pd-footnav">
        <Link href="/projects/jejak" className="pd-pill">
          JEJAK <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
