import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getListingTitle } from "@/lib/mock-listings";
import { getApprovedListingById } from "@/lib/listings";
import { LISTING_COLUMNS, mapListingRow } from "@/lib/listings-shared";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { ProductTour } from "@/components/tour/product-tour";
import { cn } from "@/lib/utils";

// Shared between /account/messages (perspective="tenant", the default — one
// thread per room a tenant has enquired about) and /partners/enquiries
// (perspective="manager" — one thread per enquiry on any room the current
// property manager owns) — separate from the investor/provider marketplace
// inbox (components/messages/messages-inbox.tsx).
export async function ListingMessagesInbox({
  basePath = "/account",
  perspective = "tenant",
}: {
  basePath?: string;
  perspective?: "tenant" | "manager";
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let conversations: {
    id: string;
    listing_id: string;
    last_message_at: string;
    tenant_last_read_at: string | null;
    manager_last_read_at: string | null;
  }[] = [];
  let loadError: string | null = null;

  const readColumn = perspective === "manager" ? "manager_last_read_at" : "tenant_last_read_at";

  if (user && perspective === "manager") {
    const { data: ownedListings, error: listingsError } = await supabase
      .from("listings")
      .select("id")
      .eq("owner_id", user.id);

    if (listingsError) {
      loadError = listingsError.message;
    } else {
      const listingIds = (ownedListings ?? []).map((l) => l.id);
      if (listingIds.length > 0) {
        const { data, error } = await supabase
          .from("listing_conversations")
          .select("id, listing_id, last_message_at, tenant_last_read_at, manager_last_read_at")
          .in("listing_id", listingIds)
          .order("last_message_at", { ascending: false });

        if (error) {
          loadError = error.message;
        } else {
          conversations = data ?? [];
        }
      }
    }
  } else if (user) {
    const { data, error } = await supabase
      .from("listing_conversations")
      .select("id, listing_id, last_message_at, tenant_last_read_at, manager_last_read_at")
      .eq("tenant_id", user.id)
      .order("last_message_at", { ascending: false });

    if (error) {
      loadError = error.message;
    } else {
      conversations = data ?? [];
    }
  }

  const listingsById = new Map(
    await Promise.all(
      conversations.map(async (c) => {
        if (perspective === "manager") {
          const { data } = await supabase
            .from("listings")
            .select(LISTING_COLUMNS)
            .eq("id", c.listing_id)
            .maybeSingle();
          return [c.listing_id, data ? mapListingRow(data) : null] as const;
        }
        return [c.listing_id, await getApprovedListingById(c.listing_id)] as const;
      })
    )
  );

  return (
    <div>
      <ProductTour
        tourKey={`listing-messages-page-${perspective}`}
        intro={{
          title: perspective === "manager" ? "Room Enquiries" : "Messages",
          description:
            perspective === "manager"
              ? "Every tenant enquiry about a room you own lands here — reply to ask questions, confirm an inspection, or reschedule."
              : "Every conversation with a property team lives here, once you've enquired on a room. Reply here to ask questions, confirm an inspection, or reschedule.",
        }}
      />

      <h1 className="font-display text-3xl text-ink">
        {perspective === "manager" ? "Room Enquiries" : "Messages"}
      </h1>
      <p className="mt-2 text-body">
        {perspective === "manager"
          ? "Enquiries from tenants about your rooms."
          : "Your conversations about rooms you've enquired on."}
      </p>

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
          {perspective !== "manager" && (
            <p className="mt-1 text-sm text-muted">
              Enquire on a room from{" "}
              <Link href="/listings" className="underline underline-offset-4">
                Listings
              </Link>{" "}
              to start one.
            </p>
          )}
        </div>
      )}

      {!loadError && conversations.length > 0 && (
        <div className="mt-6 space-y-3">
          {conversations.map((c) => {
            const listing = listingsById.get(c.listing_id) ?? null;
            const lastReadAt = c[readColumn];
            const unread = !lastReadAt || new Date(c.last_message_at) > new Date(lastReadAt);
            return (
              <Link
                key={c.id}
                href={`${basePath}/${perspective === "manager" ? "enquiries" : "messages"}/${c.id}`}
              >
                <Card className="transition-colors hover:bg-linen">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      {unread && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-red-600"
                          aria-label="Unread"
                        />
                      )}
                      <div>
                        <p
                          className={cn(
                            "font-display text-lg text-ink",
                            unread && "font-semibold"
                          )}
                        >
                          {listing ? getListingTitle(listing) : "Listing"}
                        </p>
                        <p className="text-xs text-muted">
                          Last message {new Date(c.last_message_at).toLocaleString("en-AU")}
                        </p>
                      </div>
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
