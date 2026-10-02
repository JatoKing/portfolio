"use client";
import { useEffect, useRef, type RefObject, type SVGProps } from "react";
import { gsap, useScrollScene } from "@/components/motion/scroll-scene";

/*
 * P, A, D and U as four solid 3D letters, coloured after the PADU logo: P, D and U in the
 * brand's deep navy, A as the accent with its gold and red. Every coloured section keeps
 * its colour through its full depth, not just on the face.
 *
 * Each letter is a filled outline with flat ends and slightly softened corners. Its depth
 * is drawn inside one SVG: a stack of offset copies darkening away from the face, then a
 * coated face with a crisp bevel and a restrained reflection, like polished acrylic
 * signage. One painted layer per letter, moved with flat 2D transforms only:
 * perspective-tilted layers render with jagged edges in Chrome, and the drawn extrusion
 * already carries the depth.
 * The letters float above a soft glass stage. The hero opens wide: the row starts level
 * with the first row of project cards, letters spaced apart, cards pushed out, and it all
 * converges onto today's layout as the hero scrolls (useAssembly). Each letter's own float
 * runs on inner layers, so the two never fight. Placement, size,
 * tilt and float for every letter (and the stage) live in padu.css, so the cluster can
 * be re-arranged per breakpoint without touching this file.
 */

/* PADU logo palette, each a gentle ramp across the face from its lit side. */
const TONES = {
  navy: ["#2c4c9f", "#183379", "#122a68", "#0c2154"],
  gold: ["#ffe17a", "#ffd23f", "#ffc928", "#efb11a"],
  red: ["#ff5e55", "#ee2f31", "#e52329", "#c91d24"],
} as const;
type Tone = keyof typeof TONES;
const TONE_STOPS = [0, 0.3, 0.62, 1];
/** Restrained light each colour throws around itself. */
const GLOW: Record<Tone, string> = { navy: "#3a64e0", gold: "#ffc928", red: "#e52329" };
/** Extrusion of each colour, from the far back up to just behind the face (r, g, b). */
const SIDES: Record<Tone, readonly [readonly number[], readonly number[]]> = {
  navy: [[6, 18, 52], [30, 58, 132]],
  gold: [[196, 136, 6], [238, 180, 26]],
  red: [[150, 18, 26], [210, 34, 42]],
};
/** Faint rim along the far edge of the extrusion. */
const BACK_RIM: Record<Tone, string> = { navy: "#5f82dc", gold: "#ffd76a", red: "#ff8278" };

interface LetterDef {
  key: "p" | "a" | "d" | "u";
  /** Filled outline in a 0–100 box (even-odd, so counters are holes). */
  glyph: string;
  /** Coloured regions that partition the letter, as polygons in the same box; the face
   *  and the depth are both cut by them. Defaults to the whole letter in navy. */
  sections?: { tone: Tone; region: string }[];
  /** Thin seams where one section passes in front of another. */
  seams?: string;
  light: readonly [number, number, number, number];
  depth: readonly [number, number];
}

