"use client";
import { useCallback, useEffect, useState } from "react";
import {
  SmartTicketHero, StadiumTicker, ProblemStory, ObjectivesGamePlan, ProductShowcase,
  FeatureStory, TechStackMarquee, ProjectStats, ProjectOutro, ScreenshotModal, TopNav,
  ScrollTrigger,
} from "@/components/fyp";
import "@/components/fyp/fyp.css";

export default function SmartTicketPage() {
  const [modal, setModal] = useState<number | null>(null);
  const closeModal = useCallback(() => setModal(null), []);

  // The display face changes line heights once it swaps in; re-measure pins then.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => { if (live) ScrollTrigger.refresh(); });
    return () => { live = false; };
  }, []);

  return (
    <div className="fy">
      <TopNav />

      <main>
        <SmartTicketHero />
        <StadiumTicker />
        <ProblemStory />
        <ObjectivesGamePlan />
        <ProductShowcase onOpen={setModal} />
        <FeatureStory />
        <TechStackMarquee />
        <ProjectStats />
        <ProjectOutro />
      </main>

      {/* Kept outside every pinned section: a transformed ancestor would break position: fixed. */}
      {modal !== null && <ScreenshotModal index={modal} onClose={closeModal} />}
    </div>
  );
}
