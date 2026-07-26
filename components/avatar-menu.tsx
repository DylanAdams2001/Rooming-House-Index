"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { LogOut, type LucideIcon } from "lucide-react";

export type AvatarMenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeCount?: number;
};

// Shared avatar-click dropdown used by the dashboard and account topbars — same
// interaction pattern as the public header's HeaderAuthButton, just with
// section-appropriate menu items and no signed-out state (these areas already
// redirect to /login before rendering).
export function AvatarMenu({
  userId,
  name,
  avatarUrl,
  items,
  onLogout,
}: {
  userId: string;
  name?: string | null;
  avatarUrl?: string | null;
  items: AvatarMenuItem[];
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasUnread = items.some((item) => (item.badgeCount ?? 0) > 0);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile menu"
        aria-expanded={open}
        className="relative flex h-9 w-9 shrink-0 rounded-full border border-line transition-colors hover:border-ink"
      >
        <Avatar seed={userId} name={name} photoUrl={avatarUrl} className="h-full w-full text-sm" />
        {hasUnread && (
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-600"
            aria-label="Unread notifications"
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-card border border-line bg-white py-2 shadow-lg">
          {items.map(({ href, label, icon: Icon, badgeCount }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-body transition-colors hover:bg-linen hover:text-ink"
            >
              <Icon className="h-4 w-4" />
              {label}
              {!!badgeCount && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-medium text-white">
                  {badgeCount}
                </span>
              )}
            </Link>
          ))}
          <div className="my-2 border-t border-line" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-body transition-colors hover:bg-linen hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
