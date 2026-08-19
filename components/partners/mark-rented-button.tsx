"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function MarkRentedButton({
  listingId,
  advertisedRate,
}: {
  listingId: string;
  advertisedRate: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [rate, setRate] = useState(String(advertisedRate));
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    const parsed = Number(rate);
    if (!rate.trim() || Number.isNaN(parsed) || parsed <= 0) {
      toast.error("Enter the actual weekly rent it was rented for.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("listings")
      .update({
        status: "rented",
        rented_weekly_rate: parsed,
        rented_at: new Date().toISOString(),
      })
      .eq("id", listingId);
    setSaving(false);
    if (error) {
      toast.error("Couldn't mark this room as rented", { description: error.message });
      return;
    }
    toast.success("Marked as rented");
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Mark as Rented
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={1}
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        placeholder="Rented rate ($/wk)"
        className="h-9 w-32"
        autoFocus
      />
      <Button type="button" size="sm" onClick={handleConfirm} disabled={saving}>
        {saving ? "Saving…" : "Confirm"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
        Cancel
      </Button>
    </div>
  );
}
