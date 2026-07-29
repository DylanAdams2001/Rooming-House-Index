import { ListingForm } from "@/components/partners/listing-form";
import { ProductTour } from "@/components/tour/product-tour";

export default function NewListingPage() {
  return (
    <div>
      <ProductTour
        tourKey="partners-listings-new-page"
        intro={{
          title: "Add a Room",
          description: "Your listing goes live on the site as soon as you submit it — here's what each part does.",
        }}
        steps={[
          {
            selector: '[data-tour="listing-address"]',
            title: "Address",
            description:
              "Start typing and pick your address from the dropdown suggestions — this fills in the suburb and postcode automatically, and unlocks the map with Street View on the listing page.",
          },
          {
            selector: '[data-tour="listing-room-type"]',
            title: "Room type & rate",
            description: "Single or Shared, and the weekly rate a tenant would pay.",
          },
          {
            selector: '[data-tour="listing-photos"]',
            title: "Photos",
            description: "Add a few real photos — listings with photos get far more enquiries.",
          },
        ]}
      />

      <h1 className="font-display text-3xl text-ink">Add a Room</h1>
      <p className="mt-2 text-body">
        Your listing goes live on the site as soon as you submit it.
      </p>

      <div className="mt-8 max-w-2xl">
        <ListingForm />
      </div>
    </div>
  );
}
