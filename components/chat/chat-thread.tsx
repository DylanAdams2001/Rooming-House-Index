"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, X, FileText } from "lucide-react";
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
  attachment_url?: string | null;
  attachment_name?: string | null;
};

type Table = "messages" | "listing_messages" | "quote_messages";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif"];

function isImageAttachment(name?: string | null) {
  const ext = name?.split(".").pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.includes(ext);
}

export function ChatThread({
  conversationId,
  currentUserId,
  otherPartyName,
  initialMessages,
  table = "messages",
  businessSideReply = false,
  complianceNote = "All messages here are visible to Rooming House Standard for payment and compliance purposes.",
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
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ url: string; name: string } | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Opening this conversation marks it read server-side (in the page that
    // renders this component), but the sidebar/topbar unread badge lives in a
    // parent layout that Next.js doesn't re-fetch on a plain client-side
    // navigation — so without this the dot stays lit until a manual reload.
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachError(null);
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${currentUserId}/${conversationId}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("message-attachments")
      .upload(path, file);

    setUploading(false);
    if (uploadError) {
      setAttachError("Couldn't attach that file — please try again.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("message-attachments").getPublicUrl(path);
    setPendingFile({ url: publicUrl, name: file.name });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function sendMessage() {
    const body = draft.trim();
    if (!body && !pendingFile) return;
    setSending(true);
    setDraft("");
    const attachment = pendingFile;
    setPendingFile(null);

    const attachmentColumns = { attachment_url: attachment?.url ?? null, attachment_name: attachment?.name ?? null };

    let result;
    if (table === "listing_messages") {
      result = await supabase
        .from("listing_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          body,
          is_manager: businessSideReply,
          ...attachmentColumns,
        })
        .select("id, sender_id, body, created_at, is_manager, attachment_url, attachment_name")
        .single();
    } else if (table === "quote_messages") {
      result = await supabase
        .from("quote_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          body,
          is_provider: businessSideReply,
          ...attachmentColumns,
        })
        .select("id, sender_id, body, created_at, is_provider, attachment_url, attachment_name")
        .single();
    } else {
      result = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: currentUserId, body, ...attachmentColumns })
        .select("id, sender_id, body, created_at, attachment_url, attachment_name")
        .single();
    }

    const { data, error } = result;
    setSending(false);

    if (!error && data) {
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      router.refresh();
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
                {m.attachment_url && (
                  isImageAttachment(m.attachment_name) ? (
                    <a href={m.attachment_url} target="_blank" rel="noreferrer" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.attachment_url}
                        alt={m.attachment_name ?? "Attachment"}
                        className="mb-2 max-h-64 w-full rounded-btn object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      href={m.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "mb-2 flex items-center gap-2 rounded-btn border px-3 py-2 text-xs underline underline-offset-2",
                        mine ? "border-white/30" : "border-line"
                      )}
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{m.attachment_name ?? "Attachment"}</span>
                    </a>
                  )
                )}
                {m.body && <p>{m.body}</p>}
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

      <div className="border-t border-line p-4">
        {attachError && <p className="mb-2 text-xs text-red-600">{attachError}</p>}
        {pendingFile && (
          <div className="mb-2 flex items-center justify-between rounded-btn border border-line bg-offwhite px-3 py-2 text-xs">
            <span className="flex items-center gap-2 truncate">
              <Paperclip className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{pendingFile.name}</span>
            </span>
            <button
              type="button"
              onClick={() => setPendingFile(null)}
              aria-label="Remove attachment"
              className="shrink-0 text-muted hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <form
          className="flex items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={uploading || sending}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach a file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={uploading ? "Uploading attachment…" : "Write a message…"}
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || uploading || (!draft.trim() && !pendingFile)}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
