"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Investor-only — nothing here applies to a tenant account, unlike the shared
// contact-details form. Anyone reaching /dashboard already has active access
// (middleware gates it), so this is status + cancellation, not another upsell.
export function InvestorAccessCard() {
  const router = useRouter();
  const supabase = createClient();
  const [loaded, setLoaded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  async function handleCancel() {
    setCancelling(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("users").update({ investor_access: "none" }).eq("id", user.id);
    router.push("/account");
    router.refresh();
  }

  return (
    <Card className="mt-6 max-w-lg">
      <CardHeader>
        <CardTitle>Investor Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-body">Status</p>
            <p className="font-display text-lg text-ink">Active — free during early access</p>
          </div>
        </div>
        <p className="text-sm text-muted">
          Suburb demand data, registered supply, average room rates, saved suburbs, and the
          service provider marketplace.
        </p>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={!loaded || cancelling}
          className="text-red-600 hover:bg-red-50"
        >
          {cancelling ? "Removing…" : "Remove investor access"}
        </Button>
      </CardContent>
    </Card>
  );
}
