import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatThread } from "@/components/chat/chat-thread";
import { ArrowLeft } from "lucide-react";

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

  if (!isAdmin || !user) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
        <p className="text-body">This page is restricted to admin accounts.</p>
      </div>
    );
  }

  const parsed = parseId(params.conversationId);
  if (!parsed) notFound();
  const { kind, id } = parsed;

  let businessLabel = "Conversation";
  let investorLabel = "Investor";
  let table: "messages" | "quote_messages" | "listing_messages" = "messages";
  let realConversationId = id;
  let initialMessages: {
    id: string;
    sender_id: string | null;
    body: string;
    created_at: string;
    is_manager?: boolean;
    is_provider?: boolean;
    attachment_url?: string | null;
    attachment_name?: string | null;
  }[] = [];

  if (kind === "conv") {
    const { data: conversation } = await supabase
      .from("conversations")
      .select(
        "id, investor_id, users!conversations_investor_id_fkey(email), service_providers(business_name)"
      )
      .eq("id", id)
      .maybeSingle();

    if (!conversation) notFound();

    businessLabel =
      (conversation.service_providers as unknown as { business_name: string } | null)?.business_name ??
      "Provider";
    investorLabel =
      (conversation.users as unknown as { email: string } | null)?.email ?? conversation.investor_id;
    table = "messages";

    const { data: rows } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at, attachment_url, attachment_name")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    initialMessages = rows ?? [];
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

    businessLabel =
      (conversation.service_providers as unknown as { business_name: string } | null)?.business_name ??
      "Provider";
    investorLabel = request?.users?.email ?? request?.user_id ?? "Investor";
    table = "quote_messages";

    const { data: rows } = await supabase
      .from("quote_messages")
      .select("id, sender_id, is_provider, body, created_at, attachment_url, attachment_name")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    initialMessages = rows ?? [];
  } else {
    const { data: conversation } = await supabase
      .from("listing_conversations")
      .select("id, tenant_id, listing_id, users(email), listings(address)")
      .eq("id", id)
      .maybeSingle();

    if (!conversation) notFound();

    businessLabel = (conversation.listings as unknown as { address: string } | null)?.address ?? "Room enquiry";
    investorLabel = (conversation.users as unknown as { email: string } | null)?.email ?? conversation.tenant_id;
    table = "listing_messages";

    const { data: rows } = await supabase
      .from("listing_messages")
      .select("id, sender_id, is_manager, body, created_at, attachment_url, attachment_name")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    initialMessages = rows ?? [];
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Link
        href="/partners/admin/conversations"
        className="mb-4 flex items-center gap-2 text-sm text-body hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All conversations
      </Link>

      <ChatThread
        conversationId={realConversationId}
        currentUserId={user.id}
        otherPartyName={`${investorLabel} ↔ ${businessLabel}`}
        initialMessages={initialMessages}
        table={table}
        businessSideReply={table !== "messages"}
        complianceNote="Replying here sends as the business side of this conversation — the other party sees it as coming from them, not from Rooming House Standard."
      />
    </div>
  );
}
