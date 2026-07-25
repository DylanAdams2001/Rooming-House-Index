"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AvatarMenu } from "@/components/avatar-menu";
import { Bookmark, MessageCircle, User, Wrench } from "lucide-react";
import { MobileNav } from "./mobile-nav";

const MENU_ITEMS = [
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/saved", label: "Saved Suburbs", icon: Bookmark },
  { href: "/dashboard/services", label: "Services", icon: Wrench },
  { href: "/dashboard/settings", label: "Profile", icon: User },
];

export function DashboardTopbar({
  userId,
  userEmail,
  fullName,
  avatarUrl,
}: {
  userId: string;
  userEmail: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-20 min-w-0 items-center justify-between gap-4 border-b border-line bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        <span className="truncate font-display text-lg text-ink md:hidden">
          Rooming House Index
        </span>
      </div>
      <AvatarMenu
        userId={userId}
        name={fullName ?? userEmail}
        avatarUrl={avatarUrl}
        items={MENU_ITEMS}
        onLogout={handleLogout}
      />
    </header>
  );
}
