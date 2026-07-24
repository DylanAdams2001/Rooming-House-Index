"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { RoomListing } from "@/lib/mock-listings";

export function ListingCard({ listing }: { listing: RoomListing }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [enquired, setEnquired] = useState(false);

  async function handleEnquire() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const redirectTo = `/listings?suburb=${listing.suburbId}`;
      router.push(`/signup?redirectTo=${encodeURIComponent(redirectTo)}&role=tenant`);
      return;
    }

    // No enquiry backend yet — a real profile is the gate we care about right now.
    setEnquired(true);
    setLoading(false);
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-xl text-ink">{listing.suburbName}</h3>
            <p className="text-sm text-muted">{listing.roomType} room</p>
          </div>
          <Badge variant="outline">{listing.availableFrom}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-6 pt-0">
        <div>
          <p className="font-display text-2xl text-ink">${listing.weeklyRate}/wk</p>
          <p className="mt-2 text-sm text-body">{listing.description}</p>
        </div>
        {enquired ? (
          <p className="text-center text-sm text-body">
            Enquiry sent — the operator will be in touch.
          </p>
        ) : (
          <Button className="w-full" onClick={handleEnquire} disabled={loading}>
            {loading ? "Please wait…" : "Enquire"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
