"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { SCENES, SCREENSHOTS, pad } from "./data";

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
    <div className="jk-modal" onClick={onClose}>
      <div
        className="jk-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="jk-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="jk-modal__media">
          {!loaded && <span className="jk-modal__loading" aria-hidden />}
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

        <div className="jk-modal__copy">
          <div className="jk-modal__bar">
            <p className="jk-label">
              <span className="jk-label__num">{pad(6)}</span>
              <span className="jk-label__slash" aria-hidden>/</span>
              <span>{SCENES[5].label}</span>
            </p>
            <button ref={closeRef} type="button" className="jk-modal__close" onClick={onClose} aria-label="Close">
              <X size={15} />
            </button>
          </div>
          <p className="jk-modal__count">#{index + 1} / {SCREENSHOTS.length}</p>
          <h3 id="jk-modal-title" className="jk-h3">{shot.caption}</h3>
          <p className="jk-body">{shot.description}</p>
        </div>
      </div>
    </div>
  );
}
