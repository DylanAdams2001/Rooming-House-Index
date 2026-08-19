import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/partners/listing-form";
import { ProductTour } from "@/components/tour/product-tour";

export default async function AdminNewListingPage() {
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

  return (
    <div>
      <ProductTour
        tourKey="admin-listings-new-page"
        intro={{
          title: "Add a Listing",
          description:
            "Upload a room directly, without needing to sign into a property manager's account. It goes live immediately, with no owner attached.",
        }}
      />

      <h1 className="font-display text-3xl text-ink">Add a Listing</h1>
      <p className="mt-2 text-body">
        Publishes immediately, same as any property manager&apos;s listing — just with no owner
        attached.
      </p>

      <div className="mt-8 max-w-2xl">
        <ListingForm insertAsUnowned redirectTo="/partners/admin/listings" />
      </div>
    </div>
  );
}
