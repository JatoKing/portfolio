"use client";
import { useRef } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";
import { SCREENSHOTS, SCREENS_COPY, pad, type Screenshot } from "./data";
import { Lines, SceneLabel, useReveal } from "./primitives";
import { focusAt, exitAt, posesAt, SCREEN_COUNT, type ReelMetrics } from "./reel";

const TOTAL = pad(SCREENSHOTS.length);

function Phone({ shot, index, onOpen, sizes }: { shot: Screenshot; index: number; onOpen: (i: number) => void; sizes: string }) {
  return (
    <button
      type="button"
      className="jk-phone"
      onClick={() => onOpen(index)}
      aria-label={`Open ${shot.label} screenshot full screen`}
    >
      <span className="jk-phone__screen">
        <Image src={shot.src} alt={shot.alt} fill sizes={sizes} className="jk-phone__img" />
      </span>
      <span className="jk-phone__island" aria-hidden />
    </button>
  );
}

function ShotCopy({ shot, index }: { shot: Screenshot; index: number }) {
  return (
    <>
      <p className="jk-label jk-shot__label">
        <span className="jk-label__num">{pad(index + 1)}</span>
        <span className="jk-label__slash" aria-hidden>/</span>
        <span>{shot.label}</span>
      </p>
      <h3 className="jk-h3">{shot.caption}</h3>
      <p className="jk-body">{shot.description}</p>
    </>
  );
}

/**
 * 06 / Experience in the lower valley. The eight screens slide in from all sides, take the
 * focal slot one at a time while the copy beside them follows, then clear away so the trail
 * leads on to the footprints. Poses come from reel.ts; this component only applies them.
 */
