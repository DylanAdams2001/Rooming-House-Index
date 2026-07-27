import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isValidWebhookRequest } from "@/lib/webhook-auth";
import { renderEmailHtml, renderEmailText, type EmailBlock } from "@/lib/email-template";

export const runtime = "nodejs";
export const maxDuration = 15;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rooming-house-index.vercel.app";
const REFERRAL_GOAL = 3;

// Configured as a Supabase Database Webhook on public.users UPDATE. Fires on
// every user row update (no column-level filter needed) — the checks below
// bail out fast for the vast majority of updates that aren't a referred
// user's investor_access flipping to 'active' for the first time. Only that
// moment counts as a "successful" referral, not signup itself.
export async function POST(req: Request) {
  if (!isValidWebhookRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as {
    type: string;
    record: { id: string; investor_access: string; referred_by: string | null };
    old_record?: { investor_access: string } | null;
  };

  if (payload.type !== "UPDATE") return NextResponse.json({ ok: true });

  const { record, old_record } = payload;
  const justActivated = record.investor_access === "active" && old_record?.investor_access !== "active";
  if (!justActivated || !record.referred_by) return NextResponse.json({ ok: true });

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.SUPPORT_EMAIL_FROM;
  if (!apiKey || !fromAddress) {
    return NextResponse.json({ error: "Email is not configured." }, { status: 503 });
  }

  const supabase = createServiceRoleClient();

  const { data: referrer } = await supabase
    .from("users")
    .select("id, email, full_name, referral_reward_notified_at")
    .eq("id", record.referred_by)
    .maybeSingle();

  if (!referrer || referrer.referral_reward_notified_at) return NextResponse.json({ ok: true });

  const { data: count } = await supabase.rpc("count_successful_referrals", {
    p_user_id: referrer.id,
  });

  if ((count ?? 0) < REFERRAL_GOAL) return NextResponse.json({ ok: true });

  const resend = new Resend(apiKey);
  const referrerName = referrer.full_name ?? referrer.email;

  const blocks: EmailBlock[] = [
    {
      type: "paragraph",
      text: `${referrerName} (${referrer.email}) has now referred ${count} friends who became active investors — they've hit the 3-referral goal for the $10k builder credit.`,
    },
    { type: "paragraph", text: "Reach out to arrange the credit." },
  ];

  const { error: sendError } = await resend.emails.send({
    from: `Rooming House Index <${fromAddress}>`,
    to: ["dylan@keyspaceproperty.com.au", "aaron@keyspaceproperty.com.au"],
    subject: `Referral reward earned — ${referrerName}`,
    html: renderEmailHtml({
      heading: "Referral reward earned",
      blocks,
      cta: { label: "View in Supabase", url: `${SITE_URL}/dashboard` },
    }),
    text: `Referral reward earned\n\n${renderEmailText(blocks)}`,
  });

  if (sendError) return NextResponse.json({ ok: false, reason: sendError.message }, { status: 502 });

  await supabase
    .from("users")
    .update({ referral_reward_notified_at: new Date().toISOString() })
    .eq("id", referrer.id);

  return NextResponse.json({ ok: true });
}
