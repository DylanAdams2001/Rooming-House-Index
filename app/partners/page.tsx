import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { serviceCategories } from "@/lib/service-categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, ListChecks, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  approved: "border-green-600 bg-green-600 text-white",
  pending: "border-line bg-linen text-ink",
  rejected: "border-red-600 bg-red-600 text-white",
};

export default async function PartnersHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .maybeSingle();

  const role = profile?.role;

  // Admin's whole reason for being in this portal is to manage every partner
  // brought on — not their own (nonexistent) messages/listings — so they get
  // the Business Partners directory here instead of the per-account stat tiles.
  if (role === "admin") {
    const { data: providers } = await supabase
      .from("service_providers")
      .select("id, slug, business_name, category, contact_email, status")
      .order("category", { ascending: true })
      .order("business_name", { ascending: true });

    const labelByCategory = new Map(serviceCategories.map((c) => [c.dbCategory, c.label]));

    return (
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-ink" />
          <h1 className="font-display text-3xl text-ink">Business Partners</h1>
        </div>
        <p className="mt-2 text-body">
          Every provider and property manager account, across every category — click into one to
          see their listings and who&apos;s enquired with them.
        </p>

        {(!providers || providers.length === 0) && (
          <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
            <p className="text-body">No business partners signed up yet.</p>
          </div>
        )}

        {providers && providers.length > 0 && (
          <div className="mt-6 space-y-3">
            {providers.map((p) => (
              <Link key={p.id} href={`/partners/admin/partners/${p.slug ?? p.id}`}>
                <Card className="transition-colors hover:bg-linen">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-display text-lg text-ink">{p.business_name}</p>
                      <p className="text-xs text-muted">
                        {labelByCategory.get(p.category) ?? p.category} · {p.contact_email}
                      </p>
                    </div>
                    <Badge className={cn(STATUS_STYLES[p.status])}>{p.status}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const showMessages = role === "provider";
  const showListings = role === "property_manager";

  let conversationCount = 0;
  if (showMessages) {
    const { data: providerRows } = await supabase
      .from("service_providers")
      .select("id")
      .eq("user_id", user!.id);
    const providerIds = (providerRows ?? []).map((p) => p.id);
    if (providerIds.length > 0) {
      const { count } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .in("provider_id", providerIds);
      conversationCount = count ?? 0;
    }
  }

  let pendingListings = 0;
  let approvedListings = 0;
  let enquiryCount = 0;
  if (showListings) {
    const { data: ownedListings } = await supabase
      .from("listings")
      .select("id")
      .eq("owner_id", user!.id);
    const listingIds = (ownedListings ?? []).map((l) => l.id);
    if (listingIds.length > 0) {
      const { count } = await supabase
        .from("listing_conversations")
        .select("id", { count: "exact", head: true })
        .in("listing_id", listingIds);
      enquiryCount = count ?? 0;
    }

    const { count: pending } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user!.id)
      .eq("status", "pending");
    pendingListings = pending ?? 0;

    const { count: approved } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user!.id)
      .eq("status", "approved");
    approvedListings = approved ?? 0;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Partner Portal</h1>
      <p className="mt-2 text-body">Reply to messages and manage your listings from one place.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {showMessages && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted">Open Conversations</CardTitle>
              <MessageCircle className="h-5 w-5 text-ink" />
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl text-ink">{conversationCount}</div>
              <Button asChild size="sm" className="mt-3 w-full">
                <Link href="/partners/messages">View Messages</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {showListings && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted">Pending Review</CardTitle>
                <Clock className="h-5 w-5 text-ink" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-3xl text-ink">{pendingListings}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted">Live Listings</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-ink" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-3xl text-ink">{approvedListings}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted">Room Enquiries</CardTitle>
                <MessageCircle className="h-5 w-5 text-ink" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-3xl text-ink">{enquiryCount}</div>
                <Button asChild size="sm" className="mt-3 w-full">
                  <Link href="/partners/enquiries">View Enquiries</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted">Manage Rooms</CardTitle>
                <ListChecks className="h-5 w-5 text-ink" />
              </CardHeader>
              <CardContent>
                <Button asChild size="sm" className="w-full">
                  <Link href="/partners/listings">Rooms</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
