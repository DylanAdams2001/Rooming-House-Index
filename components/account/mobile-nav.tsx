"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { accountNavItems } from "./nav-items";

export function AccountMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="flex h-10 w-10 items-center justify-center rounded-btn border border-line text-ink"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex w-72 max-w-[80vw] flex-col bg-offwhite">
            <div className="flex h-20 items-center justify-between border-b border-line px-6">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 font-display text-lg text-ink"
              >
                <Building2 className="h-5 w-5" />
                Rooming House Index
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-6">
              {accountNavItems.map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition-colors",
                      active ? "bg-ink text-white" : "text-body hover:bg-linen hover:text-ink"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
