import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ServiceProvider } from "@/lib/mock-providers";

export function ProviderCard({
  provider,
  categorySlug,
}: {
  provider: ServiceProvider;
  categorySlug: string;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <h3 className="font-display text-xl text-ink">{provider.businessName}</h3>
        <p className="text-sm text-muted">{provider.coverageAreas.join(", ")}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-6 pt-0">
        <p className="text-sm text-body">{provider.description}</p>
        <Button asChild size="sm" className="w-full">
          <Link href={`/dashboard/services/${categorySlug}/${provider.id}`}>View Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
