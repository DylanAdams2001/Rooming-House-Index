import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Real service_providers row shape (only the columns the directory/profile
// pages actually need), replacing the old lib/mock-providers.ts data.
export type RealProvider = {
  slug: string;
  business_name: string;
  description: string | null;
  contact_email: string;
  contact_phone: string | null;
  coverage_areas: string[];
  license_number: string | null;
  credentials: Record<string, unknown>;
  response_time_label?: string | null;
};

export function ProviderCard({
  provider,
  categorySlug,
}: {
  provider: RealProvider;
  categorySlug: string;
}) {
  return (
    <Card className="flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="pb-4">
        <h3 className="font-display text-xl text-ink">{provider.business_name}</h3>
        <p className="text-sm text-muted">{provider.coverage_areas.join(", ")}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4 pt-0">
        <p className="whitespace-pre-line text-sm text-body">{provider.description}</p>
        <div className="space-y-2">
          {provider.response_time_label && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
              {provider.response_time_label}
            </p>
          )}
          <Button asChild size="sm" className="w-full">
            <Link href={`/dashboard/services/${categorySlug}/${provider.slug}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
