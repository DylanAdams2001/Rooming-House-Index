"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function HeaderAuthButton() {
  const supabase = createClient();
  const [loaded, setLoaded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSignedIn(!!user);
      setLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded) {
    return (
      <Button size="sm" disabled className="opacity-0">
        Sign In
      </Button>
    );
  }

  return (
    <Button asChild size="sm">
      <Link href={signedIn ? "/account" : "/login"}>{signedIn ? "Profile" : "Sign In"}</Link>
    </Button>
  );
}
