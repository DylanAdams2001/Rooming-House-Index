import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { serviceCategories } from "@/lib/service-categories";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminBuildingQuoteForm } from "@/components/partners/admin-building-quote-form";
import { DeleteQuoteButton } from "@/components/partners/delete-quote-button";
import { InsuranceDetailsBlock } from "@/components/partners/insurance-details-block";
import { DownloadInsuranceQuoteButton } from "@/components/partners/download-insurance-quote-button";
import { ProductTour } from "@/components/tour/product-tour";
import { ChevronDown } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  quoted: "border-green-600 bg-green-600 text-white",
  pending: "border-line bg-linen text-ink",
  closed: "border-line bg-offwhite text-muted",
};

export default async function AdminQuotesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  if (!isAdmin) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
        <p className="text-body">This page is restricted to admin accounts.</p>
      </div>
    );
  }

  const { data: requests } = await supabase
    .from("service_quote_requests")
    .select("id, property_address, category, status, created_at, user_id, insurance_details")
    .order("created_at", { ascending: false });

  const requestIds = (requests ?? []).map((r) => r.id);
  const investorIds = Array.from(new Set((requests ?? []).map((r) => r.user_id)));

  const [{ data: investors }, { data: quotes }, { data: quoteConversations }] = await Promise.all([
    investorIds.length > 0
      ? supabase.from("users").select("id, full_name, email").in("id", investorIds)
      : Promise.resolve({ data: [] }),
    requestIds.length > 0
      ? supabase
          .from("service_quote_quotes")
          .select("id, request_id, provider_id, provider_name, monthly_fee_pct, flat_fee, accepted, internal_note, visible_at")
          .in("request_id", requestIds)
      : Promise.resolve({ data: [] }),
    requestIds.length > 0
      ? supabase.from("quote_conversations").select("id, request_id, provider_id").in("request_id", requestIds)
      : Promise.resolve({ data: [] }),
  ]);

  const investorById = new Map((investors ?? []).map((i) => [i.id, i]));
  const labelByCategory = new Map(serviceCategories.map((c) => [c.dbCategory, c.label]));
  const quotesByRequest = new Map<string, typeof quotes>();
  for (const q of quotes ?? []) {
    quotesByRequest.set(q.request_id, [...(quotesByRequest.get(q.request_id) ?? []), q]);
  }
  const conversationIdByRequestAndProvider = new Map(
    (quoteConversations ?? []).map((c) => [`${c.request_id}:${c.provider_id}`, c.id])
  );

  return (
    <div>
      <ProductTour
        tourKey="admin-quotes-page"
        intro={{
          title: "All Quotes",
          description:
            "Every quote request across every category, and every quote submitted against it. Click any submitted quote to jump straight into that conversation.",
        }}
        steps={[
          {
            selector: '[data-tour="admin-building-pricing-link"]',
            title: "Manage Building pricing",
            description:
              "The 3 fixed Building price tiers auto-populate on every new request — update them here whenever prices actually change, rather than re-entering them per request.",
          },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-ink" />
          <h1 className="font-display text-3xl text-ink">All Quotes</h1>
        </div>
        <Link
          href="/partners/admin/building-pricing"
          data-tour="admin-building-pricing-link"
          className="text-sm text-ink underline underline-offset-4"
        >
          Manage Building pricing
        </Link>
      </div>
      <p className="mt-2 text-body">
        Every quote request across every category, and the quotes submitted against each one.
      </p>

      {(!requests || requests.length === 0) && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">No quote requests yet.</p>
        </div>
      )}

      {requests && requests.length > 0 && (
        <div className="mt-6 space-y-3">
          {requests.map((request) => {
            const investor = investorById.get(request.user_id);
            const requestQuotes = quotesByRequest.get(request.id) ?? [];
            return (
              <Card key={request.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg text-ink">{request.property_address}</p>
                      <p className="text-xs text-muted">
                        {labelByCategory.get(request.category) ?? request.category} · Investor:{" "}
                        {investor?.full_name ?? investor?.email ?? "Investor"} · Submitted{" "}
                        {new Date(request.created_at).toLocaleDateString("en-AU")}
                      </p>
                    </div>
                    <Badge className={cn(STATUS_STYLES[request.status])}>{request.status}</Badge>
                  </div>

                  {requestQuotes.length === 0 ? (
                    <p className="mt-3 text-sm text-muted">No quotes submitted yet.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {requestQuotes.map((quote) => {
                        const conversationId = conversationIdByRequestAndProvider.get(
                          `${quote.request_id}:${quote.provider_id}`
                        );
                        const fee = quote.monthly_fee_pct
                          ? `${quote.monthly_fee_pct}% of rent per year`
                          : quote.flat_fee ?? "Quote provided";
                        const notYetVisible = new Date(quote.visible_at) > new Date();
                        const row = (
                          <div className="flex items-center justify-between rounded-btn border border-line p-3 text-sm">
                            <span className="flex items-center gap-2 text-ink">
                              {quote.provider_name}
                              {quote.accepted && (
                                <Badge className="border-green-600 bg-green-600 text-white">Accepted</Badge>
                              )}
                              {notYetVisible && (
                                <Badge variant="outline">
                                  Scheduled {new Date(quote.visible_at).toLocaleTimeString("en-AU")}
                                </Badge>
                              )}
                              {quote.internal_note && (
                                <span className="text-xs text-muted">({quote.internal_note})</span>
                              )}
                            </span>
                            <span className="text-muted">{fee}</span>
                          </div>
                        );
                        return (
                          <div key={quote.id} className="flex items-center gap-2">
                            {conversationId ? (
                              <Link
                                href={`/partners/admin/conversations/quote-${conversationId}`}
                                className="block flex-1 transition-colors hover:bg-linen"
                              >
                                {row}
                              </Link>
                            ) : (
                              <div className="flex-1">{row}</div>
                            )}
                            <DeleteQuoteButton quoteId={quote.id} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {request.category === "building" && requestQuotes.length === 0 && (
                    <AdminBuildingQuoteForm requestId={request.id} />
                  )}

                  {request.category === "insurance" && request.insurance_details && (
                    <details className="mt-3 rounded-btn border border-line">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 text-sm text-ink [&::-webkit-details-marker]:hidden">
                        View insurance quote details
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
                      </summary>
                      <div className="border-t border-line p-4">
                        <div className="mb-4 flex justify-end">
                          <DownloadInsuranceQuoteButton
                            propertyAddress={request.property_address}
                            details={request.insurance_details}
                          />
                        </div>
                        <InsuranceDetailsBlock details={request.insurance_details} />
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
