"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function EnquireButton({
  listingId,
  listingTitle,
  inspectionTime,
}: {
  listingId: string;
  listingTitle: string;
  inspectionTime?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEnquire() {
    setLoading(true);
    setError(null);

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

    // Creates (or reuses) a real conversation with the property team, seeded with an
    // opening message confirming the inspection time — not just a "message sent" toast.
    const { data, error: rpcError } = await supabase.rpc("enquire_on_listing", {
      p_listing_id: listingId,
      p_listing_title: listingTitle,
      p_inspection_time: inspectionTime ?? null,
    });

    setLoading(false);

    if (rpcError) {
      setError("Couldn't send your enquiry — this needs a live Supabase project connected.");
      return;
    }

    setConversationId(data as string);
  }

  if (conversationId) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-body">Enquiry sent — the property team will be in touch.</p>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/account/messages/${conversationId}`}>View conversation</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" size="lg" onClick={handleEnquire} disabled={loading}>
        {loading ? "Please wait…" : "Enquire"}
      </Button>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
