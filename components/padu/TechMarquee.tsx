import type { TechItem } from "./data";

function MarqueeRow({ items, reverse = false }: { items: TechItem[]; reverse?: boolean }) {
  const all = [...items, ...items];
  return (
    <div className={`pd-marquee ${reverse ? "pd-marquee--rev" : ""}`}>
      <div className="pd-marquee-track">
        {all.map((item, i) => (
          <span key={i} className="pd-tag" aria-hidden={i >= items.length}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.img} alt="" width={14} height={14}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            {item.n}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Two counter-scrolling rows of the full technology stack. */
export function TechMarquee({ top, bottom }: { top: TechItem[]; bottom: TechItem[] }) {
  return (
    <div className="pd-marquee-band" aria-label="Technology stack">
      <MarqueeRow items={top} />
      <MarqueeRow items={bottom} reverse />
    </div>
  );
}
