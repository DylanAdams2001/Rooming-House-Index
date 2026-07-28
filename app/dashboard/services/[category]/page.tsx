import { notFound } from "next/navigation";
import { getServiceCategory } from "@/lib/service-categories";
import { ProviderCard, type RealProvider } from "@/components/provider-card";
import { ServiceQuoteRequestForm } from "@/components/service-quote-request-form";
import { QuoteCard } from "@/components/quote-card";
import { BuildingInclusionsContent, InclusionsTextList } from "@/components/partners/building-inclusions-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { Hint } from "@/components/hints/hint";
import { cn } from "@/lib/utils";

// Only the categories we have an actual screenshot for — every other
// quoteBased category still gets the hint, just text-only.
const SERVICE_HINT_IMAGES: Record<string, string> = {
  insurance: "/hints/services-insurance.jpg",
  property_management: "/hints/services-property-management.jpg",
  building: "/hints/services-building.jpg",
};

// Both branches below now render real, per-request Supabase data (quote
// requests for the quoteBased categories, live approved providers for
// everyone else) — nothing left here for generateStaticParams to prerender.

type Quote = {
  id: string;
  provider_name: string;
  monthly_fee_pct: number | null;
  flat_fee: string | null;
  notes: string | null;
  document_url: string | null;
  inclusions_text: string | null;
  created_at: string;
  accepted: boolean;
  visible_at: string;
};

type Request = {
  id: string;
  property_address: string;
  number_of_rooms: number | null;
  status: "pending" | "quoted" | "closed";
  created_at: string;
  quotes_viewed_at: string | null;
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
        .select(
          "id, property_address, number_of_rooms, status, created_at, quotes_viewed_at, service_quote_quotes(*)"
        )
        .eq("user_id", user.id)
        .eq("category", category.dbCategory)
        .order("created_at", { ascending: false });
      requests = (data ?? []) as unknown as Request[];

      // Admin-managed categories (Building) can batch-enter all 3 price
      // options at once but have them appear staggered — filter out
      // anything not due to be visible yet rather than dumping them all in
      // at once.
      const now = Date.now();
      requests = requests.map((r) => ({
        ...r,
        service_quote_quotes: r.service_quote_quotes.filter((q) => new Date(q.visible_at).getTime() <= now),
      }));
    }

    return (
      <div>
        <BackLink href="/dashboard/services" label="Services" />

        <Hint
          hintKey={`dashboard-services-${category.dbCategory}`}
          title={category.label}
          image={SERVICE_HINT_IMAGES[category.dbCategory]}
        >
          <p>{category.description}</p>
          <p>Submit your details once and we&apos;ll bring back quotes here — no need to shop around yourself.</p>
        </Hint>

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
              requests.map((request) => {
                const hasNewQuote =
                  request.service_quote_quotes.length > 0 &&
                  (!request.quotes_viewed_at ||
                    request.service_quote_quotes.some(
                      (q) => new Date(q.created_at) > new Date(request.quotes_viewed_at!)
                    ));
                return (
                  <Card key={request.id}>
                    <CardHeader className="flex flex-row items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {hasNewQuote && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" aria-label="Unread" />
                        )}
                        <div>
                          <CardTitle className={cn(hasNewQuote && "font-semibold")}>
                            {request.property_address}
                          </CardTitle>
                          <p className="mt-1 text-sm text-muted">
                            {request.number_of_rooms ? `${request.number_of_rooms} rooms · ` : ""}
                            Submitted {new Date(request.created_at).toLocaleDateString("en-AU")}
                          </p>
                        </div>
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
                            <QuoteCard
                              key={quote.id}
                              requestId={request.id}
                              anyAccepted={request.service_quote_quotes.some((q) => q.accepted)}
                              inclusions={
                                category.dbCategory === "building" ? (
                                  quote.inclusions_text ? (
                                    <InclusionsTextList text={quote.inclusions_text} />
                                  ) : (
                                    <BuildingInclusionsContent />
                                  )
                                ) : undefined
                              }
                              nextStepsContact={category.dbCategory === "building" ? "the builder" : undefined}
                              priceCaption={
                                category.dbCategory === "building"
                                  ? "This builder's price for your project — full inclusions below."
                                  : undefined
                              }
                              quote={{
                                id: quote.id,
                                providerName: quote.provider_name,
                                monthlyFeePct: quote.monthly_fee_pct,
                                flatFee: quote.flat_fee,
                                notes: quote.notes,
                                documentUrl: quote.document_url,
                                accepted: quote.accepted,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  const supabase = createClient();
  const { data: providerRows } = await supabase
    .from("service_providers")
    .select(
      "slug, business_name, description, contact_email, contact_phone, coverage_areas, license_number, credentials"
    )
    .eq("category", category.dbCategory)
    .eq("status", "approved")
    .order("business_name", { ascending: true });

  const providers = (providerRows ?? []) as RealProvider[];

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
            <ProviderCard key={provider.slug} provider={provider} categorySlug={category.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
