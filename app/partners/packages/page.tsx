import { createClient } from "@/lib/supabase/server";
import { PackageList } from "@/components/partners/package-list";
import { PackageForm } from "@/components/partners/package-form";

export default async function PartnersPackagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: providerRow } = await supabase
    .from("service_providers")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!providerRow) {
    return (
      <div>
        <h1 className="font-display text-3xl text-ink">Packages</h1>
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">No service provider listing found on this account yet.</p>
        </div>
      </div>
    );
  }

  const { data: packages } = await supabase
    .from("service_provider_packages")
    .select("id, label, price, description, document_url")
    .eq("provider_id", providerRow.id)
    .order("created_at", { ascending: true });

  const existingPackages = (packages ?? []).map((p) => ({
    id: p.id,
    label: p.label,
    price: p.price,
    description: p.description,
    documentUrl: p.document_url,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Packages</h1>
      <p className="mt-2 text-body">
        Named, priced packages investors see on your public profile — lets them compare before
        they even message you.
      </p>

      <div className="mt-6 max-w-2xl space-y-6">
        <PackageList providerId={providerRow.id} packages={existingPackages} />
        <PackageForm providerId={providerRow.id} />
      </div>
    </div>
  );
}
