"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AvatarMenu } from "@/components/avatar-menu";
import { AccountMobileNav } from "./mobile-nav";
import { getAccountNavItems } from "./nav-items";

export function AccountTopbar({
  userId,
  userEmail,
  fullName,
  avatarUrl,
  role,
  unreadMessageCount = 0,
}: {
  userId: string;
  userEmail: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  unreadMessageCount?: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  const menuItems = getAccountNavItems(role).map((item) =>
    item.href === "/account/messages" ? { ...item, badgeCount: unreadMessageCount } : item
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-20 min-w-0 items-center justify-between gap-4 border-b border-line bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <AccountMobileNav role={role} unreadMessageCount={unreadMessageCount} />
        <span className="truncate font-display text-lg text-ink md:hidden">
          Rooming House Standard
        </span>
      </div>
      <AvatarMenu
        userId={userId}
        name={fullName ?? userEmail}
        avatarUrl={avatarUrl}
        items={menuItems}
        onLogout={handleLogout}
      />
    </header>
  );
}
