import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isValidWebhookRequest } from "@/lib/webhook-auth";
import { renderEmailHtml, renderEmailText, type EmailBlock } from "@/lib/email-template";

export const runtime = "nodejs";
export const maxDuration = 15;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rooming-house-index.vercel.app";

// Configured as a Supabase Database Webhook on public.users INSERT — fires
// the moment handle_new_user() creates the row (i.e. right after signup,
// before any onboarding step), so all that's guaranteed to exist yet is the
// email. Every admin gets one email per new account, same broadcast pattern
// as the quote-request webhook.
//
// Uses its own NEW_SIGNUP_WEBHOOK_SECRET rather than the shared
// SUPABASE_WEBHOOK_SECRET every other webhook route uses — that shared
// secret became unreadable once Vercel marked it Sensitive, so a fresh,
// independently-set secret sidesteps needing to rotate (and re-configure
// everywhere) the one already in production use.
export async function POST(req: Request) {
  if (!isValidWebhookRequest(req, "NEW_SIGNUP_WEBHOOK_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.SUPPORT_EMAIL_FROM;
  if (!apiKey || !fromAddress) {
    return NextResponse.json({ error: "Email is not configured." }, { status: 503 });
  }

  const payload = (await req.json()) as {
    type: string;
    record: { id: string; email: string; created_at?: string };
  };

  if (payload.type !== "INSERT") {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceRoleClient();
  const resend = new Resend(apiKey);

  const { data: admins } = await supabase.from("users").select("email").eq("role", "admin");
  const recipients = Array.from(new Set((admins ?? []).map((a) => a.email).filter(Boolean)));
  if (recipients.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const blocks: EmailBlock[] = [
    { type: "paragraph", text: `A new account just signed up: ${payload.record.email}` },
    {
      type: "paragraph",
      text: "They're just starting onboarding — full name, phone, and investor/tenant intent will follow shortly if they complete it.",
    },
  ];

  await resend.emails.send({
    from: `Rooming House Standard <${fromAddress}>`,
    to: recipients,
    subject: `NEW SIGNUP - ${payload.record.email}`,
    html: renderEmailHtml({
      heading: "New signup",
      blocks,
      cta: { label: "Open Partner Portal", url: `${SITE_URL}/partners` },
    }),
    text: renderEmailText(blocks, { label: "Open Partner Portal", url: `${SITE_URL}/partners` }),
  });

  return NextResponse.json({ ok: true });
}
