"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, ChevronDown } from "lucide-react";
import { navItems } from "./nav-items";

export function DashboardSidebar({ unreadMessageCount = 0 }: { unreadMessageCount?: number }) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-offwhite md:flex md:flex-col">
      <div className="flex h-20 items-center border-b border-line px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg text-ink">
          <Building2 className="h-5 w-5" />
          Rooming House Index
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.children) {
            const isOpen = openGroup === item.label;
            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : item.label)}
                  className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm text-body transition-colors hover:bg-linen hover:text-ink"
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-line pl-4">
                    {item.children.map((child) =>
                      child.href ? (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-btn px-3 py-2 text-sm transition-colors",
                            pathname.startsWith(child.href)
                              ? "bg-ink text-white"
                              : "text-body hover:bg-linen hover:text-ink"
                          )}
                        >
                          <span>{child.label}</span>
                        </Link>
                      ) : (
                        <div
                          key={child.label}
                          className="flex items-center justify-between gap-2 rounded-btn px-3 py-2 text-sm text-muted"
                        >
                          <span>{child.label}</span>
                          {child.comingSoon && (
                            <span className="whitespace-nowrap rounded-full border border-line bg-white px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          }

          const unread = item.href === "/dashboard/messages" && unreadMessageCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-ink text-white"
                  : "text-body hover:bg-linen hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {unread && (
                <span
                  className="ml-auto h-2 w-2 shrink-0 rounded-full bg-red-600"
                  aria-label="Unread"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
