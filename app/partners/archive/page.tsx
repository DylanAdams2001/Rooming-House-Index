import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Archive } from "lucide-react";
import { ProductTour } from "@/components/tour/product-tour";

export default async function ArchivedListingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let allowed = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    allowed = profile?.role === "admin" || profile?.role === "property_manager";
  }

  if (!allowed) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
        <p className="text-body">This page is restricted to property manager and admin accounts.</p>
      </div>
    );
  }

  // Everyone with access sees every rented room platform-wide — real closed-rent
  // data is useful market context regardless of who originally listed it.
  const { data: listings } = await supabase
    .from("listings")
    .select("id, address, suburb_name, room_type, weekly_rate, rented_weekly_rate, rented_at")
    .eq("status", "rented")
    .order("rented_at", { ascending: false });

  return (
    <div>
      <ProductTour
        tourKey="partners-archive-page"
        intro={{
          title: "Archived Listings",
          description:
            "Every room that's actually been rented, platform-wide, with the real closed rate — not just the advertised asking price.",
        }}
      />

      <div className="flex items-center gap-2">
        <Archive className="h-6 w-6 text-ink" />
        <h1 className="font-display text-3xl text-ink">Archived Listings</h1>
      </div>
      <p className="mt-2 text-body">
        Rooms that have been rented, with the actual weekly rate they were rented for.
      </p>

      {(!listings || listings.length === 0) && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">No rented rooms yet.</p>
        </div>
      )}

      {listings && listings.length > 0 && (
        <div className="mt-6 space-y-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-display text-lg text-ink">{listing.address}</p>
                  <p className="text-sm text-muted">
                    {listing.suburb_name} · {listing.room_type} · rented at $
                    {listing.rented_weekly_rate}/week (advertised ${listing.weekly_rate}/week)
                  </p>
                </div>
                <p className="text-sm text-muted">
                  {listing.rented_at
                    ? new Date(listing.rented_at).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
