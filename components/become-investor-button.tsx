"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

// Hidden once someone already has investor access — the pitch to "become an
// investor" doesn't make sense pointed at an investor. Shown for guests and
// tenant accounts alike.
export function BecomeInvestorButton() {
  const supabase = createClient();
  const [isInvestor, setIsInvestor] = useState(false);

  useEffect(() => {
    async function checkInvestor(user: { id: string } | null) {
      if (!user) {
        setIsInvestor(false);
        return;
      }
      const { data: profile } = await supabase
        .from("users")
        .select("investor_access")
        .eq("id", user.id)
        .maybeSingle();
      setIsInvestor(profile?.investor_access === "active");
    }

    supabase.auth.getUser().then(({ data: { user } }) => checkInvestor(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkInvestor(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isInvestor) return null;

  return (
    <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
      <Link href="/invest">Become an Investor</Link>
    </Button>
  );
}
