import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingDeleteButton } from "@/components/partners/listing-delete-button";
import { Home, Plus } from "lucide-react";
import { ProductTour } from "@/components/tour/product-tour";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  approved: "border-green-600 bg-green-600 text-white",
  pending: "border-line bg-linen text-ink",
  rejected: "border-red-600 bg-red-600 text-white",
};

export default async function PartnersListingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, address, suburb_name, room_type, weekly_rate, status, created_at")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <ProductTour
        tourKey="partners-listings-page"
        intro={{
          title: "Rooms",
          description:
            "Every room you've listed, with its status — pending, approved, or rejected. Listings publish immediately once saved. Edit pricing or details any time.",
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Rooms</h1>
          <p className="mt-2 text-body">Manage the rooms you've listed.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/partners/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            Add a room
          </Link>
        </Button>
      </div>

      {(!listings || listings.length === 0) && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <Home className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-body">No rooms listed yet.</p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/partners/listings/new">Add your first room</Link>
          </Button>
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
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/partners/listings/${listing.id}/edit`}>Edit</Link>
                  </Button>
                  <ListingDeleteButton listingId={listing.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
