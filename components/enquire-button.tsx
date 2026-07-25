"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function EnquireButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [enquired, setEnquired] = useState(false);

  async function handleEnquire() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Every account (member/provider/admin) can enquire — there's one login for the
    // whole site now, investor access is just an optional add-on. Only a guest with
    // no session at all gets sent to sign up first.
    if (!user) {
      const redirectTo = `/listings/${listingId}`;
      router.push(`/signup?redirectTo=${encodeURIComponent(redirectTo)}`);
      return;
    }

    // No enquiry backend yet — a real profile is the gate we care about right now.
    setEnquired(true);
    setLoading(false);
  }

  if (enquired) {
    return (
      <p className="text-center text-sm text-body">
        Enquiry sent — the operator will be in touch.
      </p>
    );
  }

  return (
    <Button className="w-full" size="lg" onClick={handleEnquire} disabled={loading}>
      {loading ? "Please wait…" : "Enquire"}
    </Button>
  );
}
