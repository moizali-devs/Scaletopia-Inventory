import { NavLinks } from "@/components/shared/nav-links";

function formatRunStamp(date: Date): string {
  const datePart = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${datePart.replaceAll("/", "-")} ${timePart} UTC`;
}

export function Masthead({
  title,
  eyebrow = "Scaletopia · Internal",
  generatedAt,
}: {
  title: string;
  eyebrow?: string;
  generatedAt: Date;
}) {
  return (
    <header className="border-b-2 border-ink bg-ink text-paper">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-5 md:px-10">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-paper/60">
            {eyebrow}
          </p>
          <h1 className="mt-1 font-mono text-2xl font-semibold uppercase tracking-tight md:text-3xl">
            {title}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <NavLinks />
          <div className="flex items-center gap-2 font-mono text-xs text-paper/70">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-stamp/70 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-stamp" />
            </span>
            RUN {formatRunStamp(generatedAt)}
          </div>
        </div>
      </div>
    </header>
  );
}
