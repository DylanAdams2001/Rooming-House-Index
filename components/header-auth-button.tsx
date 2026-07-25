"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { createClient } from "@/lib/supabase/client";
import { Bookmark, FileText, LogOut, MessageCircle, User } from "lucide-react";

const MENU_ITEMS = [
  { href: "/account/messages", label: "Messages", icon: MessageCircle },
  { href: "/account/saved-listings", label: "Saved Listings", icon: Bookmark },
  { href: "/account/enquiries", label: "Enquiries", icon: FileText },
  { href: "/account/settings", label: "Profile", icon: User },
];

export function HeaderAuthButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile(user: { id: string; email?: string | null }) {
      setUserId(user.id);
      setEmail(user.email ?? null);
      const { data: profile } = await supabase
        .from("users")
        .select("avatar_url, full_name")
        .eq("id", user.id)
        .maybeSingle();
      setAvatarUrl(profile?.avatar_url ?? null);
      setFullName(profile?.full_name ?? null);
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
      <Button asChild size="sm">
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile menu"
        aria-expanded={open}
        className="flex h-10 w-10 shrink-0 rounded-full border border-line transition-colors hover:border-ink"
      >
        <Avatar
          seed={userId}
          name={fullName ?? email}
          photoUrl={avatarUrl}
          className="h-full w-full text-base"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-card border border-line bg-white py-2 shadow-lg">
          {MENU_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-body transition-colors hover:bg-linen hover:text-ink"
            >
              <Icon className="h-4 w-4" />
              {label}
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
