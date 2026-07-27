import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuoteConversationView } from "@/components/messages/quote-conversation-view";
import { MarkReadRefresher } from "@/components/mark-read-refresher";

export default async function PartnersQuoteConversationPage({
  params,
}: {
  params: { requestId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: providerRow } = await supabase
    .from("service_providers")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!providerRow) {
    notFound();
  }

  supabase
    .from("quote_request_views")
    .upsert(
      { request_id: params.requestId, provider_id: providerRow.id, viewed_at: new Date().toISOString() },
      { onConflict: "request_id,provider_id" }
    )
    .then(() => {});

  return (
    <>
      <MarkReadRefresher watch={params.requestId} />
      <QuoteConversationView
        requestId={params.requestId}
        providerId={providerRow.id}
        backHref="/partners/quotes"
        messagesHref={`/partners/quote-messages/${params.requestId}`}
        perspective="provider"
        section="quote"
      />
    </>
  );
}
