"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { Building2, Download, PieChart, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResults } from "@/lib/data/search";

type Group = "Companies" | "People" | "Commands";

interface PaletteItem {
  key: string;
  group: Group;
  label: string;
  sublabel?: string | null;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  perform: (router: ReturnType<typeof useRouter>) => void;
}

const COMMANDS: Omit<PaletteItem, "group">[] = [
  { key: "go-overview", label: "Go to Overview", icon: PieChart, perform: (r) => r.push("/") },
  {
    key: "go-companies",
    label: "Go to Companies",
    icon: Building2,
    perform: (r) => r.push("/companies"),
  },
  { key: "go-people", label: "Go to People", icon: Users, perform: (r) => r.push("/people") },
  {
    key: "export-companies",
    label: "Export companies CSV",
    icon: Download,
    perform: () => {
      window.location.href = "/companies/export";
    },
  },
  {
    key: "export-people",
    label: "Export people CSV",
    icon: Download,
    perform: () => {
      window.location.href = "/people/export";
    },
  },
];

const EMPTY_RESULTS: SearchResults = { companies: [], people: [] };

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setQuery("");
    setResults(EMPTY_RESULTS);
    setActiveIndex(0);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (v) reset();
          return !v;
        });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (!term) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: SearchResults) => setResults(data))
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const items = useMemo<PaletteItem[]>(() => {
    const term = query.trim().toLowerCase();

    const companyItems: PaletteItem[] = results.companies.map((c) => ({
      key: `company-${c.id}`,
      group: "Companies",
      label: c.label,
      sublabel: c.sublabel,
      icon: Building2,
      perform: (r) => r.push(`/companies/${c.id}`),
    }));
    const peopleItems: PaletteItem[] = results.people.map((p) => ({
      key: `person-${p.id}`,
      group: "People",
      label: p.label,
      sublabel: p.sublabel,
      icon: Users,
      perform: (r) => r.push(`/people/${p.id}`),
    }));
    const commandItems: PaletteItem[] = COMMANDS.filter((c) =>
      term ? c.label.toLowerCase().includes(term) : true
    ).map((c) => ({ ...c, group: "Commands" }));

    return [...companyItems, ...peopleItems, ...commandItems];
  }, [results, query]);

  function select(item: PaletteItem) {
    item.perform(router);
    handleOpenChange(false);
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) select(item);
    }
  }

  let lastGroup: Group | null = null;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-hover px-3 py-1.5 text-sm text-ink-soft md:flex focus-visible:ring-2 focus-visible:ring-stamp/50 hidden"
          aria-label="Search (press ⌘K or Ctrl+K)"
        >
          <Search size={15} />
          <span className="w-32 text-left text-ink-soft">Search</span>
          <kbd className="text-xs text-ink-mute">⌘K</kbd>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          className="fixed top-[18%] left-1/2 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-rule bg-popover shadow-2xl outline-none"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search companies, people, and run commands
          </Dialog.Description>

          <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
            <Search size={16} className="text-ink-soft" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                const next = e.target.value;
                setQuery(next);
                setActiveIndex(0);
                if (!next.trim()) setResults(EMPTY_RESULTS);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search companies, people, or run a command…"
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
            />
            <kbd className="rounded border border-rule px-1.5 py-0.5 text-[11px] text-ink-mute">
              Esc
            </kbd>
          </div>

          <div role="listbox" className="max-h-80 overflow-y-auto p-2">
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink-soft">No matches</p>
            ) : (
              items.map((item, i) => {
                const showHeader = item.group !== lastGroup;
                lastGroup = item.group;
                const Icon = item.icon;
                return (
                  <div key={item.key}>
                    {showHeader ? (
                      <p className="px-2 pt-2 pb-1 text-xs font-medium text-ink-mute">
                        {item.group}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === activeIndex}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => select(item)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                        i === activeIndex ? "bg-stamp/10 text-stamp" : "text-ink hover:bg-hover"
                      )}
                    >
                      <Icon size={15} className={i === activeIndex ? "text-stamp" : "text-ink-soft"} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.sublabel ? (
                        <span className="truncate text-xs text-ink-soft">{item.sublabel}</span>
                      ) : null}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
