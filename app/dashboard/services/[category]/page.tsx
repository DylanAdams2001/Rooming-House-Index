import { notFound } from "next/navigation";
import { getServiceCategory, serviceCategories } from "@/lib/service-categories";
import { getProvidersByCategory } from "@/lib/mock-providers";
import { ProviderCard } from "@/components/provider-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function generateStaticParams() {
  return serviceCategories.filter((c) => !c.comingSoon).map((c) => ({ category: c.slug }));
}

export default function ServiceCategoryPage({ params }: { params: { category: string } }) {
  const category = getServiceCategory(params.category);

  if (!category || category.comingSoon) {
    notFound();
  }

  const providers = getProvidersByCategory(category.dbCategory);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="font-display text-3xl text-ink">{category.label}</h1>
          <p className="mt-2 text-body">{category.description}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/services/${category.slug}/join`}>List your business</Link>
        </Button>
      </div>

      <p className="mt-6 text-sm text-muted">
        {providers.length} provider{providers.length === 1 ? "" : "s"} found
      </p>

      {providers.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">No providers listed in this category yet.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} categorySlug={category.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
