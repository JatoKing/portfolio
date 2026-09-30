"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { NAV, STADIUM_SRC } from "./data";

export function ProjectOutro() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, ({ desktop, compact }) => {
    if (!desktop && !compact) return;

    // The stadium opens from a narrow angled slice to full bleed as you arrive.
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".fy-outro__stage", start: "top bottom", end: "top top", scrub: 1 },
    })
      .from(".fy-outro__stage", {
        clipPath: desktop
          ? "polygon(22% 14%, 78% 0%, 78% 86%, 22% 100%)"
          : "polygon(8% 8%, 92% 0%, 92% 92%, 8% 100%)",
      }, 0)
      .from(".fy-outro__media", { scale: desktop ? 1.4 : 1.2 }, 0)
      .from(".fy-outro__title .fy-line > span", { yPercent: 110, stagger: 0.12 }, 0.35);

    if (desktop) {
      // Short hold: "every seat count" fills with gold while the stadium keeps drifting.
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".fy-outro__stage",
          start: "top top",
          end: () => `+=${window.innerHeight * 0.8}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
        .to(".fy-outro__fill", { clipPath: "inset(0% 0% 0% 0%)" }, 0)
        .fromTo(".fy-outro__media", { scale: 1, rotate: 0 }, { scale: 1.12, rotate: 3, immediateRender: false }, 0);
    }

    gsap.from(".fy-outro__link", {
      y: 40, autoAlpha: 0, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: ".fy-outro__nav", start: "top 95%", end: "top 70%", scrub: 1 },
    });
  });

  return (
    <section ref={root} className="fy-outro" aria-labelledby="fy-outro-title">
      <div className="fy-outro__stage">
        <div className="fy-outro__media" aria-hidden>
          <Image src={STADIUM_SRC} alt="" fill sizes="100vw" className="fy-outro__img" />
        </div>
        <div className="fy-outro__shade" aria-hidden />
        <h2 id="fy-outro-title" className="fy-display fy-outro__title">
          <span className="fy-line"><span>Built to make</span></span>
          <span className="fy-line fy-outro__emph">
            <span>
              Every seat count.
              <span className="fy-outro__fill" aria-hidden>Every seat count.</span>
            </span>
          </span>
        </h2>
      </div>

      <nav className="fy-outro__nav fy-wrap" aria-label="Project navigation">
        <Link href={NAV.prev.href} className="fy-outro__link fy-outro__link--prev">
          <span className="fy-outro__dir"><ArrowLeft size={16} /> Previous project</span>
          <span className="fy-display">{NAV.prev.label}</span>
        </Link>
        <Link href={NAV.home.href} className="fy-outro__link fy-outro__link--home">
          <span className="fy-outro__dir">Portfolio</span>
          <span className="fy-display">{NAV.home.label}</span>
        </Link>
        <Link href={NAV.next.href} className="fy-outro__link fy-outro__link--next">
          <span className="fy-outro__dir">Next project <ArrowRight size={16} /></span>
          <span className="fy-display">{NAV.next.label}</span>
        </Link>
      </nav>

      <p className="fy-outro__foot fy-wrap">
        <span>Smart Ticket System</span>
        <span>Final Year Project · UiTM Shah Alam · 2025</span>
      </p>
    </section>
  );
}
