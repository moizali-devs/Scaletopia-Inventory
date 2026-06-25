"use client";

import { useState } from "react";
import { Dialog } from "radix-ui";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "@/components/dashboard/sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open navigation"
          className="inline-flex size-8 items-center justify-center rounded-md text-ink-soft hover:bg-hover lg:hidden"
        >
          <Menu size={18} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-rule bg-card outline-none">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <div className="flex items-center justify-end px-3 pt-3">
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close navigation"
                className="inline-flex size-8 items-center justify-center rounded-md text-ink-soft hover:bg-hover"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
