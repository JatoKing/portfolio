import type { Metadata } from "next";
import { ConstructionPage } from "@/components/not-found/construction-page";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <ConstructionPage />;
}
