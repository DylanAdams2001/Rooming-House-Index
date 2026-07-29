import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import { MessageCircle } from "lucide-react";
import { ProductTour } from "@/components/tour/product-tour";
import { cn } from "@/lib/utils";

type InboxItem = {
  id: string;
  title: string;
  // Small context line above the preview — e.g. the property a quote request
  // or room enquiry is about. Omitted for plain direct-message conversations,
  // where the title (contact name) already says everything needed.
  context: string | null;
  preview: string;
  lastMessageAt: string;
  unread: boolean;
  href: string;
};

function truncate(text: string, max = 80) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// Shared between /dashboard/messages and /account/messages (perspective="investor",
// the default) and /partners/messages (perspective="provider"). One unified inbox —
// merges the marketplace `conversations` table with quote-request conversations
// (`quote_conversations`), sorted together by recency, rather than splitting quote
// threads into a separate tab. Row layout follows the usual messaging-app
// convention: contact name + avatar as the primary identity, with the last
// message as a preview snippet underneath, rather than an address as the title.
export async function MessagesInbox({
  basePath,
  perspective = "investor",
}: {
  basePath: string;
  perspective?: "investor" | "provider";
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const items: InboxItem[] = [];
  let loadError: string | null = null;

  if (user && perspective === "provider") {
    const { data: providerRows, error: providerError } = await supabase
      .from("service_providers")
      .select("id")
      .eq("user_id", user.id);

    if (providerError) {
      loadError = providerError.message;
    } else {
      const providerIds = (providerRows ?? []).map((p) => p.id);

      // Property managers' tenant room enquiries (listing_conversations) merge
      // in here too — one Messages inbox for the whole account, rather than a
      // separate Enquiries tab. Harmless no-op query for providers who don't
      // own any listings (regular service providers).
      const { data: ownedListings } = await supabase.from("listings").select("id, address").eq("owner_id", user.id);
      const listingsById = new Map((ownedListings ?? []).map((l) => [l.id, l.address]));
      const listingIds = Array.from(listingsById.keys());

      if (providerIds.length > 0 || listingIds.length > 0) {
        const [
          { data: conversations, error },
          { data: quoteConversations },
          { data: listingConversations },
        ] = await Promise.all([
          providerIds.length > 0
            ? supabase
                .from("conversations")
                .select(
                  "id, last_message_at, last_message_body, provider_last_read_at, users!conversations_investor_id_fkey(full_name, email), messages!inner(id)"
                )
                .in("provider_id", providerIds)
            : Promise.resolve({ data: [], error: null }),
          providerIds.length > 0
            ? supabase
                .from("quote_conversations")
                .select(
                  "id, request_id, last_message_at, last_message_body, provider_last_read_at, service_quote_requests(property_address, users(full_name, email)), quote_messages!inner(id)"
                )
                .in("provider_id", providerIds)
            : Promise.resolve({ data: [], error: null }),
          listingIds.length > 0
            ? supabase
                .from("listing_conversations")
                .select(
                  "id, listing_id, tenant_id, last_message_at, last_message_body, manager_last_read_at, listing_messages!inner(id)"
                )
                .in("listing_id", listingIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (error) loadError = error.message;

        // listing_conversations has no single unambiguous FK to users PostgREST
        // can auto-embed (learned the hard way earlier in this project) — a
        // plain follow-up query for tenant names sidesteps that entirely.
        const tenantIds = Array.from(
          new Set((listingConversations ?? []).map((c) => c.tenant_id).filter(Boolean))
        ) as string[];
        const { data: tenants } =
          tenantIds.length > 0
            ? await supabase.from("users").select("id, full_name, email").in("id", tenantIds)
            : { data: [] };
        const tenantById = new Map((tenants ?? []).map((t) => [t.id, t]));

        for (const c of (listingConversations ?? []) as unknown as {
          id: string;
          listing_id: string;
          tenant_id: string;
          last_message_at: string;
          last_message_body: string | null;
          manager_last_read_at: string | null;
        }[]) {
          const tenant = tenantById.get(c.tenant_id);
          items.push({
            id: `enquiry-${c.id}`,
            title: tenant?.full_name ?? tenant?.email ?? "Tenant",
            context: listingsById.get(c.listing_id) ?? "Room enquiry",
            preview: c.last_message_body ? truncate(c.last_message_body) : "No messages yet",
            lastMessageAt: c.last_message_at,
            unread: !c.manager_last_read_at || new Date(c.last_message_at) > new Date(c.manager_last_read_at),
            href: `${basePath}/enquiries/${c.id}`,
          });
        }

        for (const c of (conversations ?? []) as unknown as {
          id: string;
          last_message_at: string;
          last_message_body: string | null;
          provider_last_read_at: string | null;
          users: { full_name: string | null; email: string } | null;
        }[]) {
          items.push({
            id: `conv-${c.id}`,
            title: c.users?.full_name ?? c.users?.email ?? "Member",
            context: null,
            preview: c.last_message_body ? truncate(c.last_message_body) : "No messages yet",
            lastMessageAt: c.last_message_at,
            unread: !c.provider_last_read_at || new Date(c.last_message_at) > new Date(c.provider_last_read_at),
            href: `${basePath}/messages/${c.id}`,
          });
        }

        for (const c of (quoteConversations ?? []) as unknown as {
          id: string;
          request_id: string;
          last_message_at: string;
          last_message_body: string | null;
          provider_last_read_at: string | null;
          service_quote_requests: {
            property_address: string;
            users: { full_name: string | null; email: string } | null;
          } | null;
        }[]) {
          const investor = c.service_quote_requests?.users;
          items.push({
            id: `quote-${c.id}`,
            title: investor?.full_name ?? investor?.email ?? "Investor",
            context: c.service_quote_requests?.property_address ?? "Quote request",
            preview: c.last_message_body ? truncate(c.last_message_body) : "No messages yet",
            lastMessageAt: c.last_message_at,
            unread: !c.provider_last_read_at || new Date(c.last_message_at) > new Date(c.provider_last_read_at),
            href: `${basePath}/quote-messages/${c.request_id}`,
          });
        }
      }
    }
  } else if (user) {
    const [{ data: conversations, error }, { data: quoteConversations }] = await Promise.all([
      supabase
        .from("conversations")
        .select(
          "id, last_message_at, last_message_body, investor_last_read_at, service_providers(business_name, category), messages!inner(id)"
        )
        .eq("investor_id", user.id),
      supabase
        .from("quote_conversations")
        .select(
          "id, request_id, provider_id, last_message_at, last_message_body, investor_last_read_at, service_quote_requests(property_address), service_providers(business_name), quote_messages!inner(id)"
        ),
    ]);

    if (error) loadError = error.message;

    for (const c of (conversations ?? []) as unknown as {
      id: string;
      last_message_at: string;
      last_message_body: string | null;
      investor_last_read_at: string | null;
      service_providers: { business_name: string; category: string } | null;
    }[]) {
      items.push({
        id: `conv-${c.id}`,
        title: c.service_providers?.business_name ?? "Provider",
        context: null,
        preview: c.last_message_body ? truncate(c.last_message_body) : "No messages yet",
        lastMessageAt: c.last_message_at,
        unread: !c.investor_last_read_at || new Date(c.last_message_at) > new Date(c.investor_last_read_at),
        href: `${basePath}/messages/${c.id}`,
      });
    }

    for (const c of (quoteConversations ?? []) as unknown as {
      id: string;
      request_id: string;
      provider_id: string;
      last_message_at: string;
      last_message_body: string | null;
      investor_last_read_at: string | null;
      service_quote_requests: { property_address: string } | null;
      service_providers: { business_name: string } | null;
    }[]) {
      items.push({
        id: `quote-${c.id}`,
        title: c.service_providers?.business_name ?? "Provider",
        context: c.service_quote_requests?.property_address ?? "Quote request",
        preview: c.last_message_body ? truncate(c.last_message_body) : "No messages yet",
        lastMessageAt: c.last_message_at,
        unread: !c.investor_last_read_at || new Date(c.last_message_at) > new Date(c.investor_last_read_at),
        href: `${basePath}/quote-messages/${c.request_id}/${c.provider_id}`,
      });
    }
  }

  items.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return (
    <div>
      <ProductTour
        tourKey={`messages-page-${perspective}`}
        intro={{
          title: "Messages",
          description:
            perspective === "provider"
              ? "Every conversation with a member lives here — direct messages, quote requests, and (for property managers) tenant room enquiries, all merged into one inbox. A red dot means you haven't opened it yet."
              : "Every conversation with a service provider lives here, including quote requests. Start a new one from any provider's profile in Services. A red dot means you haven't opened it yet.",
        }}
      />

      <h1 className="font-display text-3xl text-ink">Messages</h1>
      <p className="mt-2 text-body">
        {perspective === "provider"
          ? "Your conversations with members, including quote requests and room enquiries."
          : "Your conversations with service providers, including quote requests."}
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

      {!loadError && items.length === 0 && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-body">No conversations yet.</p>
          {perspective !== "provider" && (
            <p className="mt-1 text-sm text-muted">
              Start one from any provider&apos;s profile in{" "}
              <Link href="/dashboard/services" className="underline underline-offset-4">
                Services
              </Link>
              .
            </p>
          )}
        </div>
      )}

      {!loadError && items.length > 0 && (
        <div className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-linen"
            >
              <Avatar seed={item.id} name={item.title} className="h-11 w-11 shrink-0 text-base" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("truncate font-display text-base text-ink", item.unread && "font-semibold")}>
                    {item.title}
                  </p>
                  <span className="shrink-0 text-[11px] text-muted">
                    {new Date(item.lastMessageAt).toLocaleString("en-AU", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                {item.context && (
                  <p className="truncate text-xs text-muted">{item.context}</p>
                )}
                <p className={cn("mt-0.5 truncate text-sm", item.unread ? "font-medium text-ink" : "text-body")}>
                  {item.preview}
                </p>
              </div>
              {item.unread && (
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" aria-label="Unread" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
