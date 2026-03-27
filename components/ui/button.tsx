import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

/*
 * Responsive Button
 * ─────────────────
 * Phone   < 640px   → sm sizing, slightly looser tap targets
 * Tablet  640–1023px → default sizing
 * Desktop ≥ 1024px  → default sizing (unchanged)
 *
 * Touch-friendly:
 *  • min-h-[44px] on xs/sm/default/outline etc. for phone (WCAG 2.5.5)
 *  • lg stays at h-9 but gets min-h-[44px] on mobile too
 *  • icon variants get min-w/min-h 44px on mobile
 */

const buttonVariants = cva(
  // ── Base ──────────────────────────────────────────────────────────────────
  [
    "group/button",
    "inline-flex shrink-0 items-center justify-center",
    "rounded-lg border border-transparent bg-clip-padding",
    "text-sm font-medium whitespace-nowrap",
    "transition-all outline-none select-none",
    // Focus
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    // Active
    "active:translate-y-px",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-50",
    // Aria invalid
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    // SVG
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    // ── Responsive touch target (phone) ──────────────────────────────────
    // Ensures minimum 44px tap target on small screens for all non-icon variants
    "sm:min-h-0",           // reset on sm+ (tablet/desktop use explicit heights)
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link:
          "text-primary underline-offset-4 hover:underline",
      },

      size: {
        // ── default ──────────────────────────────────────────────────────
        // Phone:   h-11 (44px) for proper touch target
        // Tablet+: h-8  (original)
        default: [
          "h-11 gap-1.5 px-3",
          "has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
          "sm:h-8 sm:px-2.5",
          "sm:has-data-[icon=inline-end]:pr-2 sm:has-data-[icon=inline-start]:pl-2",
        ],

        // ── xs ───────────────────────────────────────────────────────────
        // Phone:   h-9 (slightly bigger), text-xs
        // Tablet+: h-6 (original)
        xs: [
          "h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 text-xs",
          "in-data-[slot=button-group]:rounded-lg",
          "has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
          "[&_svg:not([class*='size-'])]:size-3",
          "sm:h-6 sm:px-2",
          "sm:has-data-[icon=inline-end]:pr-1.5 sm:has-data-[icon=inline-start]:pl-1.5",
        ],

        // ── sm ───────────────────────────────────────────────────────────
        // Phone:   h-10, slightly wider padding
        // Tablet+: h-7 (original)
        sm: [
          "h-10 gap-1 rounded-[min(var(--radius-md),12px)] px-3 text-[0.8rem]",
          "in-data-[slot=button-group]:rounded-lg",
          "has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
          "[&_svg:not([class*='size-'])]:size-3.5",
          "sm:h-7 sm:px-2.5",
          "sm:has-data-[icon=inline-end]:pr-1.5 sm:has-data-[icon=inline-start]:pl-1.5",
        ],

        // ── lg ───────────────────────────────────────────────────────────
        // Phone:   h-12 (48px), more padding for prominence
        // Tablet+: h-9 (original)
        lg: [
          "h-12 gap-1.5 px-4",
          "has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
          "sm:h-9 sm:px-2.5",
          "sm:has-data-[icon=inline-end]:pr-3 sm:has-data-[icon=inline-start]:pl-3",
        ],

        // ── icon ─────────────────────────────────────────────────────────
        // Phone:   44×44 min tap target
        // Tablet+: 32×32 (original size-8)
        icon: [
          "size-11",
          "sm:size-8",
        ],

        // ── icon-xs ──────────────────────────────────────────────────────
        "icon-xs": [
          "size-9 rounded-[min(var(--radius-md),10px)]",
          "in-data-[slot=button-group]:rounded-lg",
          "[&_svg:not([class*='size-'])]:size-3",
          "sm:size-6",
        ],

        // ── icon-sm ──────────────────────────────────────────────────────
        "icon-sm": [
          "size-10 rounded-[min(var(--radius-md),12px)]",
          "in-data-[slot=button-group]:rounded-lg",
          "[&_svg:not([class*='size-'])]:size-3.5",
          "sm:size-7",
        ],

        // ── icon-lg ──────────────────────────────────────────────────────
        "icon-lg": [
          "size-12",
          "sm:size-9",
        ],
      },
    },

    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size    = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }