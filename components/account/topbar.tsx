"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AvatarMenu } from "@/components/avatar-menu";
import { Bookmark, FileText, MessageCircle, User } from "lucide-react";
import { AccountMobileNav } from "./mobile-nav";

const MENU_ITEMS = [
  { href: "/account/messages", label: "Messages", icon: MessageCircle },
  { href: "/account/saved-listings", label: "Saved Listings", icon: Bookmark },
  { href: "/account/enquiries", label: "Enquiries", icon: FileText },
  { href: "/account/settings", label: "Profile", icon: User },
];

export function AccountTopbar({
  userId,
  userEmail,
  fullName,
  avatarUrl,
  unreadMessageCount = 0,
}: {
  userId: string;
  userEmail: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  unreadMessageCount?: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  const menuItems = MENU_ITEMS.map((item) =>
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
        <AccountMobileNav unreadMessageCount={unreadMessageCount} />
        <span className="truncate font-display text-lg text-ink md:hidden">
          Rooming House Index
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
