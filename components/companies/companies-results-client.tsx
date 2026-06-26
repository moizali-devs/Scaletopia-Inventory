"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CompanyListResult } from "@/lib/data/companies";
import { CompaniesTable } from "@/components/companies/companies-table";
import { Pagination } from "@/components/companies/pagination";
import { ExportButton } from "@/components/companies/export-button";
import { SkeletonTable } from "@/components/shared/skeleton-loaders";

export function CompaniesResultsClient() {
  const searchParams = useSearchParams();
  const paramsStr = searchParams.toString();
  const [result, setResult] = useState<CompanyListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(false);
    fetch(`/api/companies/results?${paramsStr}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data: CompanyListResult) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setLoading(false);
          setError(true);
        }
      });

    return () => controller.abort();
  }, [paramsStr]);

  const exportHref = `/companies/export?${paramsStr}`;

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-4 w-36 rounded bg-rule animate-pulse" />
        <SkeletonTable rows={12} />
      </div>
    );
  }

  if (error || !result) {
    return (
      <p className="text-sm text-ink-soft">Failed to load companies. Please refresh.</p>
    );
  }

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">
          {result.total.toLocaleString("en-US")} companies
        </h2>
        <ExportButton href={exportHref} />
      </div>

      <CompaniesTable rows={result.rows} />

      <Pagination
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        searchParams={new URLSearchParams(paramsStr)}
      />
    </>
  );
}
