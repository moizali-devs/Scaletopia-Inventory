import { cn } from "@/lib/utils";

/**
 * Horizontal die-cut perforation — the tear-line where a slip detaches from
 * the binder. Same dot vocabulary as SprocketRail, rotated to run across the
 * page instead of down its edge.
 */
export function Perforation({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-3 w-full [background-repeat:repeat-x] [background-position:center] [background-size:28px_12px]",
        className
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle, transparent 0 3px, var(--rule) 3px 4px, transparent 4px 100%)",
      }}
    />
  );
}
