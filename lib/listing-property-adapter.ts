import type { PropertyRental } from "@/lib/property-rentals";

// One row from public.listings, just the columns the adapter needs — callers
// select a superset and TS structurally narrows it down.
export type ListingForPropertyRental = {
  id: string;
  address: string;
  suburb_id: string;
  lat: number | null;
  lng: number | null;
  room_type: string;
  weekly_rate: number;
  rented_weekly_rate: number | null;
  status: string;
  created_at: string;
  rented_at: string | null;
};

// Converts a real listings row into the same PropertyRental shape the
// hand-entered data (lib/property-rentals.ts) already uses, so every piece of
// UI built for that system — map markers, suburb-page cards, the per-property
// detail page — works unchanged for real listings too. A listing is always a
// single room, so it's always a one-room PropertyRental.
export function listingToPropertyRental(listing: ListingForPropertyRental): PropertyRental | null {
  if (listing.lat === null || listing.lng === null) return null;

  const isRented = listing.status === "rented" && listing.rented_weekly_rate !== null;

  return {
    id: listing.id,
    address: listing.address,
    suburbId: listing.suburb_id,
    lat: listing.lat,
    lng: listing.lng,
    rooms: [
      isRented
        ? {
            label: listing.room_type,
            weeklyRate: listing.rented_weekly_rate as number,
            status: "tenanted",
            note: `Originally advertised at $${listing.weekly_rate}/wk`,
          }
        : {
            label: listing.room_type,
            weeklyRate: listing.weekly_rate,
            status: "vacant",
            note: "Advertised, not yet tenanted",
          },
    ],
    avgWeeklyRate: isRented ? (listing.rented_weekly_rate as number) : listing.weekly_rate,
    sourceNote: isRented
      ? `Real listing on the platform, rented ${new Date(listing.rented_at as string).toLocaleDateString("en-AU")}.`
      : "Real listing on the platform, currently advertised.",
    dateAdded: listing.created_at,
  };
}

export function listingsToPropertyRentals(listings: ListingForPropertyRental[]): PropertyRental[] {
  return listings.map(listingToPropertyRental).filter((p): p is PropertyRental => p !== null);
}
