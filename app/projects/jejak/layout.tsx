import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JEJAK",
  description: "ASEAN GeoAI Fusion 2026: JEJAK, a React Native hiking safety app that predicts communication dead zones, works offline, and records GPS for search and rescue.",
};

export default function JejakLayout({ children }: { children: React.ReactNode }) {
  return children;
}
