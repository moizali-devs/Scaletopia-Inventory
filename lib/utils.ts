import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const KNOWN_ACRONYMS: Record<string, string> = {
  dtc: "DTC",
  saas: "SaaS",
  crm: "CRM",
  b2b: "B2B",
  b2c: "B2C",
  ai: "AI",
  us: "US",
  uk: "UK",
  eu: "EU",
};

export function humanizeSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => {
      const known = KNOWN_ACRONYMS[word.toLowerCase()];
      return known ?? word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
