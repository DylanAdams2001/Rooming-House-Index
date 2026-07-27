import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { serviceCategories } from "@/lib/service-categories";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  approved: "border-green-600 bg-green-600 text-white",
  pending: "border-line bg-linen text-ink",
  rejected: "border-red-600 bg-red-600 text-white",
};

export default async function AdminHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  if (!isAdmin) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
        <p className="text-body">This page is restricted to admin accounts.</p>
      </div>
    );
  }

  const { data: providers } = await supabase
    .from("service_providers")
    .select("id, slug, business_name, category, contact_email, status")
    .order("category", { ascending: true })
    .order("business_name", { ascending: true });

  const labelByCategory = new Map(serviceCategories.map((c) => [c.dbCategory, c.label]));

  return (
    <div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-ink" />
        <h1 className="font-display text-3xl text-ink">Business Partners</h1>
      </div>
      <p className="mt-2 text-body">
        Every provider and property manager account, across every category — click into one to
        see their listings and who&apos;s enquired with them.
      </p>

      {(!providers || providers.length === 0) && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">No business partners signed up yet.</p>
        </div>
      )}

      {providers && providers.length > 0 && (
        <div className="mt-6 space-y-3">
          {providers.map((p) => (
            <Link key={p.id} href={`/dashboard/admin/partners/${p.slug ?? p.id}`}>
              <Card className="transition-colors hover:bg-linen">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-display text-lg text-ink">{p.business_name}</p>
                    <p className="text-xs text-muted">
                      {labelByCategory.get(p.category) ?? p.category} · {p.contact_email}
                    </p>
                  </div>
                  <Badge className={cn(STATUS_STYLES[p.status])}>{p.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
