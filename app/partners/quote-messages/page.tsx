import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Inbox of conversations this provider has actually started, separate from
// /partners/quotes (which browses every open request in their category
// regardless of whether they've replied yet) — mirrors the Rooms/Enquiries
// split property managers already have.
export default async function PartnersQuoteMessagesPage() {
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
    return (
      <div>
        <h1 className="font-display text-3xl text-ink">Messages</h1>
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">No service provider listing found on this account yet.</p>
        </div>
      </div>
    );
  }

  const { data: conversations } = await supabase
    .from("quote_conversations")
    .select(
      "id, request_id, last_message_at, provider_last_read_at, service_quote_requests(property_address)"
    )
    .eq("provider_id", providerRow.id)
    .order("last_message_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Messages</h1>
      <p className="mt-2 text-body">Conversations you've started on quote requests.</p>

      {(!conversations || conversations.length === 0) && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-body">No conversations yet.</p>
          <p className="mt-1 text-sm text-muted">
            Reply to a request from{" "}
            <Link href="/partners/quotes" className="underline underline-offset-4">
              Quote Requests
            </Link>{" "}
            to start one.
          </p>
        </div>
      )}

      {conversations && conversations.length > 0 && (
        <div className="mt-6 space-y-3">
          {conversations.map((c) => {
            const unread =
              !c.provider_last_read_at || new Date(c.last_message_at) > new Date(c.provider_last_read_at);
            const address =
              (c.service_quote_requests as unknown as { property_address: string } | null)
                ?.property_address ?? "Quote request";
            return (
              <Link key={c.id} href={`/partners/quotes/${c.request_id}`}>
                <Card className="transition-colors hover:bg-linen">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      {unread && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-ink" aria-label="Unread" />
                      )}
                      <div>
                        <p className={cn("font-display text-lg text-ink", unread && "font-semibold")}>
                          {address}
                        </p>
                        <p className="text-xs text-muted">
                          Last message {new Date(c.last_message_at).toLocaleString("en-AU")}
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
