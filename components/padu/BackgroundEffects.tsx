/** Fixed atmospheric backdrop: navy depth gradient, drifting light, grid, grain. */
export function BackgroundEffects() {
  return (
    <div className="pd-bg" aria-hidden="true">
      <div className="pd-bg-blob pd-bg-blob--a" />
      <div className="pd-bg-blob pd-bg-blob--b" />
      <div className="pd-bg-blob pd-bg-blob--c" />
      <div className="pd-bg-grid" />
      <div className="pd-bg-noise" />
      <div className="pd-bg-vignette" />
    </div>
  );
}
