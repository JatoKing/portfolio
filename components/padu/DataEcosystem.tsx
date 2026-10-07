"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Briefcase, Car, ChevronLeft, ChevronRight, GraduationCap, HandHeart, MapPin, Minus, Plus,
  RotateCcw, ShieldCheck, Users, Wallet, X, Zap, type LucideIcon,
} from "lucide-react";
import {
  CORE, OUTCOMES, PARAMS, PROFILES, SOURCES, VIEWS, nodeById,
  type EcoNode, type EcoOutcome, type ViewId,
} from "./ecosystem/data";
import type { EcosystemWorld } from "./ecosystem/world";

/*
 * The PADU data ecosystem as the page's footer: a live 3D model of five sources feeding
 * the PADU data core and the core powering four outcomes, with an operations HUD over
 * it, all in Bahasa Melayu. The scene (three.js) loads only as the footer approaches.
 */

const PARAM_ICONS: Record<string, LucideIcon> = {
  demographics: Users, address: MapPin, employment: Briefcase, income: Wallet, education: GraduationCap,
  vehicles: Car, protection: ShieldCheck, utilities: Zap, poverty: HandHeart,
};
const VIEW_IDS = Object.keys(VIEWS) as ViewId[];
const pad = (n: number) => String(n).padStart(2, "0");

type Status = "idle" | "loading" | "ready" | "error";

