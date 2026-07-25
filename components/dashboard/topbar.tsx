"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { MobileNav } from "./mobile-nav";

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
      <div className="flex min-w-0 shrink-0 items-center gap-3 sm:gap-4">
        <Link href="/dashboard/settings" className="flex min-w-0 items-center gap-2">
          <Avatar
            seed={userId}
            name={fullName ?? userEmail}
            photoUrl={avatarUrl}
            className="h-8 w-8 shrink-0 text-sm"
          />
          <span className="hidden max-w-[160px] truncate text-sm text-body sm:block md:max-w-none">
            {userEmail}
          </span>
        </Link>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
}
