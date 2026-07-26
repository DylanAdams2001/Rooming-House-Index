import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuoteConversationView } from "@/components/messages/quote-conversation-view";

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

  return (
    <QuoteConversationView
      requestId={params.requestId}
      providerId={providerRow.id}
      backHref="/partners/quotes"
      perspective="provider"
    />
  );
}
