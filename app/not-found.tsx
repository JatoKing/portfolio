import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

const links = [
  { href: "/", label: "Back to Portfolio" },
  { href: "/projects/padu", label: "PADU Projects" },
  { href: "/projects/jejak", label: "JEJAK" },
  { href: "/projects/fyp-project", label: "Smart Ticket System" },
];

/* Same stone, ink and rust as the homepage, so a wrong turn still feels like the site. */
export default function NotFound() {
  return (
    <main className="min-h-svh bg-[#d3cfc8] px-[6vw] py-[max(28px,env(safe-area-inset-top))] text-[#252721] [font-family:var(--font-geist-sans),system-ui,-apple-system,'Segoe_UI',sans-serif]">
      <Link href="/" aria-label="Izzat Imran, home" className="text-[45px] font-[650] leading-[0.8] tracking-[-0.12em]">
        ii<span className="text-[#914a32]">.</span>
      </Link>
      <div className="mx-auto flex min-h-[70svh] max-w-xl flex-col justify-center">
        <p className="mb-5 flex items-center gap-3 text-[13px] font-medium tracking-[0.08em]">
          <span className="block h-px w-[26px] bg-[#914a32]" />
          404 / OFF THE TRAIL
        </p>
        <h1 className="text-[clamp(40px,7vw,72px)] font-medium leading-[1.02] tracking-[-0.045em]">
          This page <span className="text-[#914a32]">doesn&apos;t exist.</span>
        </h1>
        <p className="mt-5 max-w-[36ch] text-[17px] leading-relaxed text-[#484943]">
          The link may be old or mistyped. Here&apos;s the way back.
        </p>
        <nav aria-label="Pages" className="mt-9 border-t border-[rgba(37,39,33,0.24)]">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-12 items-center justify-between border-b border-[rgba(37,39,33,0.24)] py-3 text-[16px] transition-colors hover:text-[#914a32] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#914a32]"
            >
              {l.label}
              <span aria-hidden>↗</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
