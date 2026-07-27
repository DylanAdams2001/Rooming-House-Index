import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type InboxItem = {
  id: string;
  title: string;
  subtitle: string;
  lastMessageAt: string;
  unread: boolean;
  href: string;
};

// Shared between /dashboard/messages and /account/messages (perspective="investor",
// the default) and /partners/messages (perspective="provider"). One unified inbox —
// merges the marketplace `conversations` table with quote-request conversations
// (`quote_conversations`), sorted together by recency, rather than splitting quote
// threads into a separate tab.
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
      if (providerIds.length > 0) {
        const [{ data: conversations, error }, { data: quoteConversations }] = await Promise.all([
          supabase
            .from("conversations")
            .select(
              "id, last_message_at, provider_last_read_at, users!conversations_investor_id_fkey(email)"
            )
            .in("provider_id", providerIds),
          supabase
            .from("quote_conversations")
            .select(
              "id, request_id, last_message_at, provider_last_read_at, service_quote_requests(property_address)"
            )
            .in("provider_id", providerIds),
        ]);

        if (error) loadError = error.message;

        for (const c of (conversations ?? []) as unknown as {
          id: string;
          last_message_at: string;
          provider_last_read_at: string | null;
          users: { email: string } | null;
        }[]) {
          items.push({
            id: `conv-${c.id}`,
            title: c.users?.email ?? "Member",
            subtitle: "Direct message",
            lastMessageAt: c.last_message_at,
            unread: !c.provider_last_read_at || new Date(c.last_message_at) > new Date(c.provider_last_read_at),
            href: `${basePath}/messages/${c.id}`,
          });
        }

        for (const c of (quoteConversations ?? []) as unknown as {
          id: string;
          request_id: string;
          last_message_at: string;
          provider_last_read_at: string | null;
          service_quote_requests: { property_address: string } | null;
        }[]) {
          items.push({
            id: `quote-${c.id}`,
            title: c.service_quote_requests?.property_address ?? "Quote request",
            subtitle: "Quote request",
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
        .select("id, last_message_at, investor_last_read_at, service_providers(business_name, category)")
        .eq("investor_id", user.id),
      supabase
        .from("quote_conversations")
        .select(
          "id, request_id, provider_id, last_message_at, investor_last_read_at, service_quote_requests(property_address), service_providers(business_name)"
        ),
    ]);

    if (error) loadError = error.message;

    for (const c of (conversations ?? []) as unknown as {
      id: string;
      last_message_at: string;
      investor_last_read_at: string | null;
      service_providers: { business_name: string; category: string } | null;
    }[]) {
      items.push({
        id: `conv-${c.id}`,
        title: c.service_providers?.business_name ?? "Provider",
        subtitle: "Direct message",
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
      investor_last_read_at: string | null;
      service_quote_requests: { property_address: string } | null;
      service_providers: { business_name: string } | null;
    }[]) {
      items.push({
        id: `quote-${c.id}`,
        title: c.service_providers?.business_name ?? "Provider",
        subtitle: c.service_quote_requests?.property_address ?? "Quote request",
        lastMessageAt: c.last_message_at,
        unread: !c.investor_last_read_at || new Date(c.last_message_at) > new Date(c.investor_last_read_at),
        href: `${basePath}/quote-messages/${c.request_id}/${c.provider_id}`,
      });
    }
  }

  items.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Messages</h1>
      <p className="mt-2 text-body">
        {perspective === "provider"
          ? "Your conversations with members, including quote requests."
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
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <Link key={item.id} href={item.href}>
              <Card className="transition-colors hover:bg-linen">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    {item.unread && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" aria-label="Unread" />
                    )}
                    <div>
                      <p className={cn("font-display text-lg text-ink", item.unread && "font-semibold")}>
                        {item.title}
                      </p>
                      <p className="text-xs text-muted">
                        {item.subtitle} · Last message{" "}
                        {new Date(item.lastMessageAt).toLocaleString("en-AU")}
                      </p>
                    </div>
                  </div>
                  <MessageCircle className="h-5 w-5 text-muted" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
