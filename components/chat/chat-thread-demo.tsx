"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

type DemoMessage = {
  id: string;
  fromMe: boolean;
  body: string;
  time: string;
};

const seedMessages: DemoMessage[] = [
  {
    id: "1",
    fromMe: false,
    body: "Hi! Thanks for reaching out — happy to help with cover for your rooming house. How many rooms are we insuring?",
    time: "10:02 AM",
  },
  {
    id: "2",
    fromMe: true,
    body: "It's a 6-room property in Footscray, currently fully tenanted.",
    time: "10:04 AM",
  },
];

export function ChatThreadDemo({ otherPartyName }: { otherPartyName: string }) {
  const [messages, setMessages] = useState<DemoMessage[]>(seedMessages);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  function send() {
    const body = draft.trim();
    if (!body) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        fromMe: true,
        body,
        time: new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <div className="flex flex-1 flex-col rounded-card border border-line bg-white">
      <div className="border-b border-line px-6 py-4">
        <p className="font-display text-lg text-ink">{otherPartyName}</p>
        <p className="text-xs text-muted">
          Preview mode — this thread isn&apos;t connected to a real backend yet. Messages here
          aren&apos;t saved.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.fromMe ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[75%] rounded-card px-4 py-2 text-sm",
                m.fromMe ? "bg-ink text-white" : "bg-offwhite text-ink"
              )}
            >
              <p>{m.body}</p>
              <p className={cn("mt-1 text-[10px]", m.fromMe ? "text-white/60" : "text-muted")}>
                {m.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-center gap-3 border-t border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
        />
        <Button type="submit" size="icon" disabled={!draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
