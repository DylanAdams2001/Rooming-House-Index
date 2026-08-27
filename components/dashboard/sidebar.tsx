"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, ChevronDown } from "lucide-react";
import { getDashboardNavItems } from "./nav-items";
import { ProductTour } from "@/components/tour/product-tour";

export function DashboardSidebar({
  role,
  unreadMessageCount = 0,
}: {
  role?: string | null;
  unreadMessageCount?: number;
}) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navItems = getDashboardNavItems(role);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-offwhite md:flex md:flex-col">
      <div className="flex h-20 items-center border-b border-line px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg text-ink">
          <Building2 className="h-5 w-5" />
          Rooming House Standard
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
                  data-tour={item.href}
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

          if (item.comingSoon) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm text-muted"
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                <span className="whitespace-nowrap rounded-full border border-line bg-white px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                  Coming Soon
                </span>
              </div>
            );
          }

          const unread = item.href === "/dashboard/messages" && unreadMessageCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.href}
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
              {item.badge && (
                <span
                  className={cn(
                    "whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                    active ? "border-white/30 text-white" : "border-line bg-white text-muted"
                  )}
                >
                  {item.badge}
                </span>
              )}
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

      <ProductTour
        tourKey="dashboard-tour"
        intro={{
          title: "Welcome to Rooming House Standard!",
          description: "Here's a quick look at what's available in your investor dashboard.",
        }}
        steps={navItems
          .filter((item) => !item.comingSoon)
          .map((item) => ({
            selector: `[data-tour="${item.href}"]`,
            title: item.label,
            description: item.tourDescription,
          }))}
      />
    </aside>
  );
}
