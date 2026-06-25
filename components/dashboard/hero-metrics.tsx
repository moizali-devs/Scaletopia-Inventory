"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    if (!isInView) return;

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
  }, [end, duration, isInView]);

  return (
    <motion.div
      ref={containerRef}
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.div
        className="text-4xl sm:text-5xl font-bold text-stamp"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
      >
        {prefix}
        {count.toLocaleString("en-US")}
        {suffix}
      </motion.div>
      <p className="text-sm sm:text-base text-ink-soft text-center">{label}</p>
    </motion.div>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-br from-stamp/5 to-transparent border-b border-rule"
    >
      {/* Decorative floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-stamp/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
          animate={{
            y: ["50%", "30%", "60%", "40%", "50%"],
            x: ["-50%", "-30%", "-60%", "-40%", "-50%"],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-stamp/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
          animate={{
            y: ["-50%", "-30%", "-70%", "-40%", "-50%"],
            x: ["50%", "30%", "60%", "40%", "50%"],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative px-5 py-12 md:px-7 md:py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <ScaletopiaLogoWithBadge />
          </motion.div>
          <div className="mb-12 flex flex-col items-center gap-2">
            <motion.h1
              className="text-3xl sm:text-4xl font-bold text-ink text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Scaletopia Catalog Insights
            </motion.h1>
            <motion.p
              className="text-ink-soft text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Real-time data visibility for your company and people database
            </motion.p>
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
