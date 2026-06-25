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
      <Topbar section="People" page="Person Record" />

      <main className="flex-1 overflow-x-hidden overflow-y-auto px-5 py-6 md:px-7">
        <div className="mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-6">
          <Skeleton className={`h-4 w-32 animate-shimmer ${DELAYS[0]}`} />

          <div className="flex flex-col gap-2">
            <Skeleton className={`h-7 w-56 animate-shimmer ${DELAYS[1]}`} />
            <Skeleton className={`h-4 w-32 animate-shimmer ${DELAYS[2]}`} />
          </div>

          <Skeleton className={`h-40 rounded-xl animate-shimmer ${DELAYS[2]}`} />
          <Skeleton className={`h-20 rounded-xl animate-shimmer ${DELAYS[3]}`} />
          <Skeleton className={`h-16 rounded-lg animate-shimmer ${DELAYS[4]}`} />
          <Skeleton className={`h-20 rounded-lg animate-shimmer ${DELAYS[5]}`} />
          <Skeleton className={`h-32 rounded-lg animate-shimmer ${DELAYS[5]}`} />
        </div>
      </main>
    </AppShell>
  );
}
