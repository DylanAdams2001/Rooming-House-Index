import { createClient } from "@/lib/supabase/server";
import { serviceCategories } from "@/lib/service-categories";
import { ProviderProfileForm } from "@/components/partners/provider-profile-form";

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

  return (
    <div>
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
