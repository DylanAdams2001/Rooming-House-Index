import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChatThread } from "@/components/chat/chat-thread";
import { ArrowLeft } from "lucide-react";

export async function ConversationView({
  conversationId,
  basePath,
  perspective = "investor",
}: {
  conversationId: string;
  basePath: string;
  perspective?: "investor" | "provider";
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select(
      "id, investor_id, provider_id, service_providers(business_name), users!conversations_investor_id_fkey(email)"
    )
    .eq("id", conversationId)
    .maybeSingle();

  const { data: initialMessages } = conversation
    ? await supabase
        .from("messages")
        .select("id, sender_id, body, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
    : { data: [] };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Link
        href={`${basePath}/messages`}
        className="mb-4 flex items-center gap-2 text-sm text-body hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All messages
      </Link>

      {!conversation || error || !user ? (
        <div className="rounded-card border border-dashed border-line bg-white p-8 text-center">
          <p className="text-body">
            This conversation isn&apos;t available — either it doesn&apos;t exist, or messaging
            isn&apos;t connected to a live Supabase project yet.
          </p>
        </div>
      ) : (
        <ChatThread
          conversationId={conversation.id}
          currentUserId={user.id}
          otherPartyName={
            perspective === "provider"
              ? (conversation.users as unknown as { email: string } | null)?.email ?? "Member"
              : (conversation.service_providers as unknown as { business_name: string } | null)
                  ?.business_name ?? "Provider"
          }
          initialMessages={initialMessages ?? []}
        />
      )}
    </div>
  );
}
