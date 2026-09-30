import type { Metadata } from "next";
import { Anton } from "next/font/google";

/* Condensed campaign display face, used only on this case study. */
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Ticket System",
  description: "Final Year Project: a Laravel football ticket booking system with real-time seat allocation for Bukit Jalil National Stadium.",
};

export default function FypLayout({ children }: { children: React.ReactNode }) {
  return <div className={anton.variable}>{children}</div>;
}
