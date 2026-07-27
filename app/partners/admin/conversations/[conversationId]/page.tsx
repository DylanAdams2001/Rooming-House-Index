import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "conv" | "quote" | "enquiry";

function parseId(raw: string): { kind: Kind; id: string } | null {
  const [prefix, ...rest] = raw.split("-");
  const id = rest.join("-");
  if (!id) return null;
  if (prefix === "conv") return { kind: "conv", id };
  if (prefix === "quote") return { kind: "quote", id };
  if (prefix === "enquiry") return { kind: "enquiry", id };
  return null;
}

export default async function AdminConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
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
        <p className="text-body">This page is restricted to admin accounts.</p>
      </div>
    );
  }

  const parsed = parseId(params.conversationId);
  if (!parsed) notFound();
  const { kind, id } = parsed;

  let title = "Conversation";
  let investorLabel = "Investor";
  let messages: { id: string; body: string; created_at: string; mine: boolean }[] = [];

  if (kind === "conv") {
    const { data: conversation } = await supabase
      .from("conversations")
      .select(
        "id, investor_id, users!conversations_investor_id_fkey(email), service_providers(business_name)"
      )
      .eq("id", id)
      .maybeSingle();

    if (!conversation) notFound();

    title =
      (conversation.service_providers as unknown as { business_name: string } | null)?.business_name ??
      "Provider";
    investorLabel =
      (conversation.users as unknown as { email: string } | null)?.email ?? conversation.investor_id;

    const { data: rows } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    messages = (rows ?? []).map((m) => ({
      id: m.id,
      body: m.body,
      created_at: m.created_at,
      mine: m.sender_id !== conversation.investor_id,
    }));
  } else if (kind === "quote") {
    const { data: conversation } = await supabase
      .from("quote_conversations")
      .select(
        "id, service_quote_requests(property_address, user_id, users(email)), service_providers(business_name)"
      )
      .eq("id", id)
      .maybeSingle();

    if (!conversation) notFound();

    const request = conversation.service_quote_requests as unknown as {
      property_address: string;
      user_id: string;
      users: { email: string } | null;
    } | null;

    title =
      (conversation.service_providers as unknown as { business_name: string } | null)?.business_name ??
      "Provider";
    investorLabel = request?.users?.email ?? request?.user_id ?? "Investor";

    const { data: rows } = await supabase
      .from("quote_messages")
      .select("id, is_provider, body, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    messages = (rows ?? []).map((m) => ({
      id: m.id,
      body: m.body,
      created_at: m.created_at,
      mine: m.is_provider,
    }));
  } else {
    const { data: conversation } = await supabase
      .from("listing_conversations")
      .select("id, tenant_id, listing_id, users(email), listings(address)")
      .eq("id", id)
      .maybeSingle();

    if (!conversation) notFound();

    title = (conversation.listings as unknown as { address: string } | null)?.address ?? "Room enquiry";
    investorLabel = (conversation.users as unknown as { email: string } | null)?.email ?? conversation.tenant_id;

    const { data: rows } = await supabase
      .from("listing_messages")
      .select("id, is_manager, body, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    messages = (rows ?? []).map((m) => ({
      id: m.id,
      body: m.body,
      created_at: m.created_at,
      mine: m.is_manager,
    }));
  }

  return (
    <div>
      <Link
        href="/partners/admin/conversations"
        className="mb-4 flex items-center gap-2 text-sm text-body hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All conversations
      </Link>

      <div className="rounded-card border border-line bg-white">
        <div className="border-b border-line px-6 py-4">
          <p className="font-display text-lg text-ink">{title}</p>
          <p className="text-xs text-muted">Investor/Tenant: {investorLabel}</p>
        </div>
        <div className="space-y-3 px-6 py-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[75%] rounded-card px-4 py-2 text-sm",
                m.mine ? "ml-auto bg-linen text-ink" : "bg-offwhite text-ink"
              )}
            >
              <p>{m.body}</p>
              <p className="mt-1 text-[10px] text-muted">
                {new Date(m.created_at).toLocaleString("en-AU")}
              </p>
            </div>
          ))}
          {messages.length === 0 && <p className="text-sm text-muted">No messages in this conversation yet.</p>}
        </div>
      </div>
    </div>
  );
}
