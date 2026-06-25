import { AppShell } from "@/components/dashboard/app-shell";
import { Topbar } from "@/components/dashboard/topbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AppShell>
      <Topbar section="Pages" page="People" />

      <main className="flex-1 overflow-x-hidden overflow-y-auto px-5 py-6 md:px-7">
        <div className="flex w-full min-w-0 flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 min-w-[220px] max-w-sm flex-1 rounded-md" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-md" />
            ))}
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>

          <Skeleton className="h-[520px] rounded-lg" />

          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-40 rounded-md" />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
