"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Building2, Check, TrendingUp } from "lucide-react";

const BENEFITS = [
  { icon: TrendingUp, text: "Suburb-level demand data across Victoria" },
  { icon: Building2, text: "Registered rooming house supply, sourced from the CAV register" },
  { icon: BarChart3, text: "Average room rental rates to benchmark acquisitions" },
];

export default function UpgradePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login?redirectTo=" + encodeURIComponent("/account/upgrade"));
        return;
      }
      const { data: profile } = await supabase
        .from("users")
        .select("investor_access")
        .eq("id", user.id)
        .maybeSingle();
      setActive(profile?.investor_access === "active");
      setLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // No real billing wired up yet — this flips the entitlement directly so the
  // access-control system (middleware, /dashboard gating) can be built and tested
  // now. Swap this handler for a real Stripe Checkout session later without
  // touching anything downstream of investor_access.
  async function handleUpgrade() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("users").update({ investor_access: "active" }).eq("id", user.id);
    setActive(true);
    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  if (active) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-3xl text-ink">You have investor access</h1>
        <p className="mt-2 text-body">
          You can browse suburb data, saved suburbs, and the service provider marketplace.
        </p>
        <Button asChild className="mt-6">
          <a href="/dashboard">Go to investor dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted">Add-on</p>
      <h1 className="font-display text-3xl text-ink">Get investor access</h1>
      <p className="mt-2 text-body">
        Unlock suburb-level rooming house market data on the same account you use to browse
        and enquire on room listings — no separate sign up.
      </p>

      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl text-ink">$29</span>
            <span className="text-body">/month</span>
          </div>
          <ul className="mt-6 space-y-3">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-body">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                {text}
              </li>
            ))}
          </ul>
          <Button className="mt-8 w-full" size="lg" onClick={handleUpgrade} disabled={!loaded || loading}>
            {loading ? "Please wait…" : "Unlock investor access"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            No payment provider connected yet — this activates access directly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
