import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const ESCALATE_MARKER = "[[ESCALATE]]";

const SYSTEM_PROMPT = `You are the support assistant for Rooming House Index, a website that lists self-contained rooming house rooms across Victoria, Australia, and also sells suburb-level market data to property investors.

What the site does:
- Renters can browse room listings at /listings with photos, pricing, and inspection times without needing an account.
- To enquire about a room or book an inspection, a renter creates a free account (/signup) and can message the property team directly in a conversation thread.
- Renters fill in one rental application (tenant profile) that is reused across every room they enquire about, so they don't re-enter their details each time.
- Investors get an optional add-on (currently free, during early access) on the same account: a Suburb Explorer map, market overview data (average room rates, demand level, registered rooming house counts sourced from the Consumer Affairs Victoria register), and a marketplace to message vetted insurance, legal, inspection, and maintenance providers.
- Everything lives under one login — investor access sits on top of the normal account, nothing separate to create.
- Property owners/managers can list rooms and receive enquiries and applications through the same messaging system.

Your job:
1. Answer common questions about how the site works, listings, applications, messaging, investor data, pricing (free during early access), and account basics, in a friendly, concise way (2-4 sentences, no unnecessary preamble).
2. If you don't know the answer, if it needs looking at the user's specific account/listing/payment, or the user explicitly asks for a human/staff member, do NOT make anything up. Instead say you'll pass it on to the team, and end your reply with the exact marker ${ESCALATE_MARKER} on its own at the very end (it will be stripped before the user sees your message).
3. Never invent details about specific listings, prices, bookings, or account data you have not been given in the conversation.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Support chat is not configured." },
      { status: 503 }
    );
  }

  const { messages } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const rawText = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  const escalate = rawText.includes(ESCALATE_MARKER);
  const reply = rawText.replace(ESCALATE_MARKER, "").trim();

  return NextResponse.json({ reply, escalate });
}
