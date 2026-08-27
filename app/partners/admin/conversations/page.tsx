import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { ProductTour } from "@/components/tour/product-tour";

type Row = {
  id: string;
  title: string;
  subtitle: string;
  investorLabel: string;
  lastMessageAt: string;
};

export default async function AdminConversationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  if (!isAdmin) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
        <p className="text-body">
          This page is restricted to admin accounts. Set your role to &apos;admin&apos; in the
          public.users table (Supabase) to access it.
        </p>
      </div>
    );
  }

  // Merges all three conversation kinds (marketplace, quote-request, and
  // tenant room enquiries) into one oversight list — matches the Messages
  // inbox pattern elsewhere, so admin sees the exact same universe of
  // conversations that exists across the whole platform, not just one slice.
  const [{ data: conversations, error }, { data: quoteConversations }, { data: listingConversations }] =
    await Promise.all([
      supabase
        .from("conversations")
        .select(
          "id, last_message_at, investor_id, users!conversations_investor_id_fkey(email), service_providers(business_name)"
        )
        .order("last_message_at", { ascending: false }),
      supabase
        .from("quote_conversations")
        .select(
          "id, last_message_at, service_quote_requests(property_address, users(email)), service_providers(business_name)"
        )
        .order("last_message_at", { ascending: false }),
      supabase
        .from("listing_conversations")
        .select("id, last_message_at, listing_id, tenant_id, users(email), listings(address)")
        .order("last_message_at", { ascending: false }),
    ]);

  const rows: Row[] = [];

  for (const c of conversations ?? []) {
    rows.push({
      id: `conv-${c.id}`,
      title:
        (c.service_providers as unknown as { business_name: string } | null)?.business_name ?? "Provider",
      subtitle: "Direct message",
      investorLabel: (c.users as unknown as { email: string } | null)?.email ?? c.investor_id,
      lastMessageAt: c.last_message_at,
    });
  }

  for (const c of (quoteConversations ?? []) as unknown as {
    id: string;
    last_message_at: string;
    service_quote_requests: { property_address: string; users: { email: string } | null } | null;
    service_providers: { business_name: string } | null;
  }[]) {
    rows.push({
      id: `quote-${c.id}`,
      title: c.service_providers?.business_name ?? "Provider",
      subtitle: c.service_quote_requests?.property_address ?? "Quote request",
      investorLabel: c.service_quote_requests?.users?.email ?? "Investor",
      lastMessageAt: c.last_message_at,
    });
  }

  for (const c of (listingConversations ?? []) as unknown as {
    id: string;
    last_message_at: string;
    listing_id: string;
    tenant_id: string;
    users: { email: string } | null;
    listings: { address: string } | null;
  }[]) {
    rows.push({
      id: `enquiry-${c.id}`,
      title: c.listings?.address ?? "Room enquiry",
      subtitle: "Room enquiry",
      investorLabel: c.users?.email ?? c.tenant_id,
      lastMessageAt: c.last_message_at,
    });
  }

  rows.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return (
    <div>
      <ProductTour
        tourKey="admin-conversations-page"
        intro={{
          title: "All Conversations",
          description:
            "Every conversation on the platform — marketplace messages, quote requests, and room enquiries — merged into one list. Use this for payment verification and compliance oversight, or to reply as the business side of a conversation.",
        }}
      />

      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-ink" />
        <h1 className="font-display text-3xl text-ink">All Conversations</h1>
      </div>
      <p className="mt-2 text-body">
        Every conversation across every provider, quote request, and room enquiry — for payment
        verification and compliance oversight, and to reply on behalf of a supplier or contractor
        that hasn&apos;t claimed their account yet.
      </p>

      {error && <p className="mt-6 text-sm text-red-600">{error.message}</p>}

      {!error && (
        <div className="mt-6 space-y-3">
          {rows.map((row) => (
            <Link key={row.id} href={`/partners/admin/conversations/${row.id}`}>
              <Card className="transition-colors hover:bg-linen">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-display text-lg text-ink">{row.title}</p>
                    <p className="text-xs text-muted">
                      {row.subtitle} · Investor/Tenant: {row.investorLabel}
                    </p>
                  </div>
                  <p className="text-xs text-muted">
                    {new Date(row.lastMessageAt).toLocaleString("en-AU")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted">No conversations yet.</p>}
        </div>
      )}
    </div>
  );
}
