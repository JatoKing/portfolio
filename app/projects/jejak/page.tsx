"use client";
import { useCallback, useEffect, useState } from "react";
import {
  WorldLayer, TopNav, TrailProfile, TrailheadHero, Gap, ChallengeSection, JourneyPhases,
  Capabilities, Experience, Discovery, Outcome, Summit, Ending, ScreenshotModal, ScrollTrigger,
} from "@/components/jejak";
import "@/components/jejak/jejak.css";

/*
 * One continuous climb, told in a single minimal 3D world (WorldLayer): the
 * hiker walks a trail that paints itself as you scroll, from the valley floor
 * to the summit. Each content section is a stage of that trail; each <Gap> is
 * the stretch where the hiker walks on to the next one and the camera moves
 * with them. The ending calls back to the opening frame in evening light.
 */
export default function JejakPage() {
  const [modal, setModal] = useState<number | null>(null);
  const closeModal = useCallback(() => setModal(null), []);

  // Line heights settle once the web font swaps in; re-measure the scroll map then.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => { if (live) ScrollTrigger.refresh(); });
    return () => { live = false; };
  }, []);

  return (
    <div className="jk">
      <WorldLayer />
      <TopNav />

      <main className="jk-main">
        <TrailheadHero />
        <Gap name="path" />
        <ChallengeSection />
        <Gap name="gate" />
        <JourneyPhases />
        <Gap name="canopy" />
        <Capabilities />
        <Gap name="spray" />
        <Experience onOpen={setModal} />
        <Gap name="clouds" />
        <Discovery />
        <Gap name="mist" />
        <Outcome />
        <Gap name="flock" />
        <Summit />
        <Ending />
      </main>

      <TrailProfile />

      {/* Outside every sticky/transformed ancestor so position: fixed stays fixed. */}
      {modal !== null && <ScreenshotModal index={modal} onClose={closeModal} />}
    </div>
  );
}
