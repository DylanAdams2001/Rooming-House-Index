import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isValidWebhookRequest } from "@/lib/webhook-auth";

export const runtime = "nodejs";
export const maxDuration = 15;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rooming-house-index.vercel.app";

// Configured as a Supabase Database Webhook (via a trigger calling
// notify_marketplace_message()) on messages INSERT — the directory-style
// categories (furnishing, maintenance, conveyancing/legal, inspectors,
// building, finance) where an investor messages one specific provider
// directly, rather than a quote request broadcast to everyone in a category.
// Unlike listing_messages/quote_messages, this table has no is_manager/
// is_provider column — the sender's side is worked out by comparing
// sender_id against the conversation's investor_id.
export async function POST(req: Request) {
  if (!isValidWebhookRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.SUPPORT_EMAIL_FROM;
  if (!apiKey || !fromAddress) {
    return NextResponse.json({ error: "Email is not configured." }, { status: 503 });
  }

  const payload = (await req.json()) as {
    type: string;
    record: { id: string; conversation_id: string; sender_id: string; body: string };
  };

  if (payload.type !== "INSERT") return NextResponse.json({ ok: true });

  const supabase = createServiceRoleClient();
  const resend = new Resend(apiKey);

  const { data: conversation } = await supabase
    .from("conversations")
    .select("investor_id, provider_id")
    .eq("id", payload.record.conversation_id)
    .maybeSingle();

  if (!conversation) return NextResponse.json({ ok: true });

  const { data: provider } = await supabase
    .from("service_providers")
    .select("user_id, business_name, contact_email")
    .eq("id", conversation.provider_id)
    .maybeSingle();

  if (!provider) return NextResponse.json({ ok: true });

  const senderIsInvestor = payload.record.sender_id === conversation.investor_id;

  if (senderIsInvestor) {
    // Investor messaged the provider — notify the provider.
    if (!provider.contact_email) return NextResponse.json({ ok: true });

    const { error: sendError } = await resend.emails.send({
      from: `Rooming House Index <${fromAddress}>`,
      to: provider.contact_email,
      subject: "NEW MESSAGE - Rooming House Index",
      text: `An investor sent you a message:\n\n"${payload.record.body}"\n\nReply here: ${SITE_URL}/partners/messages/${payload.record.conversation_id}`,
    });

    if (sendError) return NextResponse.json({ ok: false, reason: sendError.message }, { status: 502 });
    return NextResponse.json({ ok: true });
  }

  // Provider messaged the investor — notify the investor.
  const { data: investor } = await supabase
    .from("users")
    .select("email")
    .eq("id", conversation.investor_id)
    .maybeSingle();

  if (!investor?.email) return NextResponse.json({ ok: true });

  const { error: sendError } = await resend.emails.send({
    from: `Rooming House Index <${fromAddress}>`,
    to: investor.email,
    subject: `NEW REPLY - ${provider.business_name}`,
    text: `${provider.business_name} sent you a message:\n\n"${payload.record.body}"\n\nReply here: ${SITE_URL}/dashboard/messages/${payload.record.conversation_id}`,
  });

  if (sendError) return NextResponse.json({ ok: false, reason: sendError.message }, { status: 502 });
  return NextResponse.json({ ok: true });
}
