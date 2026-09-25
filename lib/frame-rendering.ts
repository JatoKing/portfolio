// Rendering budgets are independent of the cinematic clock and source indices.
export const frameRendering = {
  maxDecodedWidth: 1920,
  desktopDpr: 2,
  mobileDpr: 1.5,
  // High-quality resizing happens once during decoding. Bilinear canvas scaling
  // avoids the repeated high-quality resampling stalls measured at Retina sizes.
  canvasSmoothing: "low" as ImageSmoothingQuality,
} as const;

export function getDecodeDimensions(displayWidth: number, dpr: number) {
  // The source is natively 1280x720; decoding larger would only store interpolated pixels.
  const sourceWidth = 1280;
  // Multiples of 16 preserve the exact 16:9 aspect ratio, including small screens.
  const width = Math.max(16, Math.min(sourceWidth, frameRendering.maxDecodedWidth,
    Math.ceil(displayWidth * dpr / 16) * 16));
  return { width, height: width * 9 / 16 };
}
