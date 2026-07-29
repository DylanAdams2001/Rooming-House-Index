"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gift, Check, Copy } from "lucide-react";

const REFERRAL_GOAL = 3;

export function ReferralCard({ referralCode, referralCount }: { referralCode: string; referralCount: number }) {
  const [copied, setCopied] = useState(false);
  // Computed after mount (not during render) so the server-rendered and
  // first client-rendered HTML match — window.location isn't available
  // during SSR, and using it directly in render would cause a hydration
  // mismatch on this value.
  const [link, setLink] = useState("");
  useEffect(() => {
    setLink(`${window.location.origin}/signup?ref=${referralCode}`);
  }, [referralCode]);
  const earned = referralCount >= REFERRAL_GOAL;

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Gift className="h-5 w-5 text-ink" />
        <CardTitle>Refer a friend, earn a $10k builder credit</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-body">
          {earned
            ? "You've referred 3 friends who became investors — we'll be in touch to arrange your $10k builder credit."
            : `Invite 3 friends to sign up and earn a $10k builder credit. You're at ${referralCount} of ${REFERRAL_GOAL}.`}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={link} className="flex-1" onFocus={(e) => e.target.select()} />
          <Button type="button" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
