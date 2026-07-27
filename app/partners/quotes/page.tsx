import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  quoted: "border-green-600 bg-green-600 text-white",
  pending: "border-line bg-linen text-ink",
  closed: "border-line bg-offwhite text-muted",
};

export default async function PartnersQuotesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: providerRow } = await supabase
    .from("service_providers")
    .select("id, category")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!providerRow) {
    return (
      <div>
        <h1 className="font-display text-3xl text-ink">Quote Requests</h1>
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">No service provider listing found on this account yet.</p>
        </div>
      </div>
    );
  }

  const { data: requests } = await supabase
    .from("service_quote_requests")
    .select("id, property_address, number_of_rooms, status, created_at")
    .eq("category", providerRow.category)
    .order("created_at", { ascending: false });

  const { data: conversations } = await supabase
    .from("quote_conversations")
    .select("request_id, last_message_at, provider_last_read_at")
    .eq("provider_id", providerRow.id);

  const { data: views } = await supabase
    .from("quote_request_views")
    .select("request_id")
    .eq("provider_id", providerRow.id);

  const conversationsByRequest = new Map((conversations ?? []).map((c) => [c.request_id, c]));
  const viewedRequestIds = new Set((views ?? []).map((v) => v.request_id));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Quote Requests</h1>
      <p className="mt-2 text-body">Requests from investors in your category — reply to introduce your quote.</p>

      {(!requests || requests.length === 0) && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-body">No quote requests yet.</p>
        </div>
      )}

      {requests && requests.length > 0 && (
        <div className="mt-6 space-y-3">
          {requests.map((request) => {
            const conversation = conversationsByRequest.get(request.id);
            const unread =
              !viewedRequestIds.has(request.id) ||
              (!!conversation &&
                (!conversation.provider_last_read_at ||
                  new Date(conversation.last_message_at) > new Date(conversation.provider_last_read_at)));
            return (
              <Link key={request.id} href={`/partners/quotes/${request.id}`}>
                <Card className="transition-colors hover:bg-linen">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-3">
                      {unread && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" aria-label="Unread" />
                      )}
                      <div>
                        <p className={cn("font-display text-lg text-ink", unread && "font-semibold")}>
                          {request.property_address}
                        </p>
                        <p className="text-xs text-muted">
                          {request.number_of_rooms ? `${request.number_of_rooms} rooms · ` : ""}
                          Submitted {new Date(request.created_at).toLocaleDateString("en-AU")}
                          {conversation ? " · You've replied" : ""}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn(STATUS_STYLES[request.status])}>{request.status}</Badge>
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
