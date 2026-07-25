"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { User } from "lucide-react";

export function HeaderAuthButton() {
  const supabase = createClient();
  const [loaded, setLoaded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setSignedIn(!!user);
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        setAvatarUrl(profile?.avatar_url ?? null);
      }
      setLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded) {
    return <div className="h-10 w-10" />;
  }

  if (signedIn) {
    return (
      <Link
        href="/account"
        aria-label="Profile"
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-offwhite text-ink transition-colors hover:border-ink"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <User className="h-5 w-5 text-muted" />
        )}
      </Link>
    );
  }

  return (
    <Button asChild size="sm">
      <Link href="/login">Sign In</Link>
    </Button>
  );
}
