import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isValidWebhookRequest } from "@/lib/webhook-auth";
import { renderEmailHtml, renderEmailText, type EmailBlock } from "@/lib/email-template";
import { serviceCategories } from "@/lib/service-categories";

export const runtime = "nodejs";
export const maxDuration = 15;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rooming-house-index.vercel.app";

// Configured as a Supabase Database Webhook on service_quote_requests INSERT.
// Fans the new request out to every approved service_providers row in that
// category — a property manager's account has one of these rows the same as
// any other provider (category="property_management"), so both categories
// use the exact same query. Broadcast to everyone who could plausibly quote
// it, rather than a single fixed recipient.
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
      user_id: string;
      category: string;
      property_address: string;
      number_of_rooms: number | null;
      notes: string | null;
    };
  };

  if (payload.type !== "INSERT") {
    return NextResponse.json({ ok: true });
  }

  const { user_id, category, property_address, number_of_rooms, notes } = payload.record;
  const supabase = createServiceRoleClient();
  const resend = new Resend(apiKey);

  const { data: client } = await supabase
    .from("users")
    .select("full_name, email, phone")
    .eq("id", user_id)
    .maybeSingle();

  // Driven by lib/service-categories.ts's quoteBased flag rather than a
  // hardcoded list — any category flipped to quoteBased (e.g. Building)
  // starts broadcasting requests without needing a change here.
  const categoryConfig = serviceCategories.find((c) => c.dbCategory === category);
  if (!categoryConfig?.quoteBased) {
    return NextResponse.json({ ok: true });
  }

  const categoryLabel = categoryConfig.label.toLowerCase();

  // Admin-managed categories (Building, for now) never broadcast to real
  // providers — admin enters the price options by hand, so admin is who
  // needs to know a request came in, not the category's service_providers.
  const recipients = categoryConfig.adminManagedQuotes
    ? (await supabase.from("users").select("email").eq("role", "admin")).data?.map((a) => a.email) ?? []
    : (await supabase.from("service_providers").select("contact_email").eq("category", category).eq("status", "approved"))
        .data?.map((r) => r.contact_email) ?? [];

  // alsoNotifyAdmin (Insurance, for now) adds admin on top of the normal
  // provider broadcast, rather than replacing it like adminManagedQuotes does.
  if (categoryConfig.alsoNotifyAdmin && !categoryConfig.adminManagedQuotes) {
    const { data: admins } = await supabase.from("users").select("email").eq("role", "admin");
    recipients.push(...(admins?.map((a) => a.email) ?? []));
  }

  const validRecipients = Array.from(new Set(recipients.filter(Boolean)));
  if (validRecipients.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const blocks: EmailBlock[] = [
    { type: "paragraph", text: `A new ${categoryLabel} quote request just came in for ${property_address}.` },
    {
      type: "list",
      items: [
        ...(number_of_rooms ? [`${number_of_rooms} rooms`] : []),
        ...(notes ? [`Notes: ${notes}`] : []),
        ...(client?.full_name ? [`Client: ${client.full_name}`] : []),
        ...(client?.email ? [`Email: ${client.email}`] : []),
        ...(client?.phone ? [`Phone: ${client.phone}`] : []),
      ],
    },
    {
      type: "paragraph",
      text:
        categoryConfig.adminManagedQuotes || categoryConfig.alsoNotifyAdmin
          ? "Head over to All Quotes to see the full details and add a quote."
          : "Head over to Quote Requests to reply with your quote.",
    },
  ];

  // alsoNotifyAdmin mixes admin + provider recipients into one email, so the
  // link points at admin's All Quotes view — that's who's actually expected
  // to act on it today (no real provider exists in this category yet).
  const ctaUrl =
    categoryConfig.adminManagedQuotes || categoryConfig.alsoNotifyAdmin
      ? `${SITE_URL}/partners/admin/quotes`
      : `${SITE_URL}/partners/quotes`;
  const ctaLabel =
    categoryConfig.adminManagedQuotes || categoryConfig.alsoNotifyAdmin
      ? "View in All Quotes"
      : "View quote requests";

  await resend.emails.send({
    from: `Rooming House Standard <${fromAddress}>`,
    to: validRecipients,
    subject: `NEW QUOTE REQUEST - ${property_address}`,
    html: renderEmailHtml({
      heading: "A new quote request just came in",
      blocks,
      cta: { label: ctaLabel, url: ctaUrl },
    }),
    text: renderEmailText(blocks, { label: ctaLabel, url: ctaUrl }),
  });

  return NextResponse.json({ ok: true });
}
