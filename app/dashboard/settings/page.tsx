import { AccountDetailsCard } from "@/components/profile-page";
import { InvestorAccessCard } from "@/components/dashboard/investor-access-card";

export default function DashboardSettingsPage() {
  return (
    <div>
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
