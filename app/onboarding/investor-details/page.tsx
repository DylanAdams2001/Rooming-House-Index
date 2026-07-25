"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StepHeader } from "@/components/onboarding/step-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function InvestorDetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/account";
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasRoomingHouse, setHasRoomingHouse] = useState<boolean | null>(null);
  const [avgRoomPrice, setAvgRoomPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
      setLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const canContinue =
    hasRoomingHouse === false || (hasRoomingHouse === true && avgRoomPrice.trim().length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !canContinue) return;
    setSaving(true);
    setError(null);

    const { error: upsertError } = await supabase.from("investor_profiles").upsert({
      user_id: userId,
      has_rooming_house: hasRoomingHouse,
      average_room_price: hasRoomingHouse ? avgRoomPrice.trim() : null,
    });

    if (upsertError) {
      setSaving(false);
      setError("Couldn't save — this needs a live Supabase project connected.");
      return;
    }

    await supabase.from("users").update({ onboarding_step: "photo" }).eq("id", userId);
    setSaving(false);
    router.push(`/onboarding/photo?redirectTo=${encodeURIComponent(redirectTo)}`);
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
                setAvgRoomPrice("");
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
            <Label htmlFor="avgRoomPrice">What is the average room price for your property?</Label>
            <Input
              id="avgRoomPrice"
              required
              value={avgRoomPrice}
              onChange={(e) => setAvgRoomPrice(e.target.value)}
              placeholder="e.g. $350/week"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={!loaded || saving || !canContinue}>
          {saving ? "Saving…" : "Continue"}
        </Button>
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
