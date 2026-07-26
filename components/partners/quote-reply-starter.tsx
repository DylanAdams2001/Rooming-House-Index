"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

// Shown instead of ChatThread when this provider hasn't engaged with a given
// quote request yet — no quote_conversations row exists until they actually
// reply, so there's nothing for ChatThread to attach to beforehand.
export function QuoteReplyStarter({ requestId, providerId }: { requestId: string; providerId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const body = message.trim();
    if (!body) return;
    setSending(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSending(false);
      return;
    }

    const { data: conversation, error: convError } = await supabase
      .from("quote_conversations")
      .upsert({ request_id: requestId, provider_id: providerId }, { onConflict: "request_id,provider_id" })
      .select("id")
      .single();

    if (convError || !conversation) {
      setSending(false);
      setError("Couldn't start this conversation — please try again.");
      return;
    }

    const { error: messageError } = await supabase.from("quote_messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      is_provider: true,
      body,
    });

    setSending(false);

    if (messageError) {
      setError("Couldn't send your message — please try again.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col rounded-card border border-line bg-white p-6">
      <p className="mb-3 text-sm text-body">
        You haven&apos;t replied to this request yet — send a message to start the conversation
        with the investor.
      </p>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder="Introduce your quote, or ask a question about the property…"
        disabled={sending}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <Button onClick={handleSend} disabled={sending || !message.trim()} className="mt-3 w-full">
        {sending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Send
      </Button>
    </div>
  );
}
