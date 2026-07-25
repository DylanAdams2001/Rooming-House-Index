import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getListingById, getListingTitle } from "@/lib/mock-listings";
import { ChatThread } from "@/components/chat/chat-thread";
import { ArrowLeft, CalendarClock } from "lucide-react";

export async function ListingConversationView({ conversationId }: { conversationId: string }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: conversation, error } = await supabase
    .from("listing_conversations")
    .select("id, listing_id, tenant_id")
    .eq("id", conversationId)
    .maybeSingle();

  const { data: initialMessages } = conversation
    ? await supabase
        .from("listing_messages")
        .select("id, sender_id, body, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
    : { data: [] };

  const listing = conversation ? getListingById(conversation.listing_id) : null;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Link
        href="/account/messages"
        className="mb-4 flex items-center gap-2 text-sm text-body hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All messages
      </Link>

      {!conversation || error || !user ? (
        <div className="rounded-card border border-dashed border-line bg-white p-8 text-center">
          <p className="text-body">
            This conversation isn&apos;t available — either it doesn&apos;t exist, or messaging
            isn&apos;t connected to a live Supabase project yet.
          </p>
        </div>
      ) : (
        <>
          {listing && (
            <Link
              href={`/listings/${listing.id}`}
              className="mb-4 flex items-center justify-between gap-4 rounded-card border border-line bg-white px-5 py-3 transition-colors hover:bg-linen"
            >
              <div>
                <p className="font-display text-base text-ink">{getListingTitle(listing)}</p>
                <p className="text-xs text-muted">
                  {listing.roomType} room · ${listing.weeklyRate}/wk
                </p>
              </div>
              {listing.inspectionTime && (
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {listing.inspectionTime}
                </div>
              )}
            </Link>
          )}
          <ChatThread
            conversationId={conversation.id}
            currentUserId={user.id}
            otherPartyName="Property Team"
            initialMessages={initialMessages ?? []}
            table="listing_messages"
            complianceNote="Confirm you'll be at the inspection, ask questions, or reschedule — the property team will reply here."
          />
        </>
      )}
    </div>
  );
}
