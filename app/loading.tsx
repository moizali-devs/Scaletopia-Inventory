import { AppShell } from "@/components/dashboard/app-shell";
import { Topbar } from "@/components/dashboard/topbar";
import { Skeleton } from "@/components/ui/skeleton";

const DELAYS = [
  "animate-in-delay-1",
  "animate-in-delay-2",
  "animate-in-delay-3",
  "animate-in-delay-4",
  "animate-in-delay-5",
  "animate-in-delay-6",
];

export default function Loading() {
  return (
    <AppShell>
      <Topbar section="Dashboards" page="Overview" />

      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Hero section skeleton */}
        <div className="relative overflow-hidden bg-gradient-to-br from-stamp/5 to-transparent border-b border-rule p-12">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-8 w-64 rounded-lg animate-shimmer" />
              <Skeleton className="h-4 w-96 rounded animate-shimmer animate-in-delay-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className={`h-10 w-32 rounded animate-shimmer ${DELAYS[i % 6]}`} />
                  <Skeleton className={`h-3 w-24 rounded animate-shimmer ${DELAYS[Math.min(i + 1, 5)]}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-6 md:px-7">
          <div className="mx-auto flex w-full max-w-[920px] min-w-0 flex-col gap-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24 rounded animate-shimmer" />
              <Skeleton className="h-8 w-20 rounded-lg animate-shimmer animate-in-delay-2" />
            </div>

            {/* Stat cards skeleton */}
            <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={`h-[92px] rounded-xl animate-shimmer ${DELAYS[i % 4]}`}
                />
              ))}
            </section>

            {/* Chart skeletons */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Skeleton className={`h-[300px] rounded-xl lg:col-span-2 animate-shimmer ${DELAYS[2]}`} />
              <Skeleton className={`h-[300px] rounded-xl animate-shimmer ${DELAYS[3]}`} />
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Skeleton className={`h-[230px] rounded-xl animate-shimmer ${DELAYS[4]}`} />
              <Skeleton className={`h-[230px] rounded-xl animate-shimmer ${DELAYS[5]}`} />
            </section>

            {/* Table skeleton */}
            <Skeleton className={`h-[280px] rounded-xl animate-shimmer ${DELAYS[5]}`} />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
