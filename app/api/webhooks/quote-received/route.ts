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
// notify_quote_received()) on service_quote_quotes INSERT — a provider's
// formal quote submission (price + optional document), separate from the
// quote_messages chat notifications. Emails the investor who submitted the
// original request. Deliberately doesn't include the price itself — that's
// what the Services page popup is for, this is just the heads-up.
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
    record: {
      request_id: string;
      provider_name: string;
      notes: string | null;
    };
  };

  if (payload.type !== "INSERT") return NextResponse.json({ ok: true });

  const supabase = createServiceRoleClient();
  const resend = new Resend(apiKey);

  const { data: request } = await supabase
    .from("service_quote_requests")
    .select("user_id, category, property_address")
    .eq("id", payload.record.request_id)
    .maybeSingle();

  if (!request) return NextResponse.json({ ok: true });

  const { data: investor } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("id", request.user_id)
    .maybeSingle();

  if (!investor?.email) return NextResponse.json({ ok: true });

  const categorySlug =
    serviceCategories.find((c) => c.dbCategory === request.category)?.slug ?? request.category;
  const name = firstNameOf(investor.full_name, investor.email);
  const url = `${SITE_URL}/dashboard/services/${categorySlug}`;

  const blocks: EmailBlock[] = [
    {
      type: "paragraph",
      text: `${payload.record.provider_name} just sent through a quote for ${request.property_address}.`,
    },
    ...(payload.record.notes
      ? ([{ type: "quote", text: payload.record.notes }] as EmailBlock[])
      : []),
    { type: "paragraph", text: "Head over to your Services page to see the full details and compare it against anything else that's come in." },
  ];

  const { error: sendError } = await resend.emails.send({
    from: `Rooming House Standard <${fromAddress}>`,
    to: investor.email,
    subject: `NEW QUOTE - ${request.property_address}`,
    html: renderEmailHtml({
      heading: `Hi ${name}, great news!`,
      blocks,
      cta: { label: "View your quote", url },
    }),
    text: `Hi ${name}, great news!\n\n${renderEmailText(blocks, { label: "View your quote", url })}`,
  });

  if (sendError) return NextResponse.json({ ok: false, reason: sendError.message }, { status: 502 });
  return NextResponse.json({ ok: true });
}
