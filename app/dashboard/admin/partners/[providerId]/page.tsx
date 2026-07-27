import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServiceCategory, serviceCategories } from "@/lib/service-categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/back-link";
import { cn } from "@/lib/utils";

const LISTING_STATUS_STYLES: Record<string, string> = {
  approved: "border-green-600 bg-green-600 text-white",
  pending: "border-line bg-linen text-ink",
  rejected: "border-red-600 bg-red-600 text-white",
};

export default async function AdminPartnerDetailPage({
  params,
}: {
  params: { providerId: string };
}) {
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

  // Reachable by either slug (real signups) or raw uuid (seeded/unclaimed rows
  // with no slug), matching what the Business Partners list links with. Two
  // separate lookups rather than an .or() filter string built from a raw URL
  // param, which PostgREST's filter grammar would otherwise need escaping for.
  const providerColumns =
    "id, user_id, slug, business_name, category, description, contact_email, contact_phone, status";
  let provider = (
    await supabase.from("service_providers").select(providerColumns).eq("slug", params.providerId).maybeSingle()
  ).data;
  if (!provider) {
    provider = (
      await supabase.from("service_providers").select(providerColumns).eq("id", params.providerId).maybeSingle()
    ).data;
  }

  if (!provider) notFound();

  const category = getServiceCategory(
    serviceCategories.find((c) => c.dbCategory === provider.category)?.slug ?? provider.category
  );

  const isPropertyManager = provider.category === "property_management" && provider.user_id;

  const [{ data: listings }, { data: marketplaceConversations }, { data: quoteConversations }] =
    await Promise.all([
      isPropertyManager
        ? supabase
            .from("listings")
            .select("id, address, suburb_name, room_type, weekly_rate, status")
            .eq("owner_id", provider.user_id!)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
      supabase
        .from("conversations")
        .select("id, last_message_at, users!conversations_investor_id_fkey(email)")
        .eq("provider_id", provider.id)
        .order("last_message_at", { ascending: false }),
      supabase
        .from("quote_conversations")
        .select(
          "id, last_message_at, service_quote_requests(property_address, users(email))"
        )
        .eq("provider_id", provider.id)
        .order("last_message_at", { ascending: false }),
    ]);

  return (
    <div>
      <BackLink href="/dashboard/admin" label="Business Partners" />

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl text-ink">{provider.business_name}</h1>
        <Badge variant="outline">{category?.label ?? provider.category}</Badge>
      </div>
      <p className="mt-2 text-body">{provider.description || "No description provided yet."}</p>
      <p className="mt-1 text-sm text-muted">
        {provider.contact_email}
        {provider.contact_phone ? ` · ${provider.contact_phone}` : ""}
      </p>

      {isPropertyManager && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(!listings || listings.length === 0) && (
              <p className="text-sm text-muted">No listings yet.</p>
            )}
            {(listings ?? []).map((listing) => (
              <div
                key={listing.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-btn border border-line p-4"
              >
                <div>
                  <p className="font-display text-base text-ink">{listing.address}</p>
                  <p className="text-xs text-muted">
                    {listing.suburb_name} · {listing.room_type} · ${listing.weekly_rate}/week
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(LISTING_STATUS_STYLES[listing.status])}>{listing.status}</Badge>
                  <Link
                    href={`/partners/listings/${listing.id}/edit`}
                    className="text-sm text-ink underline underline-offset-4"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Investors who&apos;ve enquired</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(marketplaceConversations ?? []).length === 0 && (quoteConversations ?? []).length === 0 && (
            <p className="text-sm text-muted">No enquiries yet.</p>
          )}
          {(marketplaceConversations ?? []).map((c) => (
            <Link
              key={`conv-${c.id}`}
              href={`/dashboard/admin/conversations/conv-${c.id}`}
              className="flex items-center justify-between rounded-btn border border-line p-3 text-sm transition-colors hover:bg-linen"
            >
              <span className="text-ink">
                {(c.users as unknown as { email: string } | null)?.email ?? "Investor"}
              </span>
              <span className="text-xs text-muted">
                {new Date(c.last_message_at).toLocaleString("en-AU")}
              </span>
            </Link>
          ))}
          {(quoteConversations ?? []).map((c) => {
            const request = c.service_quote_requests as unknown as {
              property_address: string;
              users: { email: string } | null;
            } | null;
            return (
              <Link
                key={`quote-${c.id}`}
                href={`/dashboard/admin/conversations/quote-${c.id}`}
                className="flex items-center justify-between rounded-btn border border-line p-3 text-sm transition-colors hover:bg-linen"
              >
                <span className="text-ink">
                  {request?.users?.email ?? "Investor"} — {request?.property_address ?? "Quote request"}
                </span>
                <span className="text-xs text-muted">
                  {new Date(c.last_message_at).toLocaleString("en-AU")}
                </span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
