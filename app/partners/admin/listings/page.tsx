import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Hint } from "@/components/hints/hint";

const STATUS_STYLES: Record<string, string> = {
  approved: "border-green-600 bg-green-600 text-white",
  pending: "border-line bg-linen text-ink",
  rejected: "border-red-600 bg-red-600 text-white",
};

export default async function AdminListingsPage() {
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

  const { data: listings } = await supabase
    .from("listings")
    .select("id, address, suburb_name, room_type, weekly_rate, status, owner_id, created_at")
    .order("created_at", { ascending: false });

  const ownerIds = Array.from(new Set((listings ?? []).map((l) => l.owner_id).filter(Boolean))) as string[];
  const { data: owners } =
    ownerIds.length > 0
      ? await supabase
          .from("service_providers")
          .select("user_id, business_name")
          .in("user_id", ownerIds)
          .eq("category", "property_management")
      : { data: [] };

  const ownerNameByUserId = new Map((owners ?? []).map((o) => [o.user_id, o.business_name]));

  return (
    <div>
      <Hint hintKey="admin-listings" title="All Listings">
        <p>Every room listed across every property manager, in one place.</p>
        <p>Edit any listing directly — pricing, availability, anything — no need to go through the owner.</p>
      </Hint>

      <div className="flex items-center gap-2">
        <Home className="h-6 w-6 text-ink" />
        <h1 className="font-display text-3xl text-ink">All Listings</h1>
      </div>
      <p className="mt-2 text-body">
        Every room listed across every property manager — edit any of them directly.
      </p>

      {(!listings || listings.length === 0) && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">No listings yet.</p>
        </div>
      )}

      {listings && listings.length > 0 && (
        <div className="mt-6 space-y-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg text-ink">{listing.address}</p>
                    <Badge className={cn(STATUS_STYLES[listing.status])}>{listing.status}</Badge>
                  </div>
                  <p className="text-sm text-muted">
                    {listing.suburb_name} · {listing.room_type} · ${listing.weekly_rate}/week
                  </p>
                  <p className="text-xs text-muted">
                    {listing.owner_id
                      ? ownerNameByUserId.get(listing.owner_id) ?? "Owner account"
                      : "No owner (seeded listing)"}
                  </p>
                </div>
                <Link
                  href={`/partners/listings/${listing.id}/edit`}
                  className="text-sm text-ink underline underline-offset-4"
                >
                  Edit
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
