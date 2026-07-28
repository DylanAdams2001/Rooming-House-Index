import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BuildingPriceTierRow } from "@/components/partners/building-price-tier-row";
import { ArrowLeft, Hammer } from "lucide-react";

export default async function BuildingPricingPage() {
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

  const { data: tiers } = await supabase
    .from("building_price_tiers")
    .select("id, bedroom_count, label, price, notes, internal_note, reveal_delay_minutes")
    .order("bedroom_count", { ascending: true })
    .order("sort_order", { ascending: true });

  const tiersByBedroomCount = new Map<number, typeof tiers>();
  for (const t of tiers ?? []) {
    tiersByBedroomCount.set(t.bedroom_count, [...(tiersByBedroomCount.get(t.bedroom_count) ?? []), t]);
  }

  return (
    <div>
      <Link
        href="/partners/admin/quotes"
        className="mb-4 flex items-center gap-2 text-sm text-body hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All Quotes
      </Link>

      <div className="flex items-center gap-2">
        <Hammer className="h-6 w-6 text-ink" />
        <h1 className="font-display text-3xl text-ink">Building Pricing</h1>
      </div>
      <p className="mt-2 max-w-2xl text-body">
        These 3 prices auto-populate on every new Building request for that bedroom count — no
        need to enter them per request. Update here whenever prices actually change (every 6
        months or so). The label is what the investor sees; the internal note (which real
        builder) is never shown to them.
      </p>

      {(!tiers || tiers.length === 0) && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">No pricing configured yet.</p>
        </div>
      )}

      {Array.from(tiersByBedroomCount.entries()).map(([bedroomCount, rows]) => (
        <div key={bedroomCount} className="mt-8">
          <h2 className="font-display text-xl text-ink">{bedroomCount} bedrooms</h2>
          <div className="mt-3 space-y-3">
            {(rows ?? []).map((t) => (
              <BuildingPriceTierRow
                key={t.id}
                tier={{
                  id: t.id,
                  label: t.label,
                  price: t.price,
                  notes: t.notes,
                  internalNote: t.internal_note,
                  revealDelayMinutes: t.reveal_delay_minutes,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
