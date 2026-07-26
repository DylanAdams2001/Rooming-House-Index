import { notFound } from "next/navigation";
import { getServiceCategory, serviceCategories } from "@/lib/service-categories";
import { getProvidersByCategory } from "@/lib/mock-providers";
import { ProviderCard } from "@/components/provider-card";
import { ServiceQuoteRequestForm } from "@/components/service-quote-request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Quote-based categories (insurance, property-management) render user-specific
// request data at request time, so they're excluded from static generation —
// dynamicParams (default true) lets Next render them on demand instead.
export function generateStaticParams() {
  return serviceCategories
    .filter((c) => !c.comingSoon && !c.quoteBased)
    .map((c) => ({ category: c.slug }));
}

type Quote = {
  id: string;
  provider_name: string;
  monthly_fee_pct: number | null;
  flat_fee: string | null;
  notes: string | null;
  document_url: string | null;
};

type Request = {
  id: string;
  property_address: string;
  number_of_rooms: number | null;
  status: "pending" | "quoted" | "closed";
  created_at: string;
  service_quote_quotes: Quote[];
};

const STATUS_LABEL: Record<Request["status"], string> = {
  pending: "Sourcing quotes",
  quoted: "Quotes ready",
  closed: "Closed",
};

export default async function ServiceCategoryPage({ params }: { params: { category: string } }) {
  const category = getServiceCategory(params.category);

  if (!category || category.comingSoon) {
    notFound();
  }

  if (category.quoteBased) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let requests: Request[] = [];
    if (user) {
      const { data } = await supabase
        .from("service_quote_requests")
        .select("id, property_address, number_of_rooms, status, created_at, service_quote_quotes(*)")
        .eq("user_id", user.id)
        .eq("category", category.dbCategory)
        .order("created_at", { ascending: false });
      requests = (data ?? []) as unknown as Request[];
    }

    const requestIds = requests.map((r) => r.id);
    let conversationsByRequest = new Map<
      string,
      { id: string; provider_id: string; last_message_at: string; investor_last_read_at: string | null; business_name: string }[]
    >();
    if (requestIds.length > 0) {
      const { data: conversations } = await supabase
        .from("quote_conversations")
        .select("id, request_id, provider_id, last_message_at, investor_last_read_at, service_providers(business_name)")
        .in("request_id", requestIds);

      for (const c of (conversations ?? []) as unknown as {
        id: string;
        request_id: string;
        provider_id: string;
        last_message_at: string;
        investor_last_read_at: string | null;
        service_providers: { business_name: string } | null;
      }[]) {
        const list = conversationsByRequest.get(c.request_id) ?? [];
        list.push({
          id: c.id,
          provider_id: c.provider_id,
          last_message_at: c.last_message_at,
          investor_last_read_at: c.investor_last_read_at,
          business_name: c.service_providers?.business_name ?? "Provider",
        });
        conversationsByRequest.set(c.request_id, list);
      }
    }

    return (
      <div>
        <BackLink href="/dashboard/services" label="Services" />

        <h1 className="font-display text-3xl text-ink">{category.label}</h1>
        <p className="mt-2 max-w-2xl text-body">{category.description}</p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Request quotes</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <ServiceQuoteRequestForm userId={user.id} category={category.dbCategory} />
              ) : (
                <p className="text-sm text-body">Log in to request quotes.</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4 lg:col-span-2">
            {requests.length === 0 ? (
              <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
                <p className="text-body">No quote requests yet.</p>
                <p className="mt-1 text-sm text-muted">
                  Submit your details and we&apos;ll be in touch with quotes shortly.
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <div>
                      <CardTitle>{request.property_address}</CardTitle>
                      <p className="mt-1 text-sm text-muted">
                        {request.number_of_rooms ? `${request.number_of_rooms} rooms · ` : ""}
                        Submitted {new Date(request.created_at).toLocaleDateString("en-AU")}
                      </p>
                    </div>
                    <Badge variant={request.status === "quoted" ? "high" : "outline"}>
                      {STATUS_LABEL[request.status]}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {request.service_quote_quotes.length === 0 ? (
                      <p className="text-sm text-body">
                        We&apos;re sourcing quotes — this usually takes a few business days.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {request.service_quote_quotes.map((quote) => (
                          <div
                            key={quote.id}
                            className="flex flex-col gap-1 rounded-btn border border-line p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-display text-base text-ink">
                                {quote.provider_name}
                              </p>
                              {quote.notes && (
                                <p className="mt-0.5 text-sm text-body">{quote.notes}</p>
                              )}
                              {quote.document_url && (
                                <a
                                  href={quote.document_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-1 inline-block text-xs text-ink underline underline-offset-4"
                                >
                                  View quote document
                                </a>
                              )}
                            </div>
                            <p className="font-display text-lg text-ink">
                              {quote.monthly_fee_pct
                                ? `${quote.monthly_fee_pct}% of rent`
                                : quote.flat_fee ?? "Quote provided"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {(conversationsByRequest.get(request.id) ?? []).length > 0 && (
                      <div className="mt-4 space-y-2 border-t border-line pt-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted">
                          Provider replies
                        </p>
                        {(conversationsByRequest.get(request.id) ?? []).map((c) => {
                          const unread =
                            !c.investor_last_read_at ||
                            new Date(c.last_message_at) > new Date(c.investor_last_read_at);
                          return (
                            <Link
                              key={c.id}
                              href={`/dashboard/services/${category.slug}/requests/${request.id}/${c.provider_id}`}
                              className="flex items-center justify-between gap-3 rounded-btn border border-line px-4 py-2.5 text-sm transition-colors hover:bg-linen"
                            >
                              <span className={cn("flex items-center gap-2", unread && "font-semibold text-ink")}>
                                {unread && <span className="h-2 w-2 rounded-full bg-ink" aria-hidden="true" />}
                                {c.business_name}
                              </span>
                              <MessageCircle className="h-4 w-4 text-muted" />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  const providers = getProvidersByCategory(category.dbCategory);

  return (
    <div>
      <BackLink href="/dashboard/services" label="Services" />

      <div>
        <h1 className="font-display text-3xl text-ink">{category.label}</h1>
        <p className="mt-2 text-body">{category.description}</p>
      </div>

      <p className="mt-6 text-sm text-muted">
        {providers.length} provider{providers.length === 1 ? "" : "s"} found
      </p>

      {providers.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">No providers listed in this category yet.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} categorySlug={category.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
