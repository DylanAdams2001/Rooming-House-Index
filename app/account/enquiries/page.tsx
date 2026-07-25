"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getListingById } from "@/lib/mock-listings";
import { ApplicationForm } from "@/components/account/application-form";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, MessageCircle } from "lucide-react";

type EnquiryRow = { id: string; listing_id: string; last_message_at: string };

function EnquiriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Present when someone arrived here via Enquire on a listing but hasn't filled in
  // an application yet — EnquireButton redirects here instead of composing a message.
  const pendingListingTitle = searchParams.get("listingTitle");
  const redirectTo = searchParams.get("redirectTo");

  const [loaded, setLoaded] = useState(false);
  const [hasApplication, setHasApplication] = useState(false);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const [{ data: tenantProfile }, { data: conversations }] = await Promise.all([
        supabase.from("tenant_profiles").select("user_id").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("listing_conversations")
          .select("id, listing_id, last_message_at")
          .eq("tenant_id", user.id)
          .order("last_message_at", { ascending: false }),
      ]);

      setHasApplication(!!tenantProfile);
      setEnquiries(conversations ?? []);
      setLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Once the application is saved, if we're here to complete a pending enquiry, send
  // them straight back to the listing to actually write and send their message.
  function handleApplicationSaved() {
    setHasApplication(true);
    if (redirectTo) {
      router.push(redirectTo);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Enquiries</h1>
      <p className="mt-2 text-body">Rooms you&apos;ve enquired on, and the application landlords see.</p>

      {redirectTo && pendingListingTitle && !hasApplication && loaded && (
        <div className="mt-6 rounded-card border border-ink bg-linen p-5">
          <p className="text-sm text-ink">
            Complete your application below, then you&apos;ll be sent back to message the
            property team about <span className="font-medium">{pendingListingTitle}</span>.
          </p>
        </div>
      )}

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

      {loaded && enquiries.length === 0 && !redirectTo && (
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

      <div className="mx-auto mt-10 max-w-2xl">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Your application</h2>
        <p className="mt-2 text-sm text-body">
          The details a landlord sees when you enquire about a room. Update this any time.
        </p>
        <div className="mt-4">
          <ApplicationForm onSaved={handleApplicationSaved} />
        </div>
      </div>
    </div>
  );
}

export default function EnquiriesPage() {
  return (
    <Suspense fallback={null}>
      <EnquiriesContent />
    </Suspense>
  );
}
