import { notFound } from "next/navigation";
import { getServiceCategory } from "@/lib/service-categories";
import { getProviderById, mockProviders } from "@/lib/mock-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StartConversationButton } from "@/components/start-conversation-button";
import { PdfQuickView } from "@/components/pdf-quick-view";
import { BackLink } from "@/components/back-link";

export function generateStaticParams() {
  return mockProviders.map((p) => {
    const category = p.category.replace(/_/g, "-");
    return { category, providerId: p.id };
  });
}

function humanizeKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export default function ProviderProfilePage({
  params,
}: {
  params: { category: string; providerId: string };
}) {
  const category = getServiceCategory(params.category);
  const provider = getProviderById(params.providerId);

  if (!category || !provider || provider.category !== category.dbCategory) {
    notFound();
  }

  return (
    <div>
      <BackLink href={`/dashboard/services/${category.slug}`} label={category.label} />

      <p className="text-sm text-muted">{category.label}</p>
      <h1 className="mt-1 font-display text-4xl text-ink">{provider.businessName}</h1>
      <p className="mt-2 text-body">{provider.coverageAreas.join(", ")}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-body">{provider.description}</p>
            <div className="text-sm text-body">
              <p>
                <span className="text-muted">Email:</span> {provider.contactEmail}
              </p>
              {provider.contactPhone && (
                <p>
                  <span className="text-muted">Phone:</span> {provider.contactPhone}
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
            {provider.licenseNumber && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">License</p>
                <p className="text-sm text-ink">{provider.licenseNumber}</p>
              </div>
            )}
            {Object.entries(provider.credentials).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs uppercase tracking-wide text-muted">{humanizeKey(key)}</p>
                <p className="text-sm text-ink">
                  {Array.isArray(value) ? value.join(", ") : value}
                </p>
              </div>
            ))}
            <StartConversationButton providerId={provider.id} businessName={provider.businessName} />
          </CardContent>
        </Card>
      </div>

      {provider.furniturePackages && provider.furniturePackages.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Furniture Packages</CardTitle>
            <p className="text-sm text-muted">
              Sample package quotes by room count — more added as they&apos;re sourced.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {provider.furniturePackages.map((pkg) => (
              <PdfQuickView key={pkg.fileUrl} label={pkg.label} fileUrl={pkg.fileUrl} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
