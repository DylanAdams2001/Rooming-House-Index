"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AuthModal } from "@/components/auth-modal";
import { createClient } from "@/lib/supabase/client";

function suggestedMessage(listingTitle: string, inspectionTime?: string) {
  return inspectionTime
    ? `Hi, I'm interested in the ${listingTitle}. Can confirm I'll be at the inspection: ${inspectionTime}.`
    : `Hi, I'm interested in the ${listingTitle}. Is it still available?`;
}

export function EnquireButton({
  listingId,
  listingTitle,
  inspectionTime,
}: {
  listingId: string;
  listingTitle: string;
  inspectionTime?: string;
}) {
  const supabase = createClient();
  const [checking, setChecking] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState(() => suggestedMessage(listingTitle, inspectionTime));
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Shared by "already logged in" and "just authenticated via the modal" — a landlord
  // needs the application details before an enquiry means anything, so first-time
  // enquirers get sent to fill it in, then come straight back here.
  async function continueAfterAuth(userId: string) {
    const { data: tenantProfile } = await supabase
      .from("tenant_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!tenantProfile) {
      const params = new URLSearchParams({
        redirectTo: `/listings/${listingId}`,
        listingTitle,
      });
      // A hard navigation here, not router.push: this fires from deep inside the auth
      // modal's callback chain, right after the modal itself unmounts in the same tick —
      // that combination reliably swallows a client-side App Router transition (RSC
      // fetch succeeds, URL never updates). A full navigation sidesteps it entirely.
      window.location.href = `/account/application?${params.toString()}`;
      return;
    }

    setChecking(false);
    setComposing(true);
  }

  async function handleEnquireClick() {
    setChecking(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // A guest with no session gets a sign-in modal right here instead of losing
    // this listing to a full page redirect.
    if (!user) {
      setChecking(false);
      setShowAuthModal(true);
      return;
    }

    // Investor and tenant experiences are kept deliberately separate — an investor
    // account enquiring on a room as a "tenant" would confuse the landlord side of
    // things, so this is blocked with an explanation rather than silently allowed.
    // Admin is exempt — no restrictions on any portal for that account.
    const { data: profile } = await supabase
      .from("users")
      .select("investor_access, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.investor_access === "active" && profile.role !== "admin") {
      setChecking(false);
      setError("You're signed in with an investor account. Enquiries are for room-seeker accounts only.");
      return;
    }

    await continueAfterAuth(user.id);
  }

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("enquire_on_listing", {
      p_listing_id: listingId,
      p_listing_title: listingTitle,
      p_inspection_time: inspectionTime ?? null,
      p_message: message.trim(),
    });

    setSending(false);

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

  if (composing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Write a message to the property team…"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-1/3"
            onClick={() => setComposing(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSend} disabled={sending || !message.trim()}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" size="lg" onClick={handleEnquireClick} disabled={checking}>
        {checking ? "Please wait…" : "Enquire"}
      </Button>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={(userId) => {
            setShowAuthModal(false);
            setChecking(true);
            continueAfterAuth(userId);
          }}
        />
      )}
    </div>
  );
}