export function DataEcosystem() {
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const world = useRef<EcosystemWorld | null>(null);
  const toastTimer = useRef(0);

  const [status, setStatus] = useState<Status>("idle");
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<ViewId>("overview");
  const [near, setNear] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [toast, setToast] = useState(false);

  // Tag elements by node id, with one stable ref callback per tag, so re-renders don't
  // detach and reattach them. The world reads the map to pin each tag every frame.
  const [tagEls] = useState(() => new Map<string, HTMLElement>());
  const [tagRef] = useState(() => {
    const fns = new Map<string, (el: HTMLElement | null) => void>();
    return (id: string) => {
      let fn = fns.get(id);
      if (!fn) {
        fn = el => { if (el) tagEls.set(id, el); else tagEls.delete(id); };
        fns.set(id, fn);
      }
      return fn;
    };
  });

  // Build the scene once the footer is within reach of the viewport.
  useEffect(() => {
    const stage = stageRef.current, host = hostRef.current;
    if (!stage || !host) return;
    let cancelled = false;
    let w: EcosystemWorld | null = null;

    const start = async () => {
      setStatus("loading");
      try {
        const css = getComputedStyle(stage);
        const sans = css.getPropertyValue("--font-geist-sans").trim() || "system-ui, sans-serif";
        const mono = css.getPropertyValue("--font-geist-mono").trim() || "ui-monospace, monospace";
        const [{ EcosystemWorld }] = await Promise.all([
          import("./ecosystem/world"),
          Promise.all([document.fonts.load(`700 64px ${sans}`), document.fonts.load(`600 32px ${mono}`)]).catch(() => undefined),
        ]);
        if (cancelled) return;
        w = new EcosystemWorld({
          host, stage,
          label: id => tagEls.get(id),
          reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          fonts: { sans, mono },
          onHover: setHovered,
          onSelect: setSelected,
          onNear: setNear,
          onEngage: setEngaged,
          onWheelBlocked: () => {
            setToast(true);
            window.clearTimeout(toastTimer.current);
            toastTimer.current = window.setTimeout(() => setToast(false), 1800);
          },
        });
        world.current = w;
        setStatus("ready");
      } catch (err) {
        console.error("PADU ecosystem failed to start", err);
        if (!cancelled) setStatus("error");
      }
    };

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      start();
    }, { rootMargin: "600px 0px" });
    io.observe(stage);

    return () => {
      cancelled = true;
      io.disconnect();
      window.clearTimeout(toastTimer.current);
      w?.dispose();
      world.current = null;
    };
  }, [tagEls]);

  const select = useCallback((id: string | null, focus = true) => {
    setSelected(id);
    world.current?.select(id, focus);
  }, []);

  // The PADU view selects the core (and frames it beside its inspector); the others clear
  // the selection and fly to their preset.
  const goTo = useCallback((v: ViewId) => {
    setView(v);
    if (v === "core") {
      setSelected(CORE.id);
      world.current?.select(CORE.id, true);
      return;
    }
    setSelected(null);
    world.current?.select(null, false);
    world.current?.goTo(v);
  }, []);

  // Esc closes the inspector and hands the scroll wheel back to the page.
  useEffect(() => {
    if (status !== "ready") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      world.current?.release();
      if (selected) select(null, false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, selected, select]);


  const node = selected ? nodeById(selected) : undefined;
  const showParams = near || node?.kind === "core" || node?.kind === "param";
  const hoverTag = useCallback((id: string | null) => world.current?.hover(id), []);
  const tagProps = (n: EcoNode) => ({
    node: n,
    hot: hovered === n.id,
    active: selected === n.id,
    ref: tagRef(n.id),
    onPick: select,
    onHover: hoverTag,
  });

  return (
    <section className="pd-eco" aria-labelledby="pd-eco-heading" lang="ms">
      <div className="pd-container pd-eco-head">
        <h2 id="pd-eco-heading" className="pd-eyebrow">Bagaimana PADU berfungsi</h2>
        <span className="pd-mono">Model 3D langsung · Seret untuk teroka</span>
      </div>

      <div
        ref={stageRef}
        className="pd-eco-stage"
        data-status={status}
        data-engaged={engaged || undefined}
        data-selected={node ? node.kind : undefined}
      >
        <div ref={hostRef} className="pd-eco-canvas" />

        {/* Name tags, pinned over the scene by the world every frame */}
        <div className="pd-eco-tags" data-params={showParams || undefined}>
          {SOURCES.map(n => <Tag key={n.id} {...tagProps(n)} />)}
          {OUTCOMES.map(n => <Tag key={n.id} {...tagProps(n)} />)}
          {PARAMS.map(n => <Tag key={n.id} {...tagProps(n)} />)}
          <Tag {...tagProps(CORE)} />
        </div>

        <div className="pd-eco-hud">
          <div className="pd-glass pd-eco-stats">
            <p className="pd-eco-stats-head"><span className="pd-eco-live" aria-hidden="true" />Ekosistem Data PADU</p>
            <button type="button" className="pd-eco-stat pd-eco-stat--lead" onClick={() => goTo("core")}>
              <strong>{PROFILES.value}</strong>
              <span>{PROFILES.label}</span>
            </button>
            <div className="pd-eco-stats-grid">
              <button type="button" className="pd-eco-stat" onClick={() => goTo("sources")}>
                <strong>{SOURCES.length}</strong><span>Sumber data</span>
              </button>
              <button type="button" className="pd-eco-stat" onClick={() => goTo("core")}>
                <strong>{PARAMS.length}</strong><span>Parameter profil</span>
              </button>
              <button type="button" className="pd-eco-stat" onClick={() => goTo("outcomes")}>
                <strong>{OUTCOMES.length}</strong><span>Keberhasilan</span>
              </button>
            </div>
            <ul className="pd-eco-legend">
              <li><i data-flow="in" aria-hidden="true" />Data masuk ke PADU</li>
              <li><i data-flow="out" aria-hidden="true" />Data ke keberhasilan</li>
            </ul>
          </div>

          <nav className="pd-glass pd-eco-nav" aria-label="Paparan kamera">
            {VIEW_IDS.map(v => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => goTo(v)}>
                {VIEWS[v].label}
              </button>
            ))}
          </nav>

          {node && (
            <aside className="pd-glass pd-eco-panel" aria-label={`Butiran ${node.name}`} key={node.id}>
              <button type="button" className="pd-eco-close" aria-label="Tutup butiran" onClick={() => select(null, false)}>
                <X size={16} />
              </button>
              <Inspector node={node} onPick={select} onView={goTo} />
            </aside>
          )}

          <div className="pd-glass pd-eco-ctrl" role="group" aria-label="Kawalan kamera">
            <button type="button" aria-label="Zum masuk" title="Zum masuk" onClick={() => world.current?.zoom(0.78)}><Plus size={16} /></button>
            <button type="button" aria-label="Zum keluar" title="Zum keluar" onClick={() => world.current?.zoom(1.28)}><Minus size={16} /></button>
            <button type="button" aria-label="Set semula" title="Set semula" onClick={() => goTo("overview")}><RotateCcw size={15} /></button>
          </div>

          <p className="pd-eco-hint">
            <span className="pd-eco-hint--mouse">
              {engaged
                ? <><b>Tatal</b> untuk zum · <b>Esc</b> untuk lepas</>
                : <><b>Seret</b> untuk putar · <b>Seret kanan</b> untuk anjak · <b>Klik</b> untuk pilih</>}
            </span>
            <span className="pd-eco-hint--touch"><b>Dua jari</b> untuk putar dan zum · <b>Ketik</b> untuk pilih</span>
          </p>
          <p className="pd-glass pd-eco-toast" role="status" data-show={toast || undefined}>
            {toast ? "Klik model dahulu untuk zum dengan roda tetikus, atau cubit untuk zum." : ""}
          </p>
        </div>

        {status !== "ready" && (
          <div className="pd-eco-status" aria-live="polite">
            {status === "error" ? (
              <Fallback />
            ) : (
              <p><span className="pd-eco-spinner" aria-hidden="true" />Memulakan ekosistem data PADU…</p>
            )}
          </div>
        )}
      </div>

      <div className="sr-only">
        <p>
          Model langsung ekosistem PADU. {SOURCES.length} sumber data ({SOURCES.map(s => s.name).join(", ")}) menghantar
          data ke PADU, yang menyimpan {PROFILES.value} {PROFILES.label} merangkumi {PARAMS.length} parameter
          ({PARAMS.map(p => p.name).join(", ")}). PADU memacu {OUTCOMES.length} keberhasilan:{" "}
          {OUTCOMES.map(o => o.name).join("; ")}.
        </p>
      </div>
    </section>
  );
}

