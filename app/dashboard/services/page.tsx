import Link from "next/link";
import { serviceCategories } from "@/lib/service-categories";
import { getProvidersByCategory } from "@/lib/mock-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function ServicesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Services</h1>
      <p className="mt-2 text-body">
        Vetted providers for every stage of running a rooming house — connect and message
        them directly from the platform.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {serviceCategories.map((category) => {
          const count = getProvidersByCategory(category.dbCategory).length;
          const content = (
            <Card
              className={
                category.comingSoon ? "flex h-full flex-col opacity-60" : "flex h-full flex-col"
              }
            >
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle>{category.label}</CardTitle>
                {category.comingSoon ? (
                  <Badge variant="outline">Coming Soon</Badge>
                ) : (
                  <ArrowRight className="h-5 w-5 text-muted" />
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4 pt-0">
                <p className="text-sm text-body">{category.description}</p>
                {!category.comingSoon && category.quoteBased && (
                  <p className="text-xs text-muted">Submit your details, get quotes back</p>
                )}
                {!category.comingSoon && !category.quoteBased && (
                  <p className="text-xs text-muted">
                    {count} provider{count === 1 ? "" : "s"} listed
                  </p>
                )}
              </CardContent>
            </Card>
          );

          return category.comingSoon ? (
            <div key={category.slug}>{content}</div>
          ) : (
            <Link key={category.slug} href={`/dashboard/services/${category.slug}`}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
