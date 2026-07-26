import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Investor's inbox of quote-request conversations across every category and
// provider — RLS already scopes quote_conversations to ones tied to this
// investor's own requests, no extra filter needed. Separate from the
// Services page's request cards, which now only show the request/quote
// itself, not any messaging.
export default async function DashboardQuoteMessagesPage() {
  const supabase = createClient();

  const { data: conversations } = await supabase
    .from("quote_conversations")
    .select(
      "id, request_id, provider_id, last_message_at, investor_last_read_at, service_quote_requests(property_address), service_providers(business_name)"
    )
    .order("last_message_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Messages</h1>
      <p className="mt-2 text-body">Conversations with providers about your quote requests.</p>

      {(!conversations || conversations.length === 0) && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-body">No conversations yet.</p>
          <p className="mt-1 text-sm text-muted">
            Once a provider replies to one of your quote requests, it&apos;ll show up here.
          </p>
        </div>
      )}

      {conversations && conversations.length > 0 && (
        <div className="mt-6 space-y-3">
          {conversations.map((c) => {
            const unread =
              !c.investor_last_read_at || new Date(c.last_message_at) > new Date(c.investor_last_read_at);
            const address =
              (c.service_quote_requests as unknown as { property_address: string } | null)
                ?.property_address ?? "Quote request";
            const providerName =
              (c.service_providers as unknown as { business_name: string } | null)?.business_name ??
              "Provider";
            return (
              <Link key={c.id} href={`/dashboard/quote-messages/${c.request_id}/${c.provider_id}`}>
                <Card className="transition-colors hover:bg-linen">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      {unread && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-ink" aria-label="Unread" />
                      )}
                      <div>
                        <p className={cn("font-display text-lg text-ink", unread && "font-semibold")}>
                          {providerName}
                        </p>
                        <p className="text-xs text-muted">
                          {address} · Last message {new Date(c.last_message_at).toLocaleString("en-AU")}
                        </p>
                      </div>
                    </div>
                    <MessageCircle className="h-5 w-5 text-muted" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
