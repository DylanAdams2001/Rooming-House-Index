"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AvatarMenu } from "@/components/avatar-menu";
import { getPartnerNavItems } from "./nav-items";
import { PartnersMobileNav } from "./mobile-nav";

export function PartnersTopbar({
  userId,
  userEmail,
  fullName,
  avatarUrl,
  role,
  category,
  unreadMessageCount = 0,
}: {
  userId: string;
  userEmail: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: string | null | undefined;
  category?: string | null;
  unreadMessageCount?: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  const menuItems = getPartnerNavItems(role, category).map((item) =>
    item.href === "/partners/messages" ? { ...item, badgeCount: unreadMessageCount } : item
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-20 min-w-0 items-center justify-between gap-4 border-b border-line bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <PartnersMobileNav role={role} category={category} unreadMessageCount={unreadMessageCount} />
        <span className="truncate font-display text-lg text-ink md:hidden">Partner Portal</span>
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
