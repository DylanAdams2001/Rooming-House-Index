"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StepHeader } from "@/components/onboarding/step-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const INCOME_RANGES = [
  "Under $500/wk",
  "$500-1,000/wk",
  "$1,000-1,500/wk",
  "$1,500-2,000/wk",
  "$2,000+/wk",
  "Not sure / prefer not to say",
];

function InvestorDetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/account";
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [hasRoomingHouse, setHasRoomingHouse] = useState<boolean | null>(null);
  const [income, setIncome] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function advance() {
    if (!userId) return;
    await supabase.from("users").update({ onboarding_step: "photo" }).eq("id", userId);
    router.push(`/onboarding/photo?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError(null);

    const { error: upsertError } = await supabase.from("investor_profiles").upsert({
      user_id: userId,
      has_rooming_house: hasRoomingHouse,
      current_property_income: hasRoomingHouse ? income || null : null,
    });

    setSaving(false);

    if (upsertError) {
      setError("Couldn't save — this needs a live Supabase project connected.");
      return;
    }

    await advance();
  }

  return (
    <>
      <StepHeader
        step={3}
        totalSteps={4}
        title="Tell us about your investment"
        subtitle="Helps us tailor market data and provider recommendations for you."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Do you currently own or operate a rooming house?</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHasRoomingHouse(true)}
              className={cn(
                "rounded-btn border border-line px-4 py-3 text-sm transition-colors",
                hasRoomingHouse === true
                  ? "border-ink bg-ink text-white"
                  : "text-ink hover:bg-linen"
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setHasRoomingHouse(false);
                setIncome("");
              }}
              className={cn(
                "rounded-btn border border-line px-4 py-3 text-sm transition-colors",
                hasRoomingHouse === false
                  ? "border-ink bg-ink text-white"
                  : "text-ink hover:bg-linen"
              )}
            >
              No
            </button>
          </div>
        </div>

        {hasRoomingHouse && (
          <div className="space-y-2">
            <Label>What income are you currently making from that property?</Label>
            <Select value={income} onValueChange={setIncome}>
              <SelectTrigger>
                <SelectValue placeholder="Select a range…" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_RANGES.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={saving || hasRoomingHouse === null}>
            {saving ? "Saving…" : "Continue"}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={advance} disabled={saving}>
            Skip for now
          </Button>
        </div>
      </form>
    </>
  );
}

export default function OnboardingInvestorDetailsPage() {
  return (
    <Suspense fallback={null}>
      <InvestorDetailsForm />
    </Suspense>
  );
}
