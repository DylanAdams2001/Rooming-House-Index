import { ListingForm } from "@/components/partners/listing-form";

export default function NewListingPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Add a Room</h1>
      <p className="mt-2 text-body">
        New rooms go live once reviewed — you'll see the status on your listings page.
      </p>

      <div className="mt-8 max-w-2xl">
        <ListingForm />
      </div>
    </div>
  );
}
