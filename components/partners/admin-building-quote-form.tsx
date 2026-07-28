"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type TierState = { label: string; price: string; internalNote: string };

const DEFAULT_TIERS: TierState[] = [
  { label: "Option 1", price: "", internalNote: "" },
  { label: "Option 2", price: "", internalNote: "" },
  { label: "Option 3", price: "", internalNote: "" },
];

// Reveal offsets from submission time when NOT sending immediately — makes
// the 3 blind options feel like independent quotes arriving over the next
// hour rather than a database dump, per the requested 20/40/60 min spacing.
const STAGGER_MINUTES = [20, 40, 60];

// Admin-only manual fallback — normally a new Building request auto-populates
// its 3 quotes from building_price_tiers (see /partners/admin/building-pricing)
// the moment it's submitted. This only ever shows when that didn't happen,
// e.g. a bedroom count with no price tier configured yet.
export function AdminBuildingQuoteForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [tiers, setTiers] = useState<TierState[]>(DEFAULT_TIERS);
  const [sendImmediately, setSendImmediately] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateTier(index: number, field: keyof TierState, value: string) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filled = tiers.filter((t) => t.label.trim() && t.price.trim());
    if (filled.length === 0) return;

    setSubmitting(true);
    setError(null);

    const now = Date.now();
    const rows = filled.map((tier, i) => ({
      request_id: requestId,
      provider_id: null,
      provider_name: tier.label.trim(),
      flat_fee: `$${tier.price.trim()}`,
      internal_note: tier.internalNote.trim() || null,
      visible_at: new Date(sendImmediately ? now : now + STAGGER_MINUTES[i] * 60_000).toISOString(),
    }));

    const { error: insertError } = await supabase.from("service_quote_quotes").insert(rows);

    setSubmitting(false);
    if (insertError) {
      setError("Couldn't save these options — please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-4 rounded-btn border border-line bg-offwhite p-4">
      <p className="text-sm font-medium text-ink">
        No pricing configured for this bedroom count yet — add options manually, or set one up in{" "}
        <a href="/partners/admin/building-pricing" className="underline underline-offset-4">
          Building Pricing
        </a>{" "}
        for it to auto-apply next time.
      </p>

      {tiers.map((tier, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor={`label-${i}`} className="text-xs">
              Label shown to investor
            </Label>
            <Input
              id={`label-${i}`}
              value={tier.label}
              onChange={(e) => updateTier(i, "label", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`price-${i}`} className="text-xs">
              Price ($)
            </Label>
            <Input
              id={`price-${i}`}
              type="number"
              min={0}
              value={tier.price}
              onChange={(e) => updateTier(i, "price", e.target.value)}
              placeholder="e.g. 780"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`note-${i}`} className="text-xs">
              Internal note (which builder — never shown to investor)
            </Label>
            <Input
              id={`note-${i}`}
              value={tier.internalNote}
              onChange={(e) => updateTier(i, "internalNote", e.target.value)}
              placeholder="e.g. Bob's Construction"
            />
          </div>
        </div>
      ))}

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={sendImmediately}
          onChange={(e) => setSendImmediately(e.target.checked)}
        />
        Send all 3 immediately (uncheck to stagger 20/40/60 min apart)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save price options
      </Button>
    </form>
  );
}
