import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      "id, investor_id, users!conversations_investor_id_fkey(email), service_providers(business_name)"
    )
    .eq("id", params.conversationId)
    .maybeSingle();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", params.conversationId)
    .order("created_at", { ascending: true });

  return (
    <div>
      <Link
        href="/dashboard/admin/conversations"
        className="mb-4 flex items-center gap-2 text-sm text-body hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All conversations
      </Link>

      {!conversation ? (
        <p className="text-body">Conversation not found.</p>
      ) : (
        <div className="rounded-card border border-line bg-white">
          <div className="border-b border-line px-6 py-4">
            <p className="font-display text-lg text-ink">
              {(conversation.service_providers as unknown as { business_name: string } | null)
                ?.business_name ?? "Provider"}
            </p>
            <p className="text-xs text-muted">
              Investor:{" "}
              {(conversation.users as unknown as { email: string } | null)?.email ??
                conversation.investor_id}
            </p>
          </div>
          <div className="space-y-3 px-6 py-4">
            {(messages ?? []).map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[75%] rounded-card px-4 py-2 text-sm",
                  m.sender_id === conversation.investor_id
                    ? "bg-offwhite text-ink"
                    : "ml-auto bg-linen text-ink"
                )}
              >
                <p>{m.body}</p>
                <p className="mt-1 text-[10px] text-muted">
                  {new Date(m.created_at).toLocaleString("en-AU")}
                </p>
              </div>
            ))}
            {(messages ?? []).length === 0 && (
              <p className="text-sm text-muted">No messages in this conversation yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
