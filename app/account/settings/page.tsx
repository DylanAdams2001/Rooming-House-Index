import { AccountDetailsCard } from "@/components/profile-page";

export default function AccountSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Profile</h1>
      <p className="mt-2 text-body">Update your photo and contact details.</p>
      <div className="mt-8">
        <AccountDetailsCard />
      </div>
    </div>
  );
}
