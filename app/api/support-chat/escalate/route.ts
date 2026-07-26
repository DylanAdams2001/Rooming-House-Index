import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderEmailHtml, renderEmailText, type EmailBlock } from "@/lib/email-template";

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

  const { messages, contactEmail, summary } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    contactEmail?: string;
    summary?: string;
  };

  if (!Array.isArray(messages) || messages.length === 0 || !summary?.trim()) {
    return NextResponse.json({ error: "No conversation provided." }, { status: 400 });
  }

  const resend = new Resend(apiKey);

  const blocks: EmailBlock[] = [
    { type: "paragraph", text: "A visitor on the support chat needs help the bot couldn't provide." },
    { type: "quote", text: summary.trim() },
    {
      type: "paragraph",
      text: contactEmail
        ? `Contact email: ${contactEmail} — just hit reply to respond to them directly.`
        : "No contact email was provided — ask for one if you reply.",
    },
  ];

  const { error } = await resend.emails.send({
    from: `Rooming House Index <${fromAddress}>`,
    to: SUPPORT_RECIPIENTS,
    replyTo: contactEmail || undefined,
    subject: "You have a new support chat message — Rooming House Index",
    html: renderEmailHtml({ heading: "New support chat message", blocks }),
    text: renderEmailText(blocks),
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send escalation email." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
