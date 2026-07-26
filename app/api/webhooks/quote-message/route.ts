import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isValidWebhookRequest } from "@/lib/webhook-auth";
import { serviceCategories } from "@/lib/service-categories";
import { renderEmailHtml, renderEmailText, type EmailBlock } from "@/lib/email-template";
import { firstNameOf } from "@/lib/greeting";

export const runtime = "nodejs";
export const maxDuration = 15;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rooming-house-index.vercel.app";

// Configured as a Supabase Database Webhook (via a trigger calling
// notify_quote_message()) on quote_messages INSERT. Fires both ways: a
// provider's reply notifies the investor who submitted the request, and an
// investor's reply notifies that specific provider back.
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
    record: { id: string; conversation_id: string; sender_id: string | null; is_provider: boolean; body: string };
  };

  if (payload.type !== "INSERT") return NextResponse.json({ ok: true });

  const supabase = createServiceRoleClient();
  const resend = new Resend(apiKey);

  const { data: conversation } = await supabase
    .from("quote_conversations")
    .select("request_id, provider_id")
    .eq("id", payload.record.conversation_id)
    .maybeSingle();

  if (!conversation) return NextResponse.json({ ok: true });

  const [{ data: request }, { data: provider }] = await Promise.all([
    supabase
      .from("service_quote_requests")
      .select("user_id, category, property_address")
      .eq("id", conversation.request_id)
      .maybeSingle(),
    supabase
      .from("service_providers")
      .select("business_name, contact_email")
      .eq("id", conversation.provider_id)
      .maybeSingle(),
  ]);

  if (!request || !provider) return NextResponse.json({ ok: true });

  if (payload.record.is_provider) {
    // The provider replied — notify the investor.
    const { data: investor } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", request.user_id)
      .maybeSingle();

    if (!investor?.email) return NextResponse.json({ ok: true });

    const categorySlug =
      serviceCategories.find((c) => c.dbCategory === request.category)?.slug ?? request.category;
    const name = firstNameOf(investor.full_name, investor.email);
    const url = `${SITE_URL}/dashboard/services/${categorySlug}/requests/${conversation.request_id}/${conversation.provider_id}`;
    const blocks: EmailBlock[] = [
      {
        type: "paragraph",
        text: `${provider.business_name} just replied about your quote request for ${request.property_address}:`,
      },
      { type: "quote", text: payload.record.body },
    ];

    const { error: sendError } = await resend.emails.send({
      from: `Rooming House Index <${fromAddress}>`,
      to: investor.email,
      subject: `NEW REPLY - ${request.property_address}`,
      html: renderEmailHtml({ heading: `Hi ${name}, you've got a reply`, blocks, cta: { label: "View conversation", url } }),
      text: `Hi ${name}, you've got a reply\n\n${renderEmailText(blocks, { label: "View conversation", url })}`,
    });

    if (sendError) return NextResponse.json({ ok: false, reason: sendError.message }, { status: 502 });
    return NextResponse.json({ ok: true });
  }

  // The investor replied — notify the provider.
  if (!provider.contact_email) return NextResponse.json({ ok: true });

  const url = `${SITE_URL}/partners/quotes/${conversation.request_id}`;
  const blocks: EmailBlock[] = [
    { type: "paragraph", text: `An investor just replied about their quote request for ${request.property_address}:` },
    { type: "quote", text: payload.record.body },
  ];

  const { error: sendError } = await resend.emails.send({
    from: `Rooming House Index <${fromAddress}>`,
    to: provider.contact_email,
    subject: `NEW REPLY - ${request.property_address}`,
    html: renderEmailHtml({ heading: `Hi ${provider.business_name}, you've got a reply`, blocks, cta: { label: "View conversation", url } }),
    text: `Hi ${provider.business_name}, you've got a reply\n\n${renderEmailText(blocks, { label: "View conversation", url })}`,
  });

  if (sendError) return NextResponse.json({ ok: false, reason: sendError.message }, { status: 502 });
  return NextResponse.json({ ok: true });
}
