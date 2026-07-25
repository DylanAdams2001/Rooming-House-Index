"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function InvestorCtaButton({
  children,
  size = "lg",
  className,
}: {
  children: React.ReactNode;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      router.push("/account/upgrade");
    } else {
      router.push(`/signup?redirectTo=${encodeURIComponent("/account/upgrade")}`);
    }
  }

  return (
    <Button size={size} className={className} onClick={handleClick} disabled={loading}>
      {loading ? "Please wait…" : children}
    </Button>
  );
}
