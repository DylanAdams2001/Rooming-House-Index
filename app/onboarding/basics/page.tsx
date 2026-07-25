"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StepHeader } from "@/components/onboarding/step-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function BasicsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/account";
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push(`/login?redirectTo=${encodeURIComponent(`/onboarding/basics?redirectTo=${redirectTo}`)}`);
        return;
      }
      const { data: profile } = await supabase
        .from("users")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();
      setFullName(profile?.full_name ?? "");
      setPhone(profile?.phone ?? "");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ full_name: fullName, phone, onboarding_step: "intent" })
      .eq("id", user.id);

    setLoading(false);

    if (updateError) {
      setError("Couldn't save your details — this needs a live Supabase project connected.");
      return;
    }

    router.push(`/onboarding/intent?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <>
      <StepHeader
        step={1}
        totalSteps={3}
        title="Tell us about you"
        subtitle="Basic details for your profile."
      />
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="04XX XXX XXX"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : "Continue"}
        </Button>
      </form>
    </>
  );
}

export default function OnboardingBasicsPage() {
  return (
    <Suspense fallback={null}>
      <BasicsForm />
    </Suspense>
  );
}
