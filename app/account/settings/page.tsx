import { AccountDetailsCard } from "@/components/profile-page";
import { ProductTour } from "@/components/tour/product-tour";

export default function AccountSettingsPage() {
  return (
    <div>
      <ProductTour
        tourKey="account-settings-page"
        intro={{
          title: "Profile",
          description: "Update your photo and contact details here — this is what a landlord sees alongside your application.",
        }}
      />

      <h1 className="font-display text-3xl text-ink">Profile</h1>
      <p className="mt-2 text-body">Update your photo and contact details.</p>
      <div className="mt-8">
        <AccountDetailsCard />
      </div>
    </div>
  );
}
