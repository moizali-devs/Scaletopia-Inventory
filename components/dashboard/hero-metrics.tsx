"use client";

import { useState, useEffect } from "react";
import { ScaletopiaLogoWithBadge } from "@/components/shared/scaletopia-branding";

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

export function AnimatedCounter({ end, duration = 2000, suffix = "", prefix = "", label }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(end * progress));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [end, duration]);

  return (
    <div className="flex flex-col items-center gap-2 animate-in">
      <div className="text-4xl sm:text-5xl font-bold text-stamp">
        {prefix}
        {count.toLocaleString("en-US")}
        {suffix}
      </div>
      <p className="text-sm sm:text-base text-ink-soft text-center">{label}</p>
    </div>
  );
}

export function HeroMetrics({
  totalCompanies,
  totalPeople,
  niches,
  sources,
}: {
  totalCompanies: number;
  totalPeople: number;
  niches: number;
  sources: number;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-stamp/5 to-transparent border-b border-rule">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-stamp/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-stamp/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative px-5 py-12 md:px-7 md:py-16">
        <div className="mx-auto max-w-5xl">
          <ScaletopiaLogoWithBadge />
          <div className="mb-12 flex flex-col items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-ink text-center">Scaletopia Catalog Insights</h1>
            <p className="text-ink-soft text-center">Real-time data visibility for your company and people database</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            <AnimatedCounter end={totalCompanies} label="Companies" />
            <AnimatedCounter end={totalPeople} label="People" />
            <AnimatedCounter end={niches} label="Niches" />
            <AnimatedCounter end={sources} label="Sources" />
          </div>
        </div>
      </div>
    </section>
  );
}
