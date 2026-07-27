import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { serviceCategories } from "@/lib/service-categories";
import { ProviderProfileForm } from "@/components/partners/provider-profile-form";
import { Hint } from "@/components/hints/hint";

export default async function PartnersProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: provider } = await supabase
    .from("service_providers")
    .select(
      "id, category, business_name, description, contact_email, contact_phone, coverage_areas, license_number, credentials"
    )
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!provider) {
    return (
      <div>
        <h1 className="font-display text-3xl text-ink">Business Details</h1>
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">
            No service provider listing found on this account yet.
          </p>
        </div>
      </div>
    );
  }

  const category = serviceCategories.find((c) => c.dbCategory === provider.category);
  // Business name is seeded as "New {category} Provider" at signup (see
  // lib/provider-signup.ts) — still having that placeholder means they
  // haven't filled this in yet.
  const isUnfilled = /^New .+ Provider$/.test(provider.business_name);

  let hasPackages = true;
  if (provider.category === "furnishing") {
    const { count } = await supabase
      .from("service_provider_packages")
      .select("id", { count: "exact", head: true })
      .eq("provider_id", provider.id);
    hasPackages = (count ?? 0) > 0;
  }

  return (
    <div>
      <Hint hintKey="partners-profile" title="Business Details">
        <p>This is your public profile — investors see exactly what you fill in here before they message you.</p>
        <p>Keep your description, coverage areas, and credentials current.</p>
      </Hint>

      <h1 className="font-display text-3xl text-ink">Business Details</h1>
      <p className="mt-2 text-body">
        Update the details members see for your {category?.label.toLowerCase() ?? "service"} listing.
      </p>

      {isUnfilled && (
        <div className="mt-4 rounded-card border border-line bg-linen p-4 text-sm text-ink">
          Welcome! Fill in your business details below so investors know who they&apos;re
          dealing with.
        </div>
      )}

      {!hasPackages && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-linen p-4 text-sm text-ink">
          <span>
            Add your furniture packages so investors can compare pricing before they message you.
          </span>
          <Link href="/partners/packages" className="shrink-0 underline underline-offset-4">
            Add packages
          </Link>
        </div>
      )}

      <div className="mt-8 max-w-2xl">
        <ProviderProfileForm
          providerId={provider.id}
          category={category}
          initial={{
            businessName: provider.business_name,
            description: provider.description,
            contactEmail: provider.contact_email,
            contactPhone: provider.contact_phone,
            coverageAreas: provider.coverage_areas ?? [],
            licenseNumber: provider.license_number,
            credentials: (provider.credentials as Record<string, string | string[]>) ?? {},
          }}
        />
      </div>
    </div>
  );
}
