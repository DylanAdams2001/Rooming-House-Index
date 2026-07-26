import { createClient } from "@/lib/supabase/server";
import type { RoomListing } from "@/lib/mock-listings";
import { LISTING_COLUMNS, mapListingRow } from "@/lib/listings-shared";

export async function getApprovedListings(): Promise<RoomListing[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapListingRow);
}

export async function getApprovedListingById(id: string): Promise<RoomListing | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  return data ? mapListingRow(data) : null;
}
