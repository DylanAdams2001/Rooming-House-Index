"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StepHeader } from "@/components/onboarding/step-header";
import { Search, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

function IntentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/account";
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState<"tenant" | "investor" | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push(`/login?redirectTo=${encodeURIComponent(`/onboarding/intent?redirectTo=${redirectTo}`)}`);
        return;
      }
      setUserId(user.id);
      setLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function choose(intent: "tenant" | "investor") {
    if (!userId || submitting) return;
    setSubmitting(intent);

    const nextStep = intent === "investor" ? "investor_details" : "photo";
    await supabase
      .from("users")
      .update({ signup_intent: intent, onboarding_step: nextStep })
      .eq("id", userId);

    const nextPath = intent === "investor" ? "/onboarding/investor-details" : "/onboarding/photo";
    router.push(`${nextPath}?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <>
      <StepHeader
        step={2}
        totalSteps={3}
        title="What brings you here?"
        subtitle="Helps us show you the right information from here on."
      />

      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => choose("tenant")}
          disabled={!loaded || !!submitting}
          className={cn(
            "flex items-center gap-4 rounded-card border border-line p-5 text-left transition-colors hover:border-ink hover:bg-linen",
            submitting === "tenant" && "opacity-60"
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linen">
            <Search className="h-5 w-5 text-ink" />
          </div>
          <div>
            <p className="font-display text-lg text-ink">I&apos;m looking for a room</p>
            <p className="text-sm text-muted">Browse listings and enquire about rooms.</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => choose("investor")}
          disabled={!loaded || !!submitting}
          className={cn(
            "flex items-center gap-4 rounded-card border border-line p-5 text-left transition-colors hover:border-ink hover:bg-linen",
            submitting === "investor" && "opacity-60"
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linen">
            <TrendingUp className="h-5 w-5 text-ink" />
          </div>
          <div>
            <p className="font-display text-lg text-ink">I&apos;m a property investor</p>
            <p className="text-sm text-muted">Suburb data, market rates, and provider access.</p>
          </div>
        </button>
      </div>
    </>
  );
}

export default function OnboardingIntentPage() {
  return (
    <Suspense fallback={null}>
      <IntentForm />
    </Suspense>
  );
}
