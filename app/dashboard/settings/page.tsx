import { AccountDetailsCard } from "@/components/profile-page";
import { InvestorAccessCard } from "@/components/dashboard/investor-access-card";
import { ProductTour } from "@/components/tour/product-tour";

export default function DashboardSettingsPage() {
  return (
    <div>
      <ProductTour
        tourKey="dashboard-settings-page"
        intro={{
          title: "Profile",
          description: "Update your contact details here, and check or change your investor dashboard access below.",
        }}
      />

      <h1 className="font-display text-3xl text-ink">Investor Profile</h1>
      <p className="mt-2 text-body">
        Your contact details, plus billing and access for the investor dashboard.
      </p>
      <div className="mt-8">
        <AccountDetailsCard />
        <InvestorAccessCard />
      </div>
    </div>
  );
}
