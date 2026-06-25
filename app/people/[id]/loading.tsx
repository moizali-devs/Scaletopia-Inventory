import { AppShell } from "@/components/dashboard/app-shell";
import { Topbar } from "@/components/dashboard/topbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AppShell>
      <Topbar section="People" page="Person Record" />

      <main className="flex-1 overflow-x-hidden overflow-y-auto px-5 py-6 md:px-7">
        <div className="mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-6">
          <Skeleton className="h-4 w-32" />

          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-32" />
          </div>

          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </main>
    </AppShell>
  );
}
