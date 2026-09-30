"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { SCREENSHOTS, SCREENSHOT_HINT, STADIUM_SRC, type Screenshot } from "./data";

const TOTAL = String(SCREENSHOTS.length).padStart(2, "0");
const pad = (n: number) => String(n + 1).padStart(2, "0");

function Chrome({ num }: { num: number }) {
  return (
    <div className="fy-chrome" aria-hidden>
      <span className="fy-chrome__dots"><i /><i /><i /></span>
      <span className="fy-chrome__url"><i />localhost:8000/smart-ticket</span>
      <span className="fy-chrome__num">#{num + 1}</span>
    </div>
  );
}

function Shot({ shot, sizes }: { shot: Screenshot; sizes: string }) {
  return (
    <>
      {shot.fit === "contain" && (
        <Image src={shot.src} alt="" fill sizes={sizes} className="fy-shot__backdrop" aria-hidden />
      )}
      <Image src={shot.src} alt={shot.alt} fill sizes={sizes} className={`fy-shot__img fy-shot__img--${shot.fit}`} />
    </>
  );
}

export function ProductShowcase({ onOpen }: { onOpen: (index: number) => void }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useScrollScene(root, ({ desktop, compact }, el) => {
    if (compact) {
      el.querySelectorAll<HTMLElement>(".fy-show__item").forEach(item => {
        gsap.timeline({ scrollTrigger: { trigger: item, start: "top 88%", end: "top 45%", scrub: 1 } })
          .from(item.querySelector(".fy-show__frame"), { y: 70, scale: 0.94, ease: "none" })
          .from(item.querySelectorAll(".fy-show__item-copy > *"), { autoAlpha: 0, y: 30, stagger: 0.1, ease: "none" }, 0.1);
      });
      return;
    }
    if (!desktop) return;

    const screens = el.querySelectorAll<HTMLElement>(".fy-show__screen");
    const texts = el.querySelectorAll<HTMLElement>(".fy-show__text");
    const bars = el.querySelectorAll<HTMLElement>(".fy-show__bars i");
    gsap.set(bars, { scaleX: i => (i === 0 ? 1 : 0) });

    // Arrival: the device rises out of the stadium slab as the section scrolls in.
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: 1 },
    })
      .from(".fy-show__device", { yPercent: 18, scale: 0.86, rotate: -2.5 }, 0)
      .from(".fy-show__slab", { clipPath: "polygon(30% 0%, 70% 0%, 60% 100%, 40% 100%)", scale: 1.2 }, 0)
      .from(".fy-show__head .fy-line > span", { yPercent: 110, stagger: 0.1 }, 0.2);

    // Timeline times at which each screen becomes "current", for the modal button + chrome.
    const switchAt: number[] = [];
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: () => `+=${window.innerHeight * 2.8}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: self => {
          const t = self.progress * (self.animation?.duration() ?? 0);
          const next = switchAt.filter(s => t >= s).length;
          setActive(prev => (prev === next ? prev : next));
        },
      },
    });

    tl.to({}, { duration: 0.5 });
    screens.forEach((screen, i) => {
      if (i === 0) return;
      const at = tl.duration();
      switchAt.push(at + 0.5);
      tl.to(screens[i - 1], { scale: 0.9, autoAlpha: 0.25, duration: 1 }, at)
        .fromTo(screen,
          { clipPath: "inset(100% 0% 0% 0%)", scale: 1.12 },
          { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1 }, at)
        .to(texts[i - 1], { autoAlpha: 0, y: -36, duration: 0.45 }, at)
        .fromTo(texts[i], { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.5 }, at + 0.45)
        .to(".fy-show__digits-track", { yPercent: (-100 / SCREENSHOTS.length) * i, duration: 0.8 }, at + 0.1)
        .to(bars[i], { scaleX: 1, duration: 0.9 }, at)
        .to({}, { duration: 0.6 });
    });
    tl.to(".fy-show__slab", { yPercent: -12, duration: tl.duration(), ease: "none" }, 0);
  });

  return (
    <section ref={root} className="fy-show" aria-labelledby="fy-show-title">
      {/* ── Desktop: one pinned device, scroll swaps the screen ── */}
      <div className="fy-show__stage">
        <div className="fy-show__slab" aria-hidden>
          <Image src={STADIUM_SRC} alt="" fill sizes="70vw" className="fy-show__slab-img" />
        </div>

        <div className="fy-show__layout fy-wrap">
          <div className="fy-show__copy">
            <p className="fy-eyebrow">Project Screenshots</p>
            <h2 id="fy-show-title" className="fy-display fy-show__head">
              <span className="fy-line"><span>See it in</span></span>
              <span className="fy-line"><span className="fy-gold">action.</span></span>
            </h2>

            <div className="fy-show__count" aria-live="polite">
              <span className="fy-show__digits" aria-hidden>
                <span className="fy-show__digits-track">
                  {SCREENSHOTS.map((s, i) => <span key={s.src}>{pad(i)}</span>)}
                </span>
              </span>
              <span className="fy-show__total" aria-hidden>/ {TOTAL}</span>
              <span className="fy-sr">Screen {active + 1} of {SCREENSHOTS.length}</span>
            </div>

            <div className="fy-show__texts">
              {SCREENSHOTS.map(s => (
                <div key={s.src} className="fy-show__text">
                  <h3 className="fy-display">{s.label}</h3>
                  <p className="fy-show__caption">{s.caption}</p>
                  <p className="fy-show__desc">{s.description}</p>
                </div>
              ))}
            </div>

            <button type="button" className="fy-btn" onClick={() => onOpen(active)}>
              <Maximize2 size={15} /> View full screen
            </button>
            <p className="fy-show__hint">{SCREENSHOT_HINT}</p>
          </div>

          <div className="fy-show__device">
            <Chrome num={active} />
            <div className="fy-show__screens">
              {SCREENSHOTS.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  className="fy-show__screen"
                  onClick={() => onOpen(i)}
                  tabIndex={i === active ? 0 : -1}
                  aria-label={`Open ${s.label} screenshot full screen`}
                >
                  <Shot shot={s} sizes="(min-width: 1024px) 60vw, 100vw" />
                </button>
              ))}
            </div>
            <div className="fy-show__bars" aria-hidden>
              {SCREENSHOTS.map(s => <span key={s.src}><i /></span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tablet / mobile / reduced motion: stacked sequence ── */}
      <div className="fy-show__list fy-wrap">
        <p className="fy-eyebrow">Project Screenshots</p>
        <h2 className="fy-display fy-show__head">
          <span className="fy-line"><span>See it in</span></span>
          <span className="fy-line"><span className="fy-gold">action.</span></span>
        </h2>
        <p className="fy-show__hint">{SCREENSHOT_HINT}</p>
        <ol className="fy-show__items">
          {SCREENSHOTS.map((s, i) => (
            <li key={s.src} className="fy-show__item">
              <button
                type="button"
                className="fy-show__frame"
                onClick={() => onOpen(i)}
                aria-label={`Open ${s.label} screenshot full screen`}
              >
                <Chrome num={i} />
                <span className="fy-show__frame-img">
                  <Shot shot={s} sizes="(min-width: 768px) 56vw, 100vw" />
                </span>
              </button>
              <div className="fy-show__item-copy">
                <p className="fy-show__item-count">{pad(i)} / {TOTAL}</p>
                <h3 className="fy-display">{s.label}</h3>
                <p className="fy-show__caption">{s.caption}</p>
                <p className="fy-show__desc">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
