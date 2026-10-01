"use client";
import { useCallback, useEffect, useState } from "react";
import {
  JourneyStage, TopNav, JourneyIndex, SummitHero, Gap, ChallengeSection, JourneyPhases,
  Capabilities, Descent, Experience, Outcome, Trailhead, ScreenshotModal, ScrollTrigger,
} from "@/components/jejak";
import "@/components/jejak/jejak.css";

/*
 * One continuous hike down the same mountain: each content section sits on its
 * own camera position, and each <Gap> is the stretch of scroll where the
 * camera travels to the next one (clouds, birds, a tree, the river, mist,
 * footsteps, the trail).
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
      <JourneyStage />
      <TopNav />

      <main className="jk-main">
        <SummitHero />
        <Gap name="clouds" />
        <ChallengeSection />
        <Gap name="birds" />
        <JourneyPhases />
        <Gap name="tree" />
        <Capabilities />
        <Gap name="river" />
        <Descent />
        <Gap name="mist" />
        <Experience onOpen={setModal} />
        <Gap name="footsteps" />
        <Outcome />
        <Gap name="trail" />
        <Trailhead />
      </main>

      <JourneyIndex />

      {/* Outside every sticky/transformed ancestor so position: fixed stays fixed. */}
      {modal !== null && <ScreenshotModal index={modal} onClose={closeModal} />}
    </div>
  );
}
