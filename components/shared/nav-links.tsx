"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/companies", label: "Companies" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 font-mono text-xs uppercase tracking-wide">
      {LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "border-b pb-0.5 transition-colors",
              active ? "border-stamp text-paper" : "border-transparent text-paper/60 hover:text-paper"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
