"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

export type BuildingPriceTier = {
  id: string;
  label: string;
  price: number;
  internalNote: string | null;
  revealDelayMinutes: number;
};

export function BuildingPriceTierRow({ tier }: { tier: BuildingPriceTier }) {
  const router = useRouter();
  const supabase = createClient();
  const [label, setLabel] = useState(tier.label);
  const [price, setPrice] = useState(String(tier.price));
  const [internalNote, setInternalNote] = useState(tier.internalNote ?? "");
  const [revealDelayMinutes, setRevealDelayMinutes] = useState(String(tier.revealDelayMinutes));
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function handleSave() {
    setStatus("saving");
    const { error } = await supabase
      .from("building_price_tiers")
      .update({
        label: label.trim(),
        price: Number(price),
        internal_note: internalNote.trim() || null,
        reveal_delay_minutes: Number(revealDelayMinutes) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tier.id);

    if (error) {
      setStatus("idle");
      return;
    }
    setStatus("saved");
    router.refresh();
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-btn border border-line bg-white p-4 sm:grid-cols-5 sm:items-end">
      <div className="space-y-1">
        <Label className="text-xs">Label shown to investor</Label>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Price ($)</Label>
        <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Internal note (admin-only)</Label>
        <Input
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          placeholder="Which builder"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Reveal delay (min)</Label>
        <Input
          type="number"
          min={0}
          value={revealDelayMinutes}
          onChange={(e) => setRevealDelayMinutes(e.target.value)}
        />
      </div>
      <Button onClick={handleSave} disabled={status === "saving"}>
        {status === "saving" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {status === "saved" && <Check className="mr-2 h-4 w-4" />}
        Save
      </Button>
    </div>
  );
}
