import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChatThread } from "@/components/chat/chat-thread";
import { QuoteRequestSummary } from "@/components/partners/quote-request-summary";
import { QuoteReplyStarter } from "@/components/partners/quote-reply-starter";
import { QuoteSubmissionForm, type ExistingQuote } from "@/components/partners/quote-submission-form";
import { QuoteCard } from "@/components/quote-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";

// Shared between the provider's view (/partners/quotes/[requestId] and
// /partners/quote-messages/[requestId]) and the investor's view
// (/dashboard/services/.../requests/[requestId]/[providerId] and
// /dashboard/quote-messages/[requestId]/[providerId]) of a single provider's
// thread on one quote request. `section` splits the two concerns that used
// to live on one page: "quote" shows the request + the formal price/document
// (no chat at all), "messages" shows the conversation only (no quote tools) —
// each reachable from its own portal tab, not nested inside the other.
export async function QuoteConversationView({
  requestId,
  providerId,
  backHref,
  messagesHref,
  perspective,
  section,
}: {
  requestId: string;
  // Which provider's thread on this request — required even from the investor
  // side, since a request can have a separate conversation per provider.
  providerId: string;
  backHref: string;
  // Only used when section="quote" — link to this same request/provider pair's
  // Messages-tab conversation, so there's still a way to jump into the chat.
  messagesHref?: string;
  perspective: "investor" | "provider";
  section: "quote" | "messages";
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

  if (conversation && section === "messages") {
    const readColumn = perspective === "provider" ? "provider_last_read_at" : "investor_last_read_at";
    supabase
      .from("quote_conversations")
      .update({ [readColumn]: new Date().toISOString() })
      .eq("id", conversation.id)
      .then(() => {});
  }

  const { data: initialMessages } =
    conversation && section === "messages"
      ? await supabase
          .from("quote_messages")
          .select("id, sender_id, body, created_at, is_provider")
          .eq("conversation_id", conversation.id)
          .order("created_at", { ascending: true })
      : { data: [] };

  const { data: submittedQuote } = await supabase
    .from("service_quote_quotes")
    .select("id, monthly_fee_pct, flat_fee, notes, document_url")
    .eq("request_id", requestId)
    .eq("provider_id", providerId)
    .maybeSingle();

  const existingQuote: ExistingQuote | null = submittedQuote
    ? {
        id: submittedQuote.id,
        feeType: submittedQuote.flat_fee ? "flat" : "monthly_pct",
        monthlyFeePct: submittedQuote.monthly_fee_pct,
        flatFee: submittedQuote.flat_fee,
        notes: submittedQuote.notes,
        documentUrl: submittedQuote.document_url,
      }
    : null;

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

      {section === "quote" && (
        <>
          {perspective === "provider" && (
            <QuoteSubmissionForm
              requestId={requestId}
              providerId={providerId}
              businessName={provider?.business_name ?? "Provider"}
              existing={existingQuote}
            />
          )}

          {perspective === "investor" && submittedQuote && (
            <div className="mb-4">
              <QuoteCard
                quote={{
                  id: submittedQuote.id,
                  providerName: provider?.business_name ?? "Provider",
                  monthlyFeePct: submittedQuote.monthly_fee_pct,
                  flatFee: submittedQuote.flat_fee,
                  notes: submittedQuote.notes,
                  documentUrl: submittedQuote.document_url,
                }}
              />
            </div>
          )}

          {messagesHref && (
            <Button asChild variant="outline">
              <Link href={messagesHref}>
                <MessageCircle className="mr-2 h-4 w-4" />
                {conversation ? "View conversation" : "Message about this request"}
              </Link>
            </Button>
          )}
        </>
      )}

      {section === "messages" &&
        (!conversation ? (
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
        ))}
    </div>
  );
}
