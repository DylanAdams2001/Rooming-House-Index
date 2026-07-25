"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
import { accountNavItems } from "./nav-items";

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-offwhite md:flex md:flex-col">
      <div className="flex h-20 items-center border-b border-line px-6">
        <Link href="/account" className="flex items-center gap-2 font-display text-lg text-ink">
          <Building2 className="h-5 w-5" />
          Rooming House Index
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-6">
        {accountNavItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
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
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
