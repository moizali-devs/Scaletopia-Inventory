"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners = new Set<(toast: Toast) => void>();

export function showToast(message: string, type: ToastType = "info") {
  const id = `toast-${toastId++}`;
  const toast: Toast = { id, message, type };
  listeners.forEach((listener) => listener(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
      return () => clearTimeout(timer);
    };

    listeners.add(handleToast);
    return () => {
      listeners.delete(handleToast);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 flex flex-col items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg animate-slide-up",
            toast.type === "success"
              ? "bg-success/10 text-success border border-success/20"
              : toast.type === "error"
                ? "bg-danger/10 text-danger border border-danger/20"
                : "bg-stamp/10 text-stamp border border-stamp/20"
          )}
        >
          {toast.type === "success" && <CheckCircle2 size={18} className="shrink-0" />}
          {toast.type === "error" && <AlertCircle size={18} className="shrink-0" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="ml-2 hover:opacity-70 transition-opacity"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