const LETTERS: LetterDef[] = [
  {
    key: "p",
    glyph: "M17 7 Q17 4 20 4 H52 A31 31 0 0 1 52 66 H39 V95 Q39 98 36 98 H20 Q17 98 17 95 Z M39 26 V44 H52 A9 9 0 0 0 52 26 Z",
    light: [8, 0, 92, 100],
    // One camera, a little above the middle of the row: sides face inward, tops show.
    depth: [10, -7],
  },
  {
    key: "d",
    glyph: "M12 7 Q12 4 15 4 H41 C72 4 88 24 88 51 C88 78 72 98 41 98 H15 Q12 98 12 95 Z M34 26 V76 H41 C57 76 66 65 66 51 C66 37 57 26 41 26 Z",
    light: [96, 0, 8, 100],
    depth: [-6, -9],
  },
  {
    key: "a",
    glyph: "M5 98 Q2 98 3.1 95.2 L37.9 6.8 Q39 4 42 4 H58 Q61 4 62.1 6.8 L96.9 95.2 Q98 98 95 98 H78 Q75 98 73.9 95.2 L67.9 80 H32.1 L26.1 95.2 Q25 98 22 98 Z M50 34.5 L60 60 H40 Z",
    // Navy right leg. The left leg is split halfway, square across the leg: red from the
    // foot up, gold from there over the apex, so the gold sits in front of the navy at the
    // top. The crossbar is red too, running out of the red leg and behind the navy one.
    sections: [
      { tone: "navy", region: "67.6,-10 110,-10 110,110 79.7,110 67.9,80 60,60 40,60" },
      { tone: "red", region: "-14.6,32.7 41.98,54.92 40,60 60,60 67.9,80 79.7,110 -20,110" },
      { tone: "gold", region: "-14.6,32.7 41.98,54.92 67.6,-10 -20,-10" },
    ],
    seams: "M50 34.5 L62 4 M60 60 L67.9 80",
    light: [30, 0, 70, 100],
    depth: [6, -9],
  },
  {
    key: "u",
    glyph: "M11 7 Q11 4 14 4 H30 Q33 4 33 7 V56 A17 17 0 0 0 67 56 V7 Q67 4 70 4 H86 Q89 4 89 7 V56 A39 39 0 0 1 11 56 Z",
    light: [0, 18, 100, 92],
    depth: [-10, -7],
  },
];

type Section = { tone: Tone; clip?: string };
const sectionsOf = (l: LetterDef): Section[] =>
  l.sections?.map((s, i) => ({ tone: s.tone, clip: `pd-sec-${l.key}-${i}` })) ?? [{ tone: "navy" }];
const tonesOf = (l: LetterDef) => [...new Set(sectionsOf(l).map(s => s.tone))];

/** Reading order; stacking between neighbours is set per letter in padu.css. */
const ORDER: LetterDef["key"][] = ["p", "a", "d", "u"];

const VIEWBOX = "-18 -18 136 136";

/* Extrusion copies, back to front: each colour deepening away from the face. */
const STEPS = 16;
const sideColor = (tone: Tone, t: number) => {
  const [back, front] = SIDES[tone];
  return `rgb(${back.map((b, k) => Math.round(b + (front[k] - b) * t)).join(" ")})`;
};

/**
 * Writes the pointer position (-1…1 from the viewport centre, eased) into --mx / --my.
 * Desktop mouse only; touch, small screens and reduced motion keep the letters still.
 */
