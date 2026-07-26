import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ListChecks, Clock, CheckCircle2 } from "lucide-react";

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
  const showMessages = role === "provider" || role === "admin";
  const showListings = role === "property_manager" || role === "admin";

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
