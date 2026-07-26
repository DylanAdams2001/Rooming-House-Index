"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { AuthModal } from "@/components/auth-modal";
import { createClient } from "@/lib/supabase/client";
import {
  Bookmark,
  FileText,
  LogOut,
  MessageCircle,
  User,
  Wrench,
} from "lucide-react";

const TENANT_MENU_ITEMS = [
  { href: "/account/messages", label: "Messages", icon: MessageCircle },
  { href: "/account/saved-listings", label: "Saved Listings", icon: Bookmark },
  { href: "/account/enquiries", label: "Enquiries", icon: FileText },
  { href: "/account/settings", label: "Profile", icon: User },
];

const INVESTOR_MENU_ITEMS = [
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/saved", label: "Saved Suburbs", icon: Bookmark },
  { href: "/dashboard/services", label: "Services", icon: Wrench },
  { href: "/dashboard/settings", label: "Profile", icon: User },
];

export function HeaderAuthButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isInvestor, setIsInvestor] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile(user: { id: string; email?: string | null }) {
      setUserId(user.id);
      setEmail(user.email ?? null);
      const { data: profile } = await supabase
        .from("users")
        .select("avatar_url, full_name, investor_access")
        .eq("id", user.id)
        .maybeSingle();
      setAvatarUrl(profile?.avatar_url ?? null);
      setFullName(profile?.full_name ?? null);
      setIsInvestor(profile?.investor_access === "active");

      // Same unread comparison as the account layout's badge — pulled and
      // compared in JS since it's two columns on the same row, not something
      // a Supabase filter can express directly.
      const { data: conversations } = await supabase
        .from("listing_conversations")
        .select("last_message_at, tenant_last_read_at")
        .eq("tenant_id", user.id);
      setUnreadCount(
        (conversations ?? []).filter(
          (c) => !c.tenant_last_read_at || new Date(c.last_message_at) > new Date(c.tenant_last_read_at)
        ).length
      );
    }

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) await loadProfile(user);
      setLoaded(true);
    });

    // A one-time getUser() on mount misses sign-ins that happen without this
    // component remounting — e.g. logging in on /login (no header there) and then
    // client-navigating to a page that does have one, where Next's Router Cache can
    // also restore a stale previous render. Subscribing to auth changes keeps this
    // in sync regardless of how/where the session actually changed.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setUserId(null);
        setAvatarUrl(null);
        setFullName(null);
        setEmail(null);
        setIsInvestor(false);
        setUnreadCount(0);
      }
      setLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  async function handleLogout() {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!loaded) {
    return <div className="h-10 w-10" />;
  }

  if (!userId) {
    return (
      <>
        <Button size="sm" onClick={() => setShowAuthModal(true)}>
          Sign In
        </Button>
        {showAuthModal && (
          <AuthModal
            initialMode="login"
            onClose={() => setShowAuthModal(false)}
            onAuthenticated={() => {
              setShowAuthModal(false);
              router.refresh();
            }}
          />
        )}
      </>
    );
  }

  const menuItems = isInvestor ? INVESTOR_MENU_ITEMS : TENANT_MENU_ITEMS;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile menu"
        aria-expanded={open}
        className="relative flex h-10 w-10 shrink-0 rounded-full border border-line transition-colors hover:border-ink"
      >
        <Avatar
          seed={userId}
          name={fullName ?? email}
          photoUrl={avatarUrl}
          className="h-full w-full text-base"
        />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-600"
            aria-label="Unread notifications"
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-card border border-line bg-white py-2 shadow-lg">
          {isInvestor && (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted"
            >
              Investor Dashboard
            </Link>
          )}
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-body transition-colors hover:bg-linen hover:text-ink"
            >
              <Icon className="h-4 w-4" />
              {label}
              {href === "/account/messages" && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
          <div className="my-2 border-t border-line" />
          <button
            type="button"
            onClick={handleLogout}
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
