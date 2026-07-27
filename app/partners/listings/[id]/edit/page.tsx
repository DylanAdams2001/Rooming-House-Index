import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/partners/listing-form";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No owner_id filter here — RLS already scopes this correctly (an owner can
  // only ever see their own row; admin can see and edit any listing via the
  // "Admins can view and manage all listings" policy), so this page works
  // both for a property manager editing their own room and for admin editing
  // any property manager's listing from the Business Partners directory.
  const { data: listing } = await supabase.from("listings").select("*").eq("id", params.id).maybeSingle();

  if (!listing) {
    notFound();
  }

  // Only override the post-save redirect when admin is editing someone
  // else's listing — a property manager editing their own still lands back
  // on their own "my rooms" list as before. Admin lands on the All Listings
  // page (where every listing across every property manager lives), not the
  // Business Partners directory this listing has nothing to do with.
  const redirectTo = user?.id !== listing.owner_id ? "/partners/admin/listings" : "/partners/listings";

  const postcodeMatch = listing.suburb_id.match(/(\d+)$/);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Edit Room</h1>
      <p className="mt-2 text-body">{listing.address}</p>

      <div className="mt-8 max-w-2xl">
        <ListingForm
          redirectTo={redirectTo}
          initial={{
            id: listing.id,
            address: listing.address,
            suburbName: listing.suburb_name,
            postcode: postcodeMatch?.[1] ?? "",
            lat: listing.lat ?? undefined,
            lng: listing.lng ?? undefined,
            roomType: listing.room_type,
            weeklyRate: String(listing.weekly_rate),
            availableFrom: listing.available_from,
            description: listing.description,
            inspectionTime: listing.inspection_time ?? "",
            photos: listing.photos ?? [],
          }}
        />
      </div>
    </div>
  );
}