export function Experience({ onOpen }: { onOpen: (index: number) => void }) {
  const root = useRef<HTMLElement>(null);
  const active = useRef(0);
  useReveal(root);

  useScrollScene(root, ({ desktop, reduce }, el) => {
    if (reduce) return;
    const stage = el.querySelector<HTMLElement>(".jk-exp__stage");
    const reel = el.querySelector<HTMLElement>(".jk-reel");
    const copy = el.querySelector<HTMLElement>(".jk-exp__copy");
    const fill = el.querySelector<HTMLElement>(".jk-progress__fill");
    const now = el.querySelector<HTMLElement>(".jk-progress__now");
    const phones = gsap.utils.toArray<HTMLElement>(".jk-reel .jk-phone", el);
    const texts = gsap.utils.toArray<HTMLElement>(".jk-exp__text", el);
    if (!stage || !reel || !copy || !fill || !now) return;

    let metrics: ReelMetrics;
    const measure = () => {
      const vh = stage.clientHeight;
      const navH = document.querySelector<HTMLElement>(".jk-nav")?.offsetHeight ?? 56;
      const stripH = document.querySelector<HTMLElement>(".jk-index")?.offsetHeight ?? 44;
      if (!desktop) {
        // Fit the phone in focus between the nav and the copy panel, however short the screen.
        reel.style.removeProperty("top");
        stage.style.removeProperty("--pw");
        // The copy sits under the reel, or beside it on landscape phones.
        const beside = copy.offsetLeft + copy.offsetWidth < stage.clientWidth * 0.7;
        const top = navH + 10;
        const bottom = beside ? vh - stripH - 10 : copy.offsetTop - 12;
        const fit = ((bottom - top) * 0.94 - 14) / 2.164 + 14;
        if (fit < phones[0].offsetWidth) stage.style.setProperty("--pw", `${Math.max(96, fit).toFixed(1)}px`);
        reel.style.top = `${((top + bottom) / 2).toFixed(1)}px`;
      }
      const cy = reel.offsetTop;
      metrics = {
        vw: stage.clientWidth,
        vh,
        pw: phones[0].offsetWidth,
        ph: phones[0].offsetHeight,
        layout: desktop ? "ring" : "reel",
        reach: window.innerWidth >= 768 ? 2.4 : 1.7,
        room: Math.min(cy - navH, vh - stripH - cy) - 10,
      };
    };

    const state = { p: 0 };
    let shown = -1;
    const render = () => {
      const { p } = state;
      const f = focusAt(p);
      const exit = exitAt(p);

      posesAt(p, metrics).forEach((pose, k) => {
        const s = phones[k].style;
        s.transform = `translate3d(${pose.x.toFixed(1)}px, ${pose.y.toFixed(1)}px, 0) rotate(${pose.rotate.toFixed(2)}deg) scale(${pose.scale.toFixed(4)})`;
        s.opacity = pose.opacity.toFixed(3);
        s.visibility = pose.opacity < 0.01 ? "hidden" : "visible";
        s.zIndex = String(pose.z);
        s.setProperty("--focus", pose.focus.toFixed(3));
      });

      // Copy for the screen in focus: cross-fades on the hand-over, drifting the way the reel moves.
      texts.forEach((t, k) => {
        const o = Math.max(0, 1 - Math.abs(f - k) * 2.4);
        t.style.opacity = o.toFixed(3);
        t.style.visibility = o < 0.01 ? "hidden" : "visible";
        t.style.transform = `translate3d(0, ${((k - f) * 18).toFixed(1)}px, 0)`;
      });
      fill.style.transform = `scaleX(${(f / (SCREEN_COUNT - 1)).toFixed(4)})`;
      copy.style.opacity = (1 - exit).toFixed(3);
      copy.style.transform = `translate3d(0, ${(-exit * 24).toFixed(1)}px, 0)`;

      const i = Math.round(f);
      if (i !== shown) {
        shown = i;
        active.current = i;
        now.textContent = pad(i + 1);
      }
    };

    measure();
    render();
    gsap.to(state, {
      p: 1,
      ease: "none",
      onUpdate: render,
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onRefresh: () => { measure(); render(); },
      },
    });

    return () => {
      [...phones, ...texts, copy, fill, reel].forEach(n => n.removeAttribute("style"));
      stage.style.removeProperty("--pw");
      now.textContent = "01";
    };
  });

  return (
    <section ref={root} className="jk-sec jk-exp" data-beat="experience" aria-label={SCREENS_COPY.title}>
      {/* Motion: one pinned stage, scroll drives the reel */}
      <div className="jk-exp__stage">
        <div className="jk-exp__frame">
          <div className="jk-panel jk-exp__copy">
            <header data-reveal-group>
              <SceneLabel scene={5} title={SCREENS_COPY.label} />
              <p className="jk-kicker jk-sub" data-reveal>{SCREENS_COPY.title}</p>
              <h2 className="jk-h2 jk-exp__heading"><Lines lines={SCREENS_COPY.heading} /></h2>
            </header>
            <div className="jk-exp__texts">
              {SCREENSHOTS.map((s, i) => (
                <div key={s.src} className="jk-exp__text"><ShotCopy shot={s} index={i} /></div>
              ))}
            </div>
            <div className="jk-progress" aria-hidden>
              <span className="jk-progress__now">01</span>
              <span className="jk-progress__line"><i className="jk-progress__fill" /></span>
              <span>{TOTAL}</span>
            </div>
            <div className="jk-exp__actions">
              <button type="button" className="jk-btn" onClick={() => onOpen(active.current)}>
                <Maximize2 size={13} /> {SCREENS_COPY.open}
              </button>
              <p className="jk-hint">{SCREENS_COPY.hint}</p>
            </div>
          </div>

          <div className="jk-reel">
            {SCREENSHOTS.map((s, i) => (
              <Phone key={s.src} shot={s} index={i} onOpen={onOpen} sizes="(min-width: 1024px) 260px, 46vw" />
            ))}
          </div>
        </div>
      </div>

      {/* Reduced motion: the same eight screens, stacked */}
      <div className="jk-wrap jk-exp__list">
        <div className="jk-panel jk-exp__intro">
          <header data-reveal-group>
            <SceneLabel scene={5} title={SCREENS_COPY.label} />
            <p className="jk-kicker jk-sub">{SCREENS_COPY.title}</p>
            <h2 className="jk-h2"><Lines lines={SCREENS_COPY.heading} /></h2>
          </header>
          <p className="jk-hint">{SCREENS_COPY.hint}</p>
        </div>
        <ol className="jk-exp__items">
          {SCREENSHOTS.map((s, i) => (
            <li key={s.src} className="jk-exp__item">
              <Phone shot={s} index={i} onOpen={onOpen} sizes="(min-width: 640px) 260px, 62vw" />
              <div className="jk-panel jk-exp__item-copy"><ShotCopy shot={s} index={i} /></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
