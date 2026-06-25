import { AppShell } from "@/components/dashboard/app-shell";
import { Topbar } from "@/components/dashboard/topbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AppShell>
      <Topbar section="Dashboards" page="Overview" />

      <main className="flex-1 overflow-x-hidden overflow-y-auto px-5 py-6 md:px-7">
        <div className="mx-auto flex w-full max-w-[920px] min-w-0 flex-col gap-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>

          <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[92px] rounded-xl" />
            ))}
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Skeleton className="h-[300px] rounded-xl lg:col-span-2" />
            <Skeleton className="h-[300px] rounded-xl" />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-[230px] rounded-xl" />
            <Skeleton className="h-[230px] rounded-xl" />
          </section>

          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      </main>
    </AppShell>
  );
}
