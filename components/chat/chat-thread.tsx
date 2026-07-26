"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
  // Only present on listing_messages/quote_messages rows — used to tell an
  // automated/business-side message apart from the other party's, since the
  // legacy listing auto-reply has sender_id=null (not attributable to any
  // specific account) rather than matching whichever account is viewing it.
  is_manager?: boolean;
  is_provider?: boolean;
};

type Table = "messages" | "listing_messages" | "quote_messages";

export function ChatThread({
  conversationId,
  currentUserId,
  otherPartyName,
  initialMessages,
  table = "messages",
  businessSideReply = false,
  complianceNote = "All messages here are visible to Rooming House Index for payment and compliance purposes.",
}: {
  conversationId: string;
  currentUserId: string;
  otherPartyName: string;
  initialMessages: Message[];
  table?: Table;
  // Only meaningful for table="listing_messages" (is_manager) or
  // table="quote_messages" (is_provider) — true when the current user is the
  // business side of the conversation (property manager / quote provider)
  // rather than the tenant/investor who started it.
  businessSideReply?: boolean;
  complianceNote?: string;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`${table}:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table,
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, table, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setDraft("");

    let result;
    if (table === "listing_messages") {
      result = await supabase
        .from("listing_messages")
        .insert({ conversation_id: conversationId, sender_id: currentUserId, body, is_manager: businessSideReply })
        .select("id, sender_id, body, created_at, is_manager")
        .single();
    } else if (table === "quote_messages") {
      result = await supabase
        .from("quote_messages")
        .insert({ conversation_id: conversationId, sender_id: currentUserId, body, is_provider: businessSideReply })
        .select("id, sender_id, body, created_at, is_provider")
        .single();
    } else {
      result = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: currentUserId, body })
        .select("id, sender_id, body, created_at")
        .single();
    }

    const { data, error } = result;
    setSending(false);

    if (!error && data) {
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
    }
  }

  return (
    <div className="flex flex-1 flex-col rounded-card border border-line bg-white">
      <div className="border-b border-line px-6 py-4">
        <p className="font-display text-lg text-ink">{otherPartyName}</p>
        <p className="text-xs text-muted">{complianceNote}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted">
            No messages yet — say hello to get started.
          </p>
        )}
        {messages.map((m) => {
          // For the business side's own view, "mine" means "sent by the
          // business side" (is_manager / is_provider), not "sent by this
          // exact account" — otherwise the legacy listing auto-reply
          // (sender_id null) would render as if the other party had said it.
          let mine: boolean;
          if (table === "listing_messages" && businessSideReply) {
            mine = m.is_manager === true;
          } else if (table === "quote_messages" && businessSideReply) {
            mine = m.is_provider === true;
          } else {
            mine = m.sender_id === currentUserId;
          }
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-card px-4 py-2 text-sm",
                  mine ? "bg-ink text-white" : "bg-offwhite text-ink"
                )}
              >
                <p>{m.body}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    mine ? "text-white/60" : "text-muted"
                  )}
                >
                  {new Date(m.created_at).toLocaleTimeString("en-AU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-center gap-3 border-t border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
