import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-rule bg-card p-6 animate-pulse",
        className
      )}
    >
      <div className="space-y-4">
        <div className="h-4 w-1/3 rounded bg-rule" />
        <div className="h-8 w-1/2 rounded bg-rule" />
        <div className="h-3 w-3/4 rounded bg-rule" />
      </div>
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-rule bg-card p-6 animate-pulse", className)}>
      <div className="space-y-4">
        <div className="h-4 w-1/4 rounded bg-rule" />
        <div className="h-48 w-full rounded bg-rule/50" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-3 rounded bg-rule" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-rule bg-card p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 w-1/4 rounded bg-rule" />
        <div className="space-y-3">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-3 flex-1 rounded bg-rule" />
              <div className="h-3 w-1/4 rounded bg-rule" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="border-b border-rule bg-gradient-to-br from-stamp/5 to-transparent p-12 animate-pulse">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-96 rounded bg-rule" />
          <div className="h-4 w-80 rounded bg-rule" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-10 w-32 rounded bg-rule" />
              <div className="h-3 w-24 rounded bg-rule" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
