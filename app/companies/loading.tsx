import { AppShell } from "@/components/dashboard/app-shell";
import { Topbar } from "@/components/dashboard/topbar";
import { Skeleton } from "@/components/ui/skeleton";

const SLIP_DELAYS = [
  "animate-in-delay-1",
  "animate-in-delay-2",
  "animate-in-delay-3",
  "animate-in-delay-4",
  "animate-in-delay-5",
  "animate-in-delay-6",
];

const CARD_DELAYS = ["animate-in-delay-2", "animate-in-delay-3", "animate-in-delay-4", "animate-in-delay-5"];

export default function Loading() {
  return (
    <AppShell>
      <Topbar section="Pages" page="Companies" />

      <main className="flex-1 overflow-x-hidden overflow-y-auto px-5 py-6 md:px-7">
        <div className="flex w-full min-w-0 flex-col gap-6">
          {/* Filter slip */}
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className={`h-9 min-w-[220px] max-w-sm flex-1 rounded-md animate-shimmer ${SLIP_DELAYS[0]}`} />
            {SLIP_DELAYS.slice(1).map((d, i) => (
              <Skeleton key={i} className={`h-9 w-28 rounded-md animate-shimmer ${d}`} />
            ))}
          </div>

          {/* Count + export */}
          <div className="flex items-baseline justify-between gap-3">
            <Skeleton className={`h-4 w-28 animate-shimmer ${SLIP_DELAYS[4]}`} />
            <Skeleton className={`h-7 w-24 rounded-md animate-shimmer ${SLIP_DELAYS[5]}`} />
          </div>

          {/* Table */}
          <Skeleton className="h-[520px] rounded-lg animate-shimmer animate-in-delay-4" />

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 animate-shimmer animate-in-delay-5" />
            <Skeleton className="h-8 w-40 rounded-md animate-shimmer animate-in-delay-6" />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