function usePointerDrift(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let raf = 0, x = 0, y = 0, tx = 0, ty = 0;

    const tick = () => {
      x += (tx - x) * 0.05;
      y += (ty - y) * 0.05;
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const aim = (nx: number, ny: number) => {
      tx = nx; ty = ny;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      // Nothing to steer while the cluster is scrolled away.
      if (e.pointerType === "mouse" && !el.classList.contains("is-idle")) aim((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    };
    const onLeave = () => aim(0, 0);

    const bind = () => {
      if (mq.matches) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
      } else {
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        cancelAnimationFrame(raf);
        raf = 0; x = y = tx = ty = 0;
        el.style.removeProperty("--mx");
        el.style.removeProperty("--my");
      }
    };
    bind();
    mq.addEventListener("change", bind);
    return () => {
      mq.removeEventListener("change", bind);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/** Page position of an element's layout box, ignoring transforms (parallax, reveal, scroll). */
function layoutTop(el: HTMLElement) {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
}
function layoutLeft(el: HTMLElement) {
  let x = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) x += n.offsetLeft;
  return x;
}

/**
 * One scrubbed scroll progress assembles the hero, then everything stays put:
 * - the row (.pd-letters-rise) descends from the first card row onto the stage;
 * - the letters close up from a wider spacing (--pd-spread, 1 → 0, times each letter's --fan);
 * - the cards on each side slide in from slightly further out (--pd-out, set from the room
 *   there is, times --pd-spread).
 * Writes --pd-land (0 → 1) so the stage's light pools brighten as the row arrives.
 * Only transforms move; nothing fades, and every offset ends at zero, i.e. on the layout.
 *
 * Desktop: the full effect, with the descent kept clear of the hero description above.
 * Tablet: a short drop and a small spread. Phone: the letters close up a little, nothing
 * else moves. Reduced motion: none of it.
 */
function useAssembly(ref: RefObject<HTMLDivElement | null>) {
  useScrollScene(ref, ({ desktop, reduce }, el) => {
    if (reduce) return;
    const rise = el.querySelector<HTMLElement>(".pd-letters-rise");
    const letters = Array.from(el.querySelectorAll<HTMLElement>(".pd-l"));
    const hero = el.closest<HTMLElement>(".pd-hero");
    const lede = hero?.querySelector<HTMLElement>(".pd-lede");
    if (!rise || !letters.length || !hero || !lede) return;
    const slots = Array.from(hero.querySelectorAll<HTMLElement>(".pd-slot"));
    const tab = document.querySelector<HTMLElement>(".pd-sidenav");

    let travel = 0, end = 1;
    const measure = () => {
      const sceneTop = layoutTop(el);
      const boxTop = Math.min(...letters.map(l => l.offsetTop));
      const boxH = letters[0].offsetHeight;
      const rowCentre = sceneTop + boxTop + boxH / 2;
      const glyphTop = sceneTop + boxTop + boxH * 0.16; // letters sit 16–85% down their box
      const room = glyphTop - (layoutTop(lede) + lede.offsetHeight);

      if (desktop) {
        const firstRow = Array.from(hero.querySelectorAll<HTMLElement>(".pd-slot--1, .pd-slot--2"));
        const rowTarget = firstRow.length
          ? firstRow.reduce((sum, c) => sum + layoutTop(c) + c.offsetHeight / 2, 0) / firstRow.length
          : rowCentre;
        travel = Math.min(0, Math.max(rowTarget - rowCentre, -(room - 64)));
        // Arrive as the scene's middle reaches the upper-middle of the screen, never in less
        // than ~1.6 px of scroll per px of travel.
        const settle = sceneTop + el.offsetHeight / 2 - innerHeight * 0.45;
        end = Math.max(settle, -travel * 1.6, 320);
      } else {
        travel = innerWidth < 640 ? 0 : -Math.max(0, Math.min(room - 48, el.offsetHeight * 0.16));
        end = Math.max(260, -travel / 0.16);
      }

      // How far the cards can open out: never off screen, never into the JEJAK side tab.
      const phone = innerWidth < 640;
      const want = phone || !slots.length ? 0 : desktop ? Math.min(56, Math.max(24, innerWidth * 0.032)) : 12;
      let out = 0;
      if (want) {
        const left = Math.min(...slots.map(layoutLeft));
        const rightLimit = tab?.offsetParent ? tab.getBoundingClientRect().left : document.documentElement.clientWidth;
        const right = rightLimit - Math.max(...slots.map(s => layoutLeft(s) + s.offsetWidth));
        out = Math.max(0, Math.min(want, left - 12, right - 12));
      }
      hero.style.setProperty("--pd-out", `${out.toFixed(1)}px`);
      el.style.setProperty("--fan-k", desktop ? "1" : phone ? "0.5" : "0.7");
    };

    const state = { p: 0 };
    const apply = () => {
      rise.style.transform = `translate3d(0, ${(travel * (1 - state.p)).toFixed(1)}px, 0)`;
      el.style.setProperty("--pd-land", travel ? state.p.toFixed(3) : "1");
      hero.style.setProperty("--pd-spread", (1 - state.p).toFixed(3));
    };

    measure();
    apply();
    gsap.to(state, {
      p: 1,
      ease: "sine.inOut",
      onUpdate: apply,
      scrollTrigger: {
        start: 0,
        end: () => end,
        scrub: 0.6,
        onRefreshInit: measure,
        onRefresh: apply,
      },
    });

    return () => {
      rise.style.removeProperty("transform");
      el.style.removeProperty("--pd-land");
      el.style.removeProperty("--fan-k");
      hero.style.removeProperty("--pd-spread");
      hero.style.removeProperty("--pd-out");
    };
  });
}

/** Pauses the idle float while the cluster is off screen. */
function usePauseOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-idle", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

function Defs() {
  return (
    <svg className="pd-letters-defs" aria-hidden="true" focusable="false">
      <defs>
        {LETTERS.map(l => (
          <path key={l.key} id={`pd-glyph-${l.key}`} d={l.glyph} fillRule="evenodd" clipRule="evenodd" />
        ))}
        {LETTERS.map(l => {
          const [x1, y1, x2, y2] = l.light;
          return (
            <g key={l.key}>
              {/* The letter's own shape, to keep the bevel and reflection on its face */}
              <clipPath id={`pd-clip-${l.key}`} clipPathUnits="userSpaceOnUse">
                <use href={`#pd-glyph-${l.key}`} />
              </clipPath>
              {/* The whole extrusion, to light its faces as one solid */}
              <clipPath id={`pd-ext-${l.key}`} clipPathUnits="userSpaceOnUse">
                {Array.from({ length: STEPS }, (_, i) => (
                  <use key={i} href={`#pd-glyph-${l.key}`}
                    transform={`translate(${((l.depth[0] * (i + 1)) / STEPS).toFixed(2)} ${((l.depth[1] * (i + 1)) / STEPS).toFixed(2)})`} />
                ))}
              </clipPath>
              {l.sections?.map((sec, i) => (
                <clipPath key={i} id={`pd-sec-${l.key}-${i}`} clipPathUnits="userSpaceOnUse">
                  <polygon points={sec.region} />
                </clipPath>
              ))}
              {/* Face colours, lit from this letter's own direction */}
              {tonesOf(l).map(tone => (
                <linearGradient key={tone} id={`pd-face-${l.key}-${tone}`} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
                  {TONES[tone].map((c, i) => <stop key={i} offset={TONE_STOPS[i]} stopColor={c} />)}
                </linearGradient>
              ))}
              {/* Bevel: a bright catch along the lit edges, a dark one along the shaded edges */}
              <linearGradient id={`pd-bevel-${l.key}`} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="0.32" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="0.7" stopColor="#020a24" stopOpacity="0" />
                <stop offset="1" stopColor="#020a24" stopOpacity="0.45" />
              </linearGradient>
            </g>
          );
        })}
        {/* Light from above on the sides: top faces catch it, lower faces fall into shade */}
        <linearGradient id="pd-side-light" gradientUnits="userSpaceOnUse" x1="0" y1="-12" x2="0" y2="100">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="0.22" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000814" stopOpacity="0.2" />
        </linearGradient>
        {/* Reflection across a polished face: a soft sheen at the top and one faint band */}
        <linearGradient id="pd-sheen" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.26" />
          <stop offset="0.3" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.66" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="0.74" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="pd-blur-lg" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="pd-blur-md" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
        {/* Region in letter units (the whole canvas), so nothing at the edges is cut off */}
        <filter id="pd-blur-seam" filterUnits="userSpaceOnUse" x="-18" y="-18" width="136" height="136">
          <feGaussianBlur stdDeviation="0.55" />
        </filter>
      </defs>
    </svg>
  );
}

/** The letter's shape in one section's colour, cut to that section when it has one. */
function Fill({ href, sec, ...rest }: { href: string; sec: Section } & SVGProps<SVGUseElement>) {
  return <use href={href} clipPath={sec.clip ? `url(#${sec.clip})` : undefined} {...rest} />;
}

function Letter({ k }: { k: LetterDef["key"] }) {
  const l = LETTERS.find(x => x.key === k)!;
  const glyph = `#pd-glyph-${k}`;
  const secs = sectionsOf(l);
  const accent = secs.some(s => s.tone !== "navy");
  const [dx, dy] = l.depth;
  return (
    <div className={`pd-l pd-l--${k}`}>
      <div className="pd-l-move">
        <div className="pd-l-bob">
          <div className="pd-l-sway">
            <svg className="pd-l-body" viewBox={VIEWBOX}>
              <g strokeLinejoin="round">
                {/* Soft shadow below, then a restrained glow in each section's own colour */}
                <use href={glyph} fill="#0c1f4f" stroke="#0c1f4f" strokeWidth="4" opacity="0.28" transform={`translate(${dx * 0.5 + 3} 13)`} filter="url(#pd-blur-lg)" />
                <g opacity={accent ? 0.22 : 0.3} transform={`translate(${dx * 0.5} ${dy * 0.5})`} filter="url(#pd-blur-md)">
                  {secs.map((sec, i) => <Fill key={i} href={glyph} sec={sec} fill={GLOW[sec.tone]} stroke={GLOW[sec.tone]} strokeWidth="9" />)}
                </g>

                {/* Extrusion: a faint rim on the far edge, then solid copies stepping toward the
                    face. Every section is drawn in its own colour at every step, so each colour
                    runs through the full depth. On the bright gold and red the copies' edges
                    show as fine ridges; a sub-pixel blur smooths them. */}
                <g filter={accent ? "url(#pd-blur-seam)" : undefined}>
                  <g transform={`translate(${dx} ${dy})`} fill="none" strokeOpacity="0.35" strokeWidth="1.4">
                    {secs.map((sec, i) => <Fill key={i} href={glyph} sec={sec} stroke={BACK_RIM[sec.tone]} />)}
                  </g>
                  {Array.from({ length: STEPS }, (_, i) => {
                    const j = STEPS - i;
                    const t = i / (STEPS - 1);
                    return (
                      <g key={j} transform={`translate(${((dx * j) / STEPS).toFixed(2)} ${((dy * j) / STEPS).toFixed(2)})`}>
                        {secs.map((sec, n) => <Fill key={n} href={glyph} sec={sec} fill={sideColor(sec.tone, t)} />)}
                      </g>
                    );
                  })}
                  <rect x="-18" y="-18" width="136" height="136" fill="url(#pd-side-light)" clipPath={`url(#pd-ext-${k})`} />
                </g>

                {/* A crisp dark edge where the face meets its sides */}
                <use href={glyph} fill="none" stroke="#06143a" strokeOpacity="0.55" strokeWidth="2.2" />

                {/* Face: each section's coated colour, then a bevel round its edge and a
                    restrained reflection, both kept to the face */}
                {secs.map((sec, i) => <Fill key={i} href={glyph} sec={sec} fill={`url(#pd-face-${k}-${sec.tone})`} />)}
                <g clipPath={`url(#pd-clip-${k})`}>
                  <use href={glyph} fill="url(#pd-sheen)" />
                  {l.seams && <path d={l.seams} fill="none" stroke="#06143a" strokeOpacity="0.5" strokeWidth="1.4" />}
                  <use href={glyph} fill="none" stroke={`url(#pd-bevel-${k})`} strokeWidth="3.6" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The glass stage under the row: a thin luminous disc with engraved rings and its own
 * soft underglow, drawn as one static SVG.
 */
function Stage() {
  return (
    <div className="pd-stage" aria-hidden="true">
      <svg className="pd-stage-disc" viewBox="0 0 400 150">
        <defs>
          <radialGradient id="pd-stage-top" cx="0.5" cy="0.44" r="0.62">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.38" stopColor="#e2eaff" stopOpacity="0.85" />
            <stop offset="0.78" stopColor="#c3d2f8" stopOpacity="0.7" />
            <stop offset="1" stopColor="#a3b7f0" stopOpacity="0.8" />
          </radialGradient>
          {/* Side of the disc: lit where it faces the viewer, falling off round the curve */}
          <linearGradient id="pd-stage-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c2cff3" stopOpacity="0.85" />
            <stop offset="0.5" stopColor="#9fb4f3" stopOpacity="0.75" />
            <stop offset="1" stopColor="#c2cff3" stopOpacity="0.85" />
          </linearGradient>
          {/* Rim: faint along the back edge, bright along the front */}
          <linearGradient id="pd-stage-rim" gradientUnits="userSpaceOnUse" x1="0" y1="18" x2="0" y2="86">
            <stop offset="0" stopColor="#8aa4ee" stopOpacity="0.4" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="pd-stage-halo" gradientUnits="userSpaceOnUse" x1="0" y1="12" x2="0" y2="98">
            <stop offset="0" stopColor="#6f8fe8" stopOpacity="0" />
            <stop offset="1" stopColor="#6f8fe8" stopOpacity="0.36" />
          </linearGradient>
          <filter id="pd-stage-blur-lg" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="pd-stage-blur-md" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="pd-stage-blur-sm" x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* Soft blue bloom spilling under and around the disc */}
        <ellipse cx="200" cy="70" rx="182" ry="46" fill="#7d95ff" opacity="0.22" filter="url(#pd-stage-blur-lg)" />
        <ellipse cx="200" cy="58" rx="150" ry="30" fill="#6f95ff" opacity="0.26" filter="url(#pd-stage-blur-md)" />
        {/* Faint halo ring a little way out */}
        <ellipse cx="200" cy="55" rx="196" ry="42" fill="none" stroke="url(#pd-stage-halo)" strokeWidth="1" />

        {/* Disc: side band, then the top surface */}
        <path d="M30 52 V63 A170 34 0 0 0 370 63 V52 A170 34 0 0 1 30 52 Z" fill="url(#pd-stage-side)" />
        <path d="M30 63 A170 34 0 0 0 370 63" fill="none" stroke="#6f8fe8" strokeOpacity="0.4" strokeWidth="1" />
        <ellipse cx="200" cy="52" rx="170" ry="34" fill="url(#pd-stage-top)" />

        {/* Engraved rings and the light pooled at the centre */}
        <ellipse cx="200" cy="52" rx="62" ry="12.5" fill="#ffffff" opacity="0.9" filter="url(#pd-stage-blur-md)" />
        <ellipse cx="200" cy="52" rx="128" ry="25.6" fill="none" stroke="#6f8fe8" strokeOpacity="0.32" strokeWidth="0.8" />
        <ellipse cx="200" cy="52" rx="86" ry="17.2" fill="none" stroke="#6f8fe8" strokeOpacity="0.3" strokeWidth="0.8" strokeDasharray="2 5" />
        <circle cx="92" cy="65.6" r="1.6" fill="#5b80e8" opacity="0.6" />
        <circle cx="318" cy="60" r="1.3" fill="#5b80e8" opacity="0.5" />

        {/* Luminous rim with a soft glow, brightest along the front edge */}
        <ellipse cx="200" cy="52" rx="170" ry="34" fill="none" stroke="#7d9cff" strokeWidth="6" opacity="0.32" filter="url(#pd-stage-blur-sm)" />
        <ellipse cx="200" cy="52" rx="170" ry="34" fill="none" stroke="url(#pd-stage-rim)" strokeWidth="1" />
        <ellipse cx="200" cy="85.5" rx="64" ry="1.6" fill="#ffffff" opacity="0.9" filter="url(#pd-stage-blur-sm)" />
      </svg>

    </div>
  );
}

export function FloatingLetters() {
  const ref = useRef<HTMLDivElement>(null);
  usePointerDrift(ref);
  usePauseOffscreen(ref);
  useAssembly(ref);

  return (
    <div ref={ref} className="pd-letters" role="img" aria-label="PADU">
      <Defs />
      <Stage />
      {/* Light the letters throw on the stage; stays put while the row descends */}
      <div className="pd-pools" aria-hidden="true">
        {ORDER.map(k => <div key={k} className={`pd-pool pd-l--${k}`}><span className="pd-l-pool" /></div>)}
      </div>
      {/* Scroll layer: moves the whole row; each letter's float runs inside it */}
      <div className="pd-letters-rise">
        {ORDER.map(k => <Letter key={k} k={k} />)}
      </div>
    </div>
  );
}
