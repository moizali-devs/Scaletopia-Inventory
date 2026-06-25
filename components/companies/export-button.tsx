"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/shared/toast";

export function ExportButton({ href, label = "Export CSV" }: { href: string; label?: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleExport() {
    try {
      setIsLoading(true);
      const response = await fetch(href);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition?.match(/filename="?([^"]*)"?/)?.[1] || "export.csv";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Exported successfully`, "success");
    } catch (error) {
      showToast("Failed to export. Please try again.", "error");
      console.error("Export error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-rule px-3 py-1.5 text-xs font-medium transition-smooth",
        isLoading
          ? "opacity-50 cursor-not-allowed"
          : "text-ink hover:bg-hover active:bg-hover/75 focus-visible:ring-2 focus-visible:ring-stamp/50"
      )}
      aria-label={label}
    >
      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      {label}
    </button>
  );
}
