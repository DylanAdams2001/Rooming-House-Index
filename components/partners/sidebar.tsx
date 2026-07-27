"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
import { getPartnerNavItems, isPartnerNavItemActive } from "./nav-items";

export function PartnersSidebar({
  role,
  category,
  unreadEnquiryCount = 0,
  unreadMessageCount = 0,
}: {
  role: string | null | undefined;
  category?: string | null;
  unreadEnquiryCount?: number;
  unreadMessageCount?: number;
}) {
  const pathname = usePathname();
  const items = getPartnerNavItems(role, category);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-offwhite md:flex md:flex-col">
      <div className="flex h-20 items-center border-b border-line px-6">
        <Link href="/partners" className="flex items-center gap-2 font-display text-lg text-ink">
          <Building2 className="h-5 w-5" />
          Partner Portal
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-6">
        {items.map((item) => {
          const active = isPartnerNavItemActive(items, pathname, item.href);
          const Icon = item.icon;
          const unread =
            (item.href === "/partners/enquiries" && unreadEnquiryCount > 0) ||
            (item.href === "/partners/messages" && unreadMessageCount > 0);
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
