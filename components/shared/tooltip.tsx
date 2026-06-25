"use client";

import { useState } from "react";

interface TooltipProps {
  label: string;
  value: string | number;
  x: number;
  y: number;
  visible: boolean;
}

export function Tooltip({ label, value, x, y, visible }: TooltipProps) {
  return (
    <div
      className={`fixed bg-popover border border-rule rounded-lg px-3 py-2 text-sm shadow-lg z-40 pointer-events-none transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        left: `${x}px`,
        top: `${y - 40}px`,
        transform: "translateX(-50%)",
      }}
    >
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="font-semibold text-ink">{value.toLocaleString?.("en-US") ?? value}</p>
    </div>
  );
}

export function useChartTooltip() {
  const [tooltip, setTooltip] = useState<TooltipProps>({
    label: "",
    value: "",
    x: 0,
    y: 0,
    visible: false,
  });

  const showTooltip = (label: string, value: string | number, x: number, y: number) => {
    setTooltip({ label, value, x, y, visible: true });
  };

  const hideTooltip = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return { tooltip, showTooltip, hideTooltip };
}
