"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  escalate?: boolean;
};

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the Rooming House Standard support assistant. Ask me anything about listings, applications, or investor data.",
};

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [escalated, setEscalated] = useState<"idle" | "offered" | "sending" | "sent">("idle");
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, escalated]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAccountEmail(data.user?.email ?? null);
    });
    // This widget lives in the root layout and never remounts across
    // client-side navigations — a one-time getUser() call above only ever
    // reflects whatever the auth state was the moment the app first loaded
    // (often before login, e.g. on /login or /signup itself), so without
    // this listener the widget stays hidden after signing up until someone
    // manually reloads the page.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccountEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { reply: string; escalate: boolean };

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, escalate: data.escalate },
      ]);
      if (data.escalate) setEscalated("offered");
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again in a moment.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function handleEscalate() {
    const summaryText = summary.trim();
    if (!summaryText) return;
    setEscalated("sending");
    try {
      const res = await fetch("/api/support-chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(({ role, content }) => ({ role, content })),
          contactEmail: accountEmail || undefined,
          summary: summaryText,
        }),
      });
      setEscalated(res.ok ? "sent" : "offered");
    } catch {
      setEscalated("offered");
    }
  }

  const lastMessageEscalates = Boolean(messages[messages.length - 1]?.escalate);

  if (!accountEmail) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 flex h-[520px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-card border border-line bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-line bg-ink px-4 py-3">
            <p className="font-display text-sm text-white">Support Chat</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-card px-3 py-2 text-sm",
                    m.role === "user" ? "bg-ink text-white" : "bg-linen text-ink"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-card bg-linen px-3 py-2 text-sm text-muted">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking…
                </div>
              </div>
            )}

            {lastMessageEscalates && (
              <div className="rounded-card border border-line bg-offwhite p-3">
                <div className="space-y-2">
                  <p className="text-sm text-body">
                    Want me to send this to our team? Briefly describe what you need help with:
                  </p>
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="e.g. I can't see my rental application, can someone check it?"
                    rows={3}
                    className="text-sm"
                    disabled={escalated === "sending" || escalated === "sent"}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className={cn(
                      "w-full transition-colors duration-300",
                      escalated === "sent" && "bg-green-600 hover:bg-green-600"
                    )}
                    disabled={
                      escalated === "sending" || escalated === "sent" || !summary.trim()
                    }
                    onClick={handleEscalate}
                  >
                    {escalated === "sending" && (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                      </>
                    )}
                    {escalated === "sent" && (
                      <>
                        <Check className="mr-2 h-4 w-4" /> Sent to support team
                      </>
                    )}
                    {(escalated === "offered" || escalated === "idle") &&
                      "Send to support team"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="h-10 text-sm"
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={sending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <Button
        type="button"
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}
