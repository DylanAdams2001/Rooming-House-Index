import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { serviceCategories } from "@/lib/service-categories";
import { renderEmailHtml, renderEmailText, type EmailBlock } from "@/lib/email-template";

export const runtime = "nodejs";
export const maxDuration = 15;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rooming-house-index.vercel.app";

// Configured as a raw Postgres trigger (net.http_post) on
// service_quote_quotes UPDATE, same pattern as the referral-progress
// webhook — fires whenever `accepted` flips to true, i.e. an investor has
// chosen a provider for a quote request. Notifies every admin account,
// queried live rather than hardcoded, so a newly added admin is covered
// automatically.
export async function POST(req: Request) {
  const expected = process.env.REFERRAL_WEBHOOK_SECRET;
  if (!expected || req.headers.get("x-webhook-secret") !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as {
    type: string;
    record: { id: string; request_id: string; provider_id: string; provider_name: string };
    old_record?: { accepted: boolean } | null;
  };

  if (payload.type !== "UPDATE") return NextResponse.json({ ok: true });

  const { record, old_record } = payload;
  if (!record.id || old_record?.accepted) return NextResponse.json({ ok: true });

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.SUPPORT_EMAIL_FROM;
  if (!apiKey || !fromAddress) {
    return NextResponse.json({ error: "Email is not configured." }, { status: 503 });
  }

  const supabase = createServiceRoleClient();

  const [{ data: quote }, { data: admins }] = await Promise.all([
    supabase
      .from("service_quote_quotes")
      .select("monthly_fee_pct, flat_fee, service_quote_requests(property_address, category, user_id)")
      .eq("id", record.id)
      .maybeSingle(),
    supabase.from("users").select("email").eq("role", "admin"),
  ]);

  const adminEmails = (admins ?? []).map((a) => a.email).filter(Boolean);
  if (adminEmails.length === 0) return NextResponse.json({ ok: true });

  const request = quote?.service_quote_requests as unknown as {
    property_address: string;
    category: string;
    user_id: string;
  } | null;

  const { data: investor } = request
    ? await supabase.from("users").select("full_name, email").eq("id", request.user_id).maybeSingle()
    : { data: null };

  const categoryLabel = serviceCategories.find((c) => c.dbCategory === request?.category)?.label ?? request?.category;
  const fee = quote?.monthly_fee_pct ? `${quote.monthly_fee_pct}% of rent per year` : quote?.flat_fee ?? "quote provided";
  const investorName = investor?.full_name ?? investor?.email ?? "An investor";

  const resend = new Resend(apiKey);
  const blocks: EmailBlock[] = [
    {
      type: "paragraph",
      text: `${investorName} has accepted ${record.provider_name}'s ${categoryLabel ?? ""} quote (${fee}) for ${request?.property_address ?? "a property"}.`,
    },
  ];

  const { error: sendError } = await resend.emails.send({
    from: `Rooming House Standard <${fromAddress}>`,
    to: adminEmails,
    subject: `Quote accepted — ${request?.property_address ?? "property"}`,
    html: renderEmailHtml({
      heading: "A quote was accepted",
      blocks,
      cta: { label: "View in All Quotes", url: `${SITE_URL}/partners/admin/quotes` },
    }),
    text: `A quote was accepted\n\n${renderEmailText(blocks)}`,
  });

  if (sendError) return NextResponse.json({ ok: false, reason: sendError.message }, { status: 502 });
  return NextResponse.json({ ok: true });
}
