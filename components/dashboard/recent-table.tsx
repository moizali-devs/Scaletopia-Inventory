import Link from "next/link";
import { humanizeSlug, timeAgo } from "@/lib/utils";
import type { RecentCompany } from "@/lib/data/dashboard";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentTable({
  title,
  rows,
  now,
}: {
  title: string;
  rows: RecentCompany[];
  now: Date;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-sm text-ink">{title}</CardTitle>
        <CardAction>
          <Link href="/companies" className="text-xs font-medium text-stamp hover:underline">
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-rule text-left text-xs font-medium text-ink-soft">
              <th className="pb-2 pr-4 font-medium">Company</th>
              <th className="pb-2 pr-4 font-medium">Niche</th>
              <th className="pb-2 pr-4 font-medium">Country</th>
              <th className="pb-2 font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-rule last:border-0">
                <td className="py-2.5 pr-4 font-medium text-ink">{r.name}</td>
                <td className="py-2.5 pr-4 text-ink-soft">{r.niche ? humanizeSlug(r.niche) : "—"}</td>
                <td className="py-2.5 pr-4 text-ink-soft">{r.country ?? "—"}</td>
                <td className="py-2.5 text-ink-soft">{timeAgo(r.createdAt, now)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
