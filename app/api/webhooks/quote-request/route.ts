import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isValidWebhookRequest } from "@/lib/webhook-auth";
import { renderEmailHtml, renderEmailText, type EmailBlock } from "@/lib/email-template";

export const runtime = "nodejs";
export const maxDuration = 15;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rooming-house-index.vercel.app";

// Configured as a Supabase Database Webhook on service_quote_requests INSERT.
// Fans the new request out by category: a property-management quote goes to
// every property_manager account, an insurance quote goes to every approved
// insurance provider — broadcast to everyone who could plausibly quote it,
// rather than a single fixed recipient.
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
      id: string;
      category: string;
      property_address: string;
      number_of_rooms: number | null;
      notes: string | null;
    };
  };

  if (payload.type !== "INSERT") {
    return NextResponse.json({ ok: true });
  }

  const { category, property_address, number_of_rooms, notes } = payload.record;
  const supabase = createServiceRoleClient();
  const resend = new Resend(apiKey);

  let recipients: string[] = [];

  if (category === "property_management") {
    const { data } = await supabase.from("users").select("email").eq("role", "property_manager");
    recipients = (data ?? []).map((r) => r.email).filter(Boolean);
  } else if (category === "insurance") {
    const { data } = await supabase
      .from("service_providers")
      .select("contact_email")
      .eq("category", "insurance")
      .eq("status", "approved");
    recipients = (data ?? []).map((r) => r.contact_email).filter(Boolean);
  }

  if (recipients.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const categoryLabel = category === "property_management" ? "property management" : "insurance";

  const blocks: EmailBlock[] = [
    { type: "paragraph", text: `A new ${categoryLabel} quote request just came in for ${property_address}.` },
    {
      type: "list",
      items: [
        ...(number_of_rooms ? [`${number_of_rooms} rooms`] : []),
        ...(notes ? [`Notes: ${notes}`] : []),
      ],
    },
    { type: "paragraph", text: "Head over to Quote Requests to reply with your quote." },
  ];

  await resend.emails.send({
    from: `Rooming House Index <${fromAddress}>`,
    to: recipients,
    subject: `NEW QUOTE REQUEST - ${property_address}`,
    html: renderEmailHtml({
      heading: "A new quote request just came in",
      blocks,
      cta: { label: "View quote requests", url: `${SITE_URL}/partners/quotes` },
    }),
    text: renderEmailText(blocks, { label: "View quote requests", url: `${SITE_URL}/partners/quotes` }),
  });

  return NextResponse.json({ ok: true });
}
