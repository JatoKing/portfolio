import type { Gap as GapName } from "./data";

/**
 * Empty scroll the camera travels through between two scenes. The marker sits
 * where the transition swaps scenes, so "which scene am I in" flips at the
 * same moment the picture does.
 */
export function Gap({ name }: { name: GapName }) {
  return (
    <div className="jk-gap" data-gap={name} aria-hidden>
      <span className="jk-gap__mark" data-gap-mark />
    </div>
  );
}
