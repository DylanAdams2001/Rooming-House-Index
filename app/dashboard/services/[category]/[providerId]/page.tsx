import { notFound } from "next/navigation";
import { getServiceCategory } from "@/lib/service-categories";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StartConversationButton } from "@/components/start-conversation-button";
import { BackLink } from "@/components/back-link";
import { FileText } from "lucide-react";

function humanizeKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export default async function ProviderProfilePage({
  params,
}: {
  params: { category: string; providerId: string };
}) {
  const category = getServiceCategory(params.category);
  if (!category) notFound();

  const supabase = createClient();
  const { data: provider } = await supabase
    .from("service_providers")
    .select(
      "id, slug, business_name, description, contact_email, contact_phone, coverage_areas, license_number, credentials"
    )
    .eq("slug", params.providerId)
    .eq("category", category.dbCategory)
    .eq("status", "approved")
    .maybeSingle();

  if (!provider) notFound();

  const credentials = (provider.credentials ?? {}) as Record<string, unknown>;

  const { data: packages } =
    category.dbCategory === "furnishing"
      ? await supabase
          .from("service_provider_packages")
          .select("id, label, price, description, document_url")
          .eq("provider_id", provider.id)
          .order("created_at", { ascending: true })
      : { data: [] };

  return (
    <div>
      <BackLink href={`/dashboard/services/${category.slug}`} label={category.label} />

      <p className="text-sm text-muted">{category.label}</p>
      <h1 className="mt-1 font-display text-4xl text-ink">{provider.business_name}</h1>
      <p className="mt-2 text-body">{provider.coverage_areas.join(", ")}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-body">{provider.description || "No description provided yet."}</p>
            <div className="text-sm text-body">
              <p>
                <span className="text-muted">Email:</span> {provider.contact_email}
              </p>
              {provider.contact_phone && (
                <p>
                  <span className="text-muted">Phone:</span> {provider.contact_phone}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {provider.license_number && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">License</p>
                <p className="text-sm text-ink">{provider.license_number}</p>
              </div>
            )}
            {Object.entries(credentials).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs uppercase tracking-wide text-muted">{humanizeKey(key)}</p>
                <p className="text-sm text-ink">
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </p>
              </div>
            ))}
            <StartConversationButton providerId={provider.slug!} businessName={provider.business_name} />
          </CardContent>
        </Card>
      </div>

      {packages && packages.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Packages</CardTitle>
            <p className="text-sm text-muted">
              Sample package pricing — message {provider.business_name} for a tailored quote.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="rounded-btn border border-line p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-base text-ink">{pkg.label}</p>
                  <p className="font-display text-lg text-ink">{pkg.price}</p>
                </div>
                {pkg.description && <p className="mt-1 text-sm text-body">{pkg.description}</p>}
                {pkg.document_url && (
                  <a
                    href={pkg.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink underline underline-offset-4"
                  >
                    <FileText className="h-4 w-4" />
                    View brochure
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
