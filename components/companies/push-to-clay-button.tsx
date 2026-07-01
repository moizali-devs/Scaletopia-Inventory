"use client";

import { useState } from "react";
import { AlertDialog } from "radix-ui";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/shared/toast";

type PreflightResult = { total_matched: number; eligible: number };

type PushDoneResult = {
  total_matched: number;
  already_pushed: number;
  total_found: number;
  pushed: number;
  errors: number;
  failed_companies: string[];
};

type SseEvent =
  | { type: "progress"; phase: "resolving" | "pushing" | "done"; done: number; total: number; pushed: number; errors: number }
  | { type: "done"; result: PushDoneResult }
  | { type: "error"; message: string };

type Status = "idle" | "checking" | "confirming" | "pushing";

export function PushToClayButton({ paramsStr }: { paramsStr: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);
  const [pushLabel, setPushLabel] = useState<string | null>(null);

  const busy = status === "checking" || status === "pushing";

  async function handleClick() {
    if (busy) return;
    setStatus("checking");

    try {
      const response = await fetch(`/api/companies/push-to-clay/preflight?${paramsStr}`);
      if (!response.ok) {
        throw new Error("Preflight failed");
      }

      const data: PreflightResult = await response.json();

      if (data.eligible === 0) {
        if (data.total_matched === 0) {
          showToast("No companies match the current filters.", "info");
        } else {
          showToast("All matching companies have already been pushed to Clay.", "info");
        }
        setStatus("idle");
        return;
      }

      setPreflight(data);
      setStatus("confirming");
    } catch (error) {
      showToast("Couldn't check companies. Try again.", "error");
      console.error("Push to Clay preflight error:", error);
      setStatus("idle");
    }
  }

  function handleCancel() {
    setPreflight(null);
    setStatus("idle");
  }

  async function handleConfirm() {
    setStatus("pushing");
    setPushLabel("Pushing…");

    try {
      const response = await fetch(`/api/companies/push-to-clay?${paramsStr}`, {
        method: "POST",
      });

      if (!response.ok || !response.body) {
        throw new Error("Push failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data: ")) continue;
          const event: SseEvent = JSON.parse(line.slice("data: ".length));
          handleSseEvent(event);
        }
      }
    } catch (error) {
      showToast(
        "Push interrupted — re-run to continue; already-pushed companies are skipped.",
        "error"
      );
      console.error("Push to Clay stream error:", error);
    } finally {
      setPreflight(null);
      setPushLabel(null);
      setStatus("idle");
    }
  }

  function handleSseEvent(event: SseEvent) {
    if (event.type === "progress") {
      setPushLabel(`Pushing ${event.done}/${event.total}…`);
      return;
    }

    if (event.type === "error") {
      showToast(event.message, "error");
      return;
    }

    if (event.type === "done") {
      const { pushed, errors, failed_companies } = event.result;
      if (errors === 0) {
        showToast(`Pushed ${pushed} companies to Clay.`, "success");
      } else if (pushed > 0) {
        const names = failed_companies.slice(0, 3).join(", ");
        const more = failed_companies.length > 3 ? "…" : "";
        showToast(`Pushed ${pushed}, ${errors} failed: ${names}${more}.`, "error");
      } else {
        showToast(`All ${errors} pushes failed. Check the Clay webhook.`, "error");
      }
    }
  }

  const label =
    status === "pushing" && pushLabel
      ? pushLabel
      : status === "checking"
        ? "Checking…"
        : "Push to Clay";

  return (
    <AlertDialog.Root open={status === "confirming"} onOpenChange={(open) => !open && handleCancel()}>
      <button
        onClick={handleClick}
        disabled={busy}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-rule px-3 py-1.5 text-xs font-medium transition-smooth",
          busy
            ? "opacity-50 cursor-not-allowed"
            : "text-ink hover:bg-hover active:bg-hover/75 focus-visible:ring-2 focus-visible:ring-stamp/50"
        )}
        aria-label="Push to Clay"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {label}
      </button>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <AlertDialog.Content className="fixed top-[30%] left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-xl border border-rule bg-popover p-5 shadow-2xl outline-none">
          <AlertDialog.Title className="text-sm font-semibold text-ink">
            Push to Clay?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-ink-soft">
            {preflight && preflight.eligible >= 1000 ? (
              <span className="mb-1 block text-xs text-ink-mute">
                This is a large push — confirm your filters.
              </span>
            ) : null}
            <strong className="text-ink">{preflight?.eligible ?? 0}</strong> companies will be
            pushed. ({preflight?.total_matched ?? 0} match your current filters;{" "}
            {(preflight?.total_matched ?? 0) - (preflight?.eligible ?? 0)} already pushed and will
            be skipped.)
          </AlertDialog.Description>

          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="rounded-md border border-rule px-3 py-1.5 text-xs font-medium text-ink transition-smooth hover:bg-hover focus-visible:ring-2 focus-visible:ring-stamp/50"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-md bg-stamp px-3 py-1.5 text-xs font-medium text-white transition-smooth hover:opacity-90 focus-visible:ring-2 focus-visible:ring-stamp/50"
              >
                Push {preflight?.eligible ?? 0}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
