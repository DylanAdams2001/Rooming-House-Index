import { notFound } from "next/navigation";
import { getServiceCategory } from "@/lib/service-categories";
import { ProviderJoinForm } from "@/components/provider-join-form";
import { BackLink } from "@/components/back-link";

export default function JoinServiceCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = getServiceCategory(params.category);

  // Quote-based categories are run in-house as a request flow, not a
  // self-serve directory — there's nothing to "list" for them.
  if (!category || category.comingSoon || category.quoteBased) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href={`/dashboard/services/${category.slug}`} label={category.label} />

      <p className="text-sm text-muted">{category.label}</p>
      <h1 className="mt-1 font-display text-3xl text-ink">List your business</h1>
      <p className="mt-2 text-body">
        Submit your details for review. Approved listings appear in the {category.label}{" "}
        directory and investors can message you directly through the platform.
      </p>

      <div className="mt-8">
        <ProviderJoinForm category={category} />
      </div>
    </div>
  );
}
