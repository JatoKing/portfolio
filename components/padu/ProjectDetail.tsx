"use client";
import { useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import type { PaduProject } from "./data";
import { GlassCard } from "./GlassCard";
import { softAccent } from "./utils";

function ScreenshotMockup({
  src, title, icon, compact = false, imgFit = "cover",
}: { src: string; title: string; icon: string; compact?: boolean; imgFit?: "cover" | "contain" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="pd-shot">
      <div className="pd-shot-bar">
        <div className="pd-shot-dots" aria-hidden="true"><i /><i /><i /></div>
        <div className="pd-shot-url pd-mono">padu.gov.my</div>
        <div className="pd-shot-live">LIVE</div>
      </div>
      <div className={`pd-shot-img ${compact ? "pd-shot-img--compact" : ""}`}>
        {failed ? (
          <div className="pd-shot-fallback">
            <div>{icon}</div>
            <span>Screenshot<br /><code>/public{src}</code></span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`${title} screenshot`} loading="lazy"
            style={{ objectFit: imgFit }} onError={() => setFailed(true)} />
        )}
      </div>
    </div>
  );
}

/**
 * The full case-study panel for one project (header, description, features,
 * screenshots). Rendered inside the expanding row of the project showcase.
 */
export function ProjectDetailBody({ proj }: { proj: PaduProject }) {
  const hasShots = proj.imgs.length > 0;

  return (
    <GlassCard
      as="article"
      className="pd-panel"
      style={{ "--pd-acc": softAccent(proj.colorRaw) } as CSSProperties}
    >
      {/* Header */}
      <div className="pd-detail-head">
        <div className="pd-detail-id">
          <div className="pd-detail-icon" aria-hidden="true">{proj.icon}</div>
          <div style={{ minWidth: 0 }}>
            <div className="pd-eyebrow pd-detail-kicker">Project {proj.idx}</div>
            <h3 className="pd-detail-title">{proj.title}</h3>
            <div className="pd-detail-meta">
              <span className="pd-mono">{proj.sub}</span>
              <span className="pd-tag pd-tag--active">Active</span>
              {proj.internal && <span className="pd-tag pd-tag--internal">🔒 Internal Use</span>}
            </div>
          </div>
        </div>

        <div className="pd-detail-techs">
          {proj.techs.map((t) => (
            <span key={t.n} className="pd-tag">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.img} alt="" width={13} height={13}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              {t.n}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={`pd-detail-grid ${hasShots ? "" : "pd-detail-grid--single"}`}>
        <div>
          <p className="pd-desc">{proj.desc}</p>
          {proj.url && (
            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="pd-pill pd-link">
              <ArrowUpRight size={14} />
              {proj.url.replace("https://www.", "")}
            </a>
          )}

          <div className="pd-eyebrow pd-features-label">Key Features</div>
          <ul className="pd-features" role="list">
            {proj.features.map((f) => (
              <li key={f} className="pd-feature">
                <span className="pd-feature-dot" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {hasShots && (
          proj.imgs.length > 1 ? (
            <div className="pd-shots">
              {[
                { src: proj.imgs[0], label: "PADU Public Portal", imgFit: "cover" as const },
                { src: proj.imgs[1], label: "MyINFO Portal", imgFit: "contain" as const },
              ].map(({ src, label, imgFit }) => (
                <div key={label}>
                  <div className="pd-eyebrow pd-shot-label">{label}</div>
                  <ScreenshotMockup src={src} title={label} icon={proj.icon} compact imgFit={imgFit} />
                </div>
              ))}
            </div>
          ) : (
            <ScreenshotMockup src={proj.imgs[0]} title={proj.title} icon={proj.icon} imgFit={proj.imgFit ?? "cover"} />
          )
        )}
      </div>
    </GlassCard>
  );
}
