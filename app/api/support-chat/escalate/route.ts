import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const SUPPORT_RECIPIENTS = ["dylan@keyspaceproperty.com.au", "aaron@keyspaceproperty.com.au"];

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.SUPPORT_EMAIL_FROM;
  if (!apiKey || !fromAddress) {
    return NextResponse.json(
      { error: "Support escalation email is not configured." },
      { status: 503 }
    );
  }

  const { messages, contactEmail } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    contactEmail?: string;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No conversation provided." }, { status: 400 });
  }

  const transcript = messages
    .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: SUPPORT_RECIPIENTS,
    replyTo: contactEmail || undefined,
    subject: "Support chat escalation — Rooming House Index",
    text: `A visitor's support chat needs a human follow-up.\n\nContact email: ${
      contactEmail || "not provided"
    }\n\nConversation:\n\n${transcript}`,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send escalation email." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
