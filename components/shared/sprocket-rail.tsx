import { cn } from "@/lib/utils";

/**
 * Printed sprocket-hole guides, like the perforated edge of continuous-feed
 * ledger paper. Purely decorative — the signature mark of the page.
 */
export function SprocketRail({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "hidden md:block w-6 shrink-0 [background-repeat:repeat-y] [background-position:center] [background-size:12px_28px]",
        className
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle, transparent 0 3px, var(--rule) 3px 4px, transparent 4px 100%)",
      }}
    />
  );
}