/* ─── Name tag ────────────────────────────────────────────── */

type TagProps = {
  node: EcoNode;
  hot: boolean;
  active: boolean;
  ref: (el: HTMLElement | null) => void;
  onPick: (id: string) => void;
  onHover: (id: string | null) => void;
};

function Tag({ node, hot, active, ref, onPick, onHover }: TagProps) {
  const Icon = node.kind === "param" ? PARAM_ICONS[node.id] : null;
  const label =
    node.kind === "outcome" ? (node as EcoOutcome).facility : node.name;
  const sub =
    node.kind === "source" ? "Sumber data · Disambungkan"
      : node.kind === "outcome" ? `Keberhasilan ${pad(node.idx)}`
        : node.kind === "core" ? `${PROFILES.value} ${PROFILES.label}`
          : "Parameter profil";
  return (
    <button
      ref={ref}
      type="button"
      className={`pd-eco-tag pd-eco-tag--${node.kind}`}
      data-hot={hot || undefined}
      data-active={active || undefined}
      aria-pressed={active}
      onClick={() => onPick(node.id)}
      onPointerEnter={e => e.pointerType === "mouse" && onHover(node.id)}
      onPointerLeave={e => e.pointerType === "mouse" && onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
    >
      <span className="pd-eco-tag-in">
        {node.kind === "outcome" && <span className="pd-eco-tag-idx">{pad(node.idx)}</span>}
        {node.kind === "source" && <span className="pd-eco-tag-dot" aria-hidden="true" />}
        {Icon && <Icon size={13} aria-hidden="true" />}
        <span className="pd-eco-tag-name">{label}</span>
        <span className="pd-eco-tag-sub">{sub}</span>
      </span>
    </button>
  );
}

/* ─── Inspector ───────────────────────────────────────────── */

function Live({ tone = "live" }: { tone?: "live" | "in" | "out" }) {
  return <span className="pd-eco-live" data-tone={tone} aria-hidden="true" />;
}

function Flow({ from, to, dir }: { from: string; to: string; dir: "in" | "out" }) {
  return (
    <div className="pd-eco-flow" data-flow={dir} aria-hidden="true">
      <span>{from}</span>
      <i><b /><b /><b /></i>
      <span>{to}</span>
    </div>
  );
}

function Inspector({ node, onPick, onView }: {
  node: EcoNode;
  onPick: (id: string) => void;
  onView: (v: ViewId) => void;
}) {
  const coreLink = <button type="button" className="pd-eco-link" onClick={() => onPick(CORE.id)}>PADU</button>;

  if (node.kind === "core") {
    return (
      <>
        <p className="pd-eco-kicker">Pangkalan data pusat</p>
        <h3 className="pd-eco-title">{CORE.name}</h3>
        <p className="pd-eco-ms">{CORE.full}</p>
        <p className="pd-eco-big"><strong>{PROFILES.value}</strong><span>{PROFILES.label}</span></p>
        <div className="pd-eco-trio">
          <button type="button" onClick={() => onView("sources")}><strong>{SOURCES.length}</strong>Sumber data</button>
          <span><strong>{PARAMS.length}</strong>Parameter profil</span>
          <button type="button" onClick={() => onView("outcomes")}><strong>{OUTCOMES.length}</strong>Keberhasilan</button>
        </div>
        <p className="pd-eco-blurb">{node.blurb}</p>
        <p className="pd-eco-sub">Parameter profil</p>
        <ul className="pd-eco-chips">
          {PARAMS.map(p => {
            const Icon = PARAM_ICONS[p.id];
            return (
              <li key={p.id}>
                <button type="button" onClick={() => onPick(p.id)}><Icon size={12} aria-hidden="true" />{p.name}</button>
              </li>
            );
          })}
        </ul>
        <dl className="pd-eco-facts">
          <div><dt>Status sistem</dt><dd><Live />Aktif</dd></div>
        </dl>
      </>
    );
  }

  if (node.kind === "param") {
    const Icon = PARAM_ICONS[node.id];
    const prev = PARAMS[(node.idx - 2 + PARAMS.length) % PARAMS.length];
    const next = PARAMS[node.idx % PARAMS.length];
    return (
      <>
        <p className="pd-eco-kicker">Parameter profil · {pad(node.idx)} daripada {pad(PARAMS.length)}</p>
        <h3 className="pd-eco-title pd-eco-title--icon"><span className="pd-eco-ico"><Icon size={18} aria-hidden="true" /></span>{node.name}</h3>
        <p className="pd-eco-blurb">{node.blurb}</p>
        <dl className="pd-eco-facts">
          <div><dt>Jenis</dt><dd>Parameter profil</dd></div>
          <div><dt>Disimpan di</dt><dd>{coreLink}</dd></div>
          <div><dt>Status</dt><dd><Live />Aktif</dd></div>
        </dl>
        <div className="pd-eco-step">
          <button type="button" onClick={() => onPick(prev.id)}><ChevronLeft size={14} aria-hidden="true" />{prev.name}</button>
          <button type="button" onClick={() => onPick(next.id)}>{next.name}<ChevronRight size={14} aria-hidden="true" /></button>
        </div>
      </>
    );
  }

  if (node.kind === "outcome") {
    const o = node as EcoOutcome;
    return (
      <>
        <p className="pd-eco-kicker">Keberhasilan {pad(o.idx)}</p>
        <h3 className="pd-eco-title">{o.facility}</h3>
        <p className="pd-eco-lead">{o.name}</p>
        <p className="pd-eco-sub">Ringkasan</p>
        <p className="pd-eco-blurb pd-eco-blurb--tight">{o.blurb}</p>
        <dl className="pd-eco-facts">
          <div><dt>Sumber data</dt><dd>{coreLink}</dd></div>
          <div><dt>Status</dt><dd><Live />Aktif</dd></div>
          <div><dt>Aliran data</dt><dd><Live tone="out" />Aktif · keluar</dd></div>
        </dl>
        <Flow from="PADU" to={o.facility} dir="out" />
      </>
    );
  }

  return (
    <>
      <p className="pd-eco-kicker">Sumber data · {pad(node.idx)}</p>
      <h3 className="pd-eco-title">{node.name}</h3>
      <p className="pd-eco-blurb">{node.blurb}</p>
      <dl className="pd-eco-facts">
        <div><dt>Jenis</dt><dd>Sumber data</dd></div>
        <div><dt>Sambungan</dt><dd><Live />Disambungkan</dd></div>
        <div><dt>Destinasi</dt><dd>{coreLink}</dd></div>
        <div><dt>Aliran data</dt><dd><Live tone="in" />Aktif · masuk</dd></div>
      </dl>
      <Flow from={node.name} to="PADU" dir="in" />
    </>
  );
}

/* ─── Without WebGL ───────────────────────────────────────── */

function Fallback() {
  return (
    <div className="pd-eco-fallback">
      <p className="pd-eco-kicker">Model 3D memerlukan WebGL. Berikut ringkasan sistem</p>
      <ol>
        <li><strong>{SOURCES.length} sumber data</strong>{SOURCES.map(s => s.name).join(" · ")}</li>
        <li><strong>PADU · {PROFILES.value} {PROFILES.label}</strong>{PARAMS.map(p => p.name).join(" · ")}</li>
        <li><strong>{OUTCOMES.length} keberhasilan</strong>{OUTCOMES.map(o => o.facility).join(" · ")}</li>
      </ol>
    </div>
  );
}
