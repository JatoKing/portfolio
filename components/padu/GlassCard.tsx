import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "section";
  interactive?: boolean;
  children: ReactNode;
  style?: CSSProperties;
};

/** Translucent panel with a dimensional edge highlight. */
export function GlassCard({
  as: Tag = "div", interactive = false, className = "", children, ...rest
}: GlassCardProps) {
  return (
    <Tag className={`pd-glass ${interactive ? "pd-glass--interactive" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
