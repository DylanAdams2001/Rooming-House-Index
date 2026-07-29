"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LISTING_COLUMNS, mapListingRow } from "@/lib/listings-shared";
import type { RoomListing } from "@/lib/mock-listings";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { useSavedListings } from "@/lib/use-saved-listings";
import { X } from "lucide-react";
import { ProductTour } from "@/components/tour/product-tour";

export default function SavedListingsPage() {
  const supabase = createClient();
  const { savedIds, loaded, removeSaved } = useSavedListings();
  const [saved, setSaved] = useState<RoomListing[]>([]);

  useEffect(() => {
    if (!loaded) return;
    if (savedIds.length === 0) {
      setSaved([]);
      return;
    }
    supabase
      .from("listings")
      .select(LISTING_COLUMNS)
      .in("id", savedIds)
      .then(({ data }) => setSaved((data ?? []).map(mapListingRow)));
  }, [loaded, savedIds]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <ProductTour
        tourKey="account-saved-listings-page"
        intro={{
          title: "Saved Listings",
          description:
            "Rooms you've bookmarked while browsing — tap the heart/save icon on any listing to add one. Come back here any time to compare your shortlist before enquiring.",
        }}
      />

      <h1 className="font-display text-3xl text-ink">Saved Listings</h1>
      <p className="mt-2 text-body">Rooms you&apos;re interested in going to inspect or renting.</p>

      {loaded && saved.length === 0 && (
        <div className="mt-10 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">You haven&apos;t saved any listings yet.</p>
          <Button asChild className="mt-4">
            <Link href="/listings">Browse Listings</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {saved.map((listing) => (
          <div key={listing.id} className="relative">
            <button
              type="button"
              onClick={() => removeSaved(listing.id)}
              aria-label="Remove from saved"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition-colors hover:bg-linen"
            >
              <X className="h-4 w-4" />
            </button>
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </div>
  );
}
