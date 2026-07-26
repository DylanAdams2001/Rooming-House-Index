import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChatThread } from "@/components/chat/chat-thread";
import { QuoteRequestSummary } from "@/components/partners/quote-request-summary";
import { QuoteReplyStarter } from "@/components/partners/quote-reply-starter";
import { QuoteSubmissionForm, type ExistingQuote } from "@/components/partners/quote-submission-form";
import { ArrowLeft } from "lucide-react";

// Shared between the provider's view (/partners/quotes/[requestId]) and the
// investor's view (/dashboard/services/[category]/requests/[requestId]) of a
// single provider's thread on one quote request — perspective flips who "mine"
// resolves to and which side's read-state column gets updated.
export async function QuoteConversationView({
  requestId,
  providerId,
  backHref,
  perspective,
}: {
  requestId: string;
  // Which provider's thread on this request — required even from the investor
  // side, since a request can have a separate conversation per provider.
  providerId: string;
  backHref: string;
  perspective: "investor" | "provider";
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: request } = await supabase
    .from("service_quote_requests")
    .select("id, user_id, property_address, number_of_rooms, current_arrangement, notes")
    .eq("id", requestId)
    .maybeSingle();

  if (!request) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-8 text-center">
        <p className="text-body">This quote request isn&apos;t available.</p>
      </div>
    );
  }

  const [{ data: investor }, { data: provider }] = await Promise.all([
    supabase.from("users").select("full_name, email").eq("id", request.user_id).maybeSingle(),
    supabase.from("service_providers").select("business_name").eq("id", providerId).maybeSingle(),
  ]);

  const { data: conversation } = await supabase
    .from("quote_conversations")
    .select("id")
    .eq("request_id", requestId)
    .eq("provider_id", providerId)
    .maybeSingle();

  if (conversation) {
    const readColumn = perspective === "provider" ? "provider_last_read_at" : "investor_last_read_at";
    supabase
      .from("quote_conversations")
      .update({ [readColumn]: new Date().toISOString() })
      .eq("id", conversation.id)
      .then(() => {});
  }

  const { data: initialMessages } = conversation
    ? await supabase
        .from("quote_messages")
        .select("id, sender_id, body, created_at, is_provider")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  let existingQuote: ExistingQuote | null = null;
  if (perspective === "provider") {
    const { data } = await supabase
      .from("service_quote_quotes")
      .select("id, monthly_fee_pct, flat_fee, notes, document_url")
      .eq("request_id", requestId)
      .eq("provider_id", providerId)
      .maybeSingle();
    if (data) {
      existingQuote = {
        id: data.id,
        feeType: data.flat_fee ? "flat" : "monthly_pct",
        monthlyFeePct: data.monthly_fee_pct,
        flatFee: data.flat_fee,
        notes: data.notes,
        documentUrl: data.document_url,
      };
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Link href={backHref} className="mb-4 flex items-center gap-2 text-sm text-body hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <QuoteRequestSummary
        request={{
          propertyAddress: request.property_address,
          numberOfRooms: request.number_of_rooms,
          currentArrangement: request.current_arrangement,
          notes: request.notes,
          investorName: investor?.full_name ?? null,
          investorEmail: investor?.email ?? null,
        }}
      />

      {perspective === "provider" && (
        <QuoteSubmissionForm
          requestId={requestId}
          providerId={providerId}
          businessName={provider?.business_name ?? "Provider"}
          existing={existingQuote}
        />
      )}

      {!conversation ? (
        perspective === "provider" ? (
          <QuoteReplyStarter requestId={requestId} providerId={providerId} />
        ) : (
          <div className="rounded-card border border-dashed border-line bg-white p-8 text-center">
            <p className="text-body">
              {provider?.business_name ?? "This provider"} hasn&apos;t replied to your request yet.
            </p>
          </div>
        )
      ) : (
        <ChatThread
          conversationId={conversation.id}
          currentUserId={user!.id}
          otherPartyName={
            perspective === "provider"
              ? investor?.full_name ?? investor?.email ?? "Investor"
              : provider?.business_name ?? "Provider"
          }
          initialMessages={initialMessages ?? []}
          table="quote_messages"
          businessSideReply={perspective === "provider"}
          complianceNote="Every message here is tied to this specific quote request."
        />
      )}
    </div>
  );
}
