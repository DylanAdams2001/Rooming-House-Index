"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft, Building2 } from "lucide-react";
import { getPartnerNavItems, isPartnerNavItemActive } from "./nav-items";
import { ProductTour } from "@/components/tour/product-tour";

export function PartnersSidebar({
  role,
  category,
  unreadMessageCount = 0,
}: {
  role: string | null | undefined;
  category?: string | null;
  unreadMessageCount?: number;
}) {
  const pathname = usePathname();
  const items = getPartnerNavItems(role, category);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-offwhite md:flex md:flex-col">
      <div className="flex h-20 items-center border-b border-line px-6">
        {role === "admin" ? (
          <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg text-ink">
            <ArrowLeft className="h-5 w-5" />
            Partner Portal
          </Link>
        ) : (
          <Link href="/partners" className="flex items-center gap-2 font-display text-lg text-ink">
            <Building2 className="h-5 w-5" />
            Partner Portal
          </Link>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-6">
        {items.map((item) => {
          const active = isPartnerNavItemActive(items, pathname, item.href);
          const Icon = item.icon;
          const unread = item.href === "/partners/messages" && unreadMessageCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.href}
              className={cn(
                "flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition-colors",
                active ? "bg-ink text-white" : "text-body hover:bg-linen hover:text-ink"
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

      <ProductTour
        tourKey="partners-tour"
        intro={{
          title: "Welcome to the Partner Portal",
          description:
            role === "admin"
              ? "Every business partner across every category lives here — here's a quick look around."
              : "Reply to messages, manage your listings or quote requests, and keep your business details current — here's a quick look around.",
        }}
        steps={items.map((item) => ({
          selector: `[data-tour="${item.href}"]`,
          title: item.label,
          description: item.tourDescription,
        }))}
      />
    </aside>
  );
}
