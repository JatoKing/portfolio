/**
 * The original project accents were tuned for a light background.
 * On deep navy they read too dark, so each is lifted towards white
 * while keeping its hue. Returns an "r,g,b" string for rgba() use.
 */
export function softAccent(colorRaw: string, mix = 0.42): string {
  return colorRaw
    .split(",")
    .map((c) => Math.round(Number(c) + (255 - Number(c)) * mix))
    .join(",");
}
