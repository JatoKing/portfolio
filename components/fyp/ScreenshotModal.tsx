"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { SCREENSHOTS } from "./data";

export function ScreenshotModal({ index, onClose }: { index: number; onClose: () => void }) {
  const shot = SCREENSHOTS[index];
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [shot.src]);

  return (
    <div className="fy-modal" onClick={onClose}>
      <div
        className="fy-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fy-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="fy-chrome fy-modal__chrome">
          <span className="fy-chrome__dots" aria-hidden><i /><i /><i /></span>
          <span className="fy-chrome__url" aria-hidden><i />localhost:8000/smart-ticket</span>
          <span className="fy-chrome__num">#{index + 1}</span>
          <button ref={closeRef} type="button" className="fy-modal__close" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className="fy-modal__media">
          {!loaded && <div className="fy-modal__loading" aria-hidden>⚽</div>}
          {/* Plain <img>: the modal shows the untouched original at its natural ratio. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={shot.src}
            alt={shot.alt}
            onLoad={() => setLoaded(true)}
            style={{ opacity: loaded ? 1 : 0 }}
          />
        </div>

        <div className="fy-modal__copy">
          <p className="fy-eyebrow">Screen {index + 1} of {SCREENSHOTS.length}</p>
          <h3 id="fy-modal-title">{shot.caption}</h3>
          <p>{shot.description}</p>
        </div>
      </div>
    </div>
  );
}
