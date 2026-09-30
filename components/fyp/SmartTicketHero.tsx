"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { HERO_INTRO, HERO_STATS, NAV, STADIUM_SRC } from "./data";

const LINES = ["Smart", "Ticket", "System"];

/* The title is rendered twice: a solid copy that sits *behind* the lit pitch
   layer and an outline copy on top, so the words read as sitting inside the bowl. */
function Title({ variant }: { variant: "solid" | "outline" }) {
  const Tag = variant === "solid" ? "h1" : "div";
  return (
    <Tag
      className={`fy-hero__title fy-hero__title--${variant}`}
      aria-hidden={variant === "outline" || undefined}
      id={variant === "solid" ? "fy-hero-title" : undefined}
    >
      {LINES.map((word, i) => (
        <span key={word} className={`fy-hero__line fy-hero__line--${i + 1}`}>
          <span>{word}</span>
        </span>
      ))}
    </Tag>
  );
}

function StadiumLayer({ pitch }: { pitch?: boolean }) {
  return (
    <div className={`fy-hero__media${pitch ? " fy-hero__media--pitch" : ""}`} aria-hidden>
      <div className="fy-hero__frame">
        <Image
          src={STADIUM_SRC}
          alt=""
          fill
          preload
          sizes="(orientation: portrait) 180vh, 100vw"
          className="fy-hero__img"
        />
      </div>
    </div>
  );
}

export function SmartTicketHero() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, ({ desktop, compact }) => {
    if (!desktop && !compact) return;

    // Title lines rise in once on load.
    gsap.from(".fy-hero__line > span", {
      yPercent: 110, duration: 1.2, ease: "power4.out", stagger: 0.09, delay: 0.15,
    });
    gsap.from(".fy-hero__top > *", {
      autoAlpha: 0, y: -12, duration: 0.8, ease: "power2.out", stagger: 0.08, delay: 0.6,
    });

    if (desktop) {
      gsap.set(".fy-hero__intro, .fy-hero__stat", { autoAlpha: 0, y: 48 });

      // Entering the stadium: zoom toward the pitch, floodlight spreads, info comes up.
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".fy-hero__stage",
          start: "top top",
          end: () => `+=${window.innerHeight * 1.7}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
        .to(".fy-hero__media", { scale: 1.45, duration: 1 }, 0)
        .to(".fy-hero__media--pitch .fy-hero__frame", {
          clipPath: "ellipse(78% 96% at 49.8% 49.2%)", duration: 0.7, ease: "power1.in",
        }, 0.05)
        .to(".fy-hero__title", { yPercent: -22, scale: 0.86, duration: 0.9 }, 0)
        .to(".fy-hero__line--1", { xPercent: -7, duration: 0.8 }, 0)
        .to(".fy-hero__line--3", { xPercent: 7, duration: 0.8 }, 0)
        .to(".fy-hero__cue", { autoAlpha: 0, duration: 0.1 }, 0)
        .to(".fy-hero__shade", { opacity: 0.66, duration: 0.5 }, 0.3)
        .to(".fy-hero__intro", { autoAlpha: 1, y: 0, duration: 0.22 }, 0.4)
        .to(".fy-hero__stat", { autoAlpha: 1, y: 0, duration: 0.22, stagger: 0.07 }, 0.48)
        .to(".fy-hero__stage", {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 82%, 0% 100%)", duration: 0.25,
        }, 0.78)
        // Lift the match info clear of the incoming diagonal.
        .to(".fy-hero__bottom", { y: () => -window.innerHeight * 0.16, duration: 0.25 }, 0.78);
    }

    if (compact) {
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".fy-hero__stage", start: "top top", end: "bottom top", scrub: 0.6 },
      })
        .to(".fy-hero__media", { scale: 1.15 }, 0)
        .to(".fy-hero__media--pitch .fy-hero__frame", { clipPath: "ellipse(40% 52% at 49.8% 49.2%)" }, 0)
        .to(".fy-hero__title", { yPercent: -12 }, 0)
        .to(".fy-hero__shade", { opacity: 0.45 }, 0);
    }
  });

  return (
    <section ref={root} className="fy-hero" aria-labelledby="fy-hero-title">
      <div className="fy-hero__stage">
        <StadiumLayer />
        <Title variant="solid" />
        <StadiumLayer pitch />
        <div className="fy-hero__shade" aria-hidden />
        <Title variant="outline" />

        <div className="fy-hero__top fy-wrap">
          <p className="fy-eyebrow"><span className="fy-dot" /> Final Year Project — Grade A</p>
          <p className="fy-eyebrow fy-eyebrow--muted">Bukit Jalil National Stadium</p>
        </div>

        <div className="fy-hero__bottom fy-wrap">
          <p className="fy-hero__intro">{HERO_INTRO}</p>
          <dl className="fy-hero__stats">
            {HERO_STATS.map(s => (
              <div key={s.label} className="fy-hero__stat">
                <dt>{s.label}</dt>
                <dd>{s.num}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Link href={NAV.prev.href} className="fy-sidelink fy-sidelink--prev" aria-label={`Previous project: ${NAV.prev.label}`}>
          <ArrowLeft size={20} />
          <span>{NAV.prev.label}</span>
        </Link>
        <Link href={NAV.next.href} className="fy-sidelink fy-sidelink--next" aria-label={`Next project: ${NAV.next.label}`}>
          <ArrowRight size={20} />
          <span>{NAV.next.label}</span>
        </Link>

        <div className="fy-hero__cue" aria-hidden>
          <span className="fy-hero__cue-line" />
          Scroll to enter the stadium
        </div>
      </div>
    </section>
  );
}
