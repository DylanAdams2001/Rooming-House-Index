import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getListingById, getListingTitle } from "@/lib/mock-listings";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

// Tenant-facing inbox: one thread per room they've enquired about, talking directly
// to the property team about that listing — separate from the investor/provider
// marketplace inbox (components/messages/messages-inbox.tsx).
export async function ListingMessagesInbox() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let conversations: { id: string; listing_id: string; last_message_at: string }[] = [];
  let loadError: string | null = null;

  if (user) {
    const { data, error } = await supabase
      .from("listing_conversations")
      .select("id, listing_id, last_message_at")
      .eq("tenant_id", user.id)
      .order("last_message_at", { ascending: false });

    if (error) {
      loadError = error.message;
    } else {
      conversations = data ?? [];
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Messages</h1>
      <p className="mt-2 text-body">Your conversations about rooms you've enquired on.</p>

      {loadError && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-8 text-center">
          <p className="text-body">
            Messaging isn&apos;t connected to a live Supabase project yet, so conversations
            can&apos;t load.
          </p>
          <p className="mt-1 text-xs text-muted">{loadError}</p>
        </div>
      )}

      {!loadError && conversations.length === 0 && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-body">No conversations yet.</p>
          <p className="mt-1 text-sm text-muted">
            Enquire on a room from{" "}
            <Link href="/listings" className="underline underline-offset-4">
              Listings
            </Link>{" "}
            to start one.
          </p>
        </div>
      )}

      {!loadError && conversations.length > 0 && (
        <div className="mt-6 space-y-3">
          {conversations.map((c) => {
            const listing = getListingById(c.listing_id);
            return (
              <Link key={c.id} href={`/account/messages/${c.id}`}>
                <Card className="transition-colors hover:bg-linen">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="font-display text-lg text-ink">
                        {listing ? getListingTitle(listing) : "Listing"}
                      </p>
                      <p className="text-xs text-muted">
                        Last message {new Date(c.last_message_at).toLocaleString("en-AU")}
                      </p>
                    </div>
                    <MessageCircle className="h-5 w-5 text-muted" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
