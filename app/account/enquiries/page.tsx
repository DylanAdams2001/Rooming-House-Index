"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getListingById } from "@/lib/mock-listings";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, FileText, MessageCircle } from "lucide-react";

type EnquiryRow = { id: string; listing_id: string; last_message_at: string };

export default function EnquiriesPage() {
  const supabase = createClient();

  const [loaded, setLoaded] = useState(false);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: conversations } = await supabase
        .from("listing_conversations")
        .select("id, listing_id, last_message_at")
        .eq("tenant_id", user.id)
        .order("last_message_at", { ascending: false });

      setEnquiries(conversations ?? []);
      setLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Enquiries</h1>
      <p className="mt-2 text-body">Rooms you&apos;ve enquired on.</p>

      <Link href="/account/application">
        <Card className="mt-6 transition-colors hover:bg-linen">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-ink" />
              <p className="text-sm text-ink">
                Your application — the details a landlord sees when you enquire
              </p>
            </div>
            <span className="text-xs text-muted underline underline-offset-4">View / update</span>
          </CardContent>
        </Card>
      </Link>

      {loaded && enquiries.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Your enquiries</h2>
          {enquiries.map((c) => {
            const listing = getListingById(c.listing_id);
            return (
              <Link key={c.id} href={`/account/messages/${c.id}`}>
                <Card className="transition-colors hover:bg-linen">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-display text-lg text-ink">
                        {listing ? `${listing.roomType} room in ${listing.suburbName}` : "Listing"}
                      </p>
                      <p className="text-xs text-muted">
                        Last message {new Date(c.last_message_at).toLocaleString("en-AU")}
                      </p>
                    </div>
                    {listing?.inspectionTime ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {listing.inspectionTime}
                      </div>
                    ) : (
                      <MessageCircle className="h-5 w-5 text-muted" />
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {loaded && enquiries.length === 0 && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-8 text-center">
          <p className="text-body">No enquiries yet.</p>
          <p className="mt-1 text-sm text-muted">
            Enquire on a room from{" "}
            <Link href="/listings" className="underline underline-offset-4">
              Listings
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
