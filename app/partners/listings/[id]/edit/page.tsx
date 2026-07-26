import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/partners/listing-form";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!listing) {
    notFound();
  }

  const postcodeMatch = listing.suburb_id.match(/(\d+)$/);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Edit Room</h1>
      <p className="mt-2 text-body">{listing.address}</p>

      <div className="mt-8 max-w-2xl">
        <ListingForm
          initial={{
            id: listing.id,
            address: listing.address,
            suburbName: listing.suburb_name,
            postcode: postcodeMatch?.[1] ?? "",
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
