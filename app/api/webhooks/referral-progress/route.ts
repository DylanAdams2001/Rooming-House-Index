import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { renderEmailHtml, renderEmailText, type EmailBlock } from "@/lib/email-template";

export const runtime = "nodejs";
export const maxDuration = 15;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rooming-house-index.vercel.app";
const REFERRAL_GOAL = 3;

// Configured as a Supabase Database Webhook on public.users UPDATE. Fires on
// every user row update (no column-level filter needed) — the checks below
// bail out fast for the vast majority of updates that aren't a brand-new
// signup's referred_by column being stamped for the first time (see
// auth-form.tsx / auth/callback/route.ts). No paid subscription any more —
// a referral counts the moment someone signs up via the link, not once they
// clear a payment gate that no longer exists.
// Uses its own secret (REFERRAL_WEBHOOK_SECRET) rather than the shared
// SUPABASE_WEBHOOK_SECRET every other webhook route uses — that one got set
// as a Vercel "Sensitive" env var at some point, which is write-only and can
// never be viewed again, so there was no way to reuse it for this trigger.
export async function POST(req: Request) {
  const expected = process.env.REFERRAL_WEBHOOK_SECRET;
  if (!expected || req.headers.get("x-webhook-secret") !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as {
    type: string;
    record: { id: string; referred_by: string | null };
    old_record?: { referred_by: string | null } | null;
  };

  if (payload.type !== "UPDATE") return NextResponse.json({ ok: true });

  const { record, old_record } = payload;
  const justReferred = !!record.referred_by && !old_record?.referred_by;
  if (!justReferred) return NextResponse.json({ ok: true });

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

  const adminBlocks: EmailBlock[] = [
    {
      type: "paragraph",
      text: `${referrerName} (${referrer.email}) has now referred ${count} friends who signed up — they've hit the 3-referral goal for the $10k builder credit.`,
    },
    { type: "paragraph", text: "Reach out to arrange the credit." },
  ];

  const { error: adminSendError } = await resend.emails.send({
    from: `Rooming House Standard <${fromAddress}>`,
    to: ["dylan@keyspaceproperty.com.au", "aaron@keyspaceproperty.com.au"],
    subject: `Referral reward earned — ${referrerName}`,
    html: renderEmailHtml({
      heading: "Referral reward earned",
      blocks: adminBlocks,
      cta: { label: "View in Supabase", url: `${SITE_URL}/dashboard` },
    }),
    text: `Referral reward earned\n\n${renderEmailText(adminBlocks)}`,
  });

  if (adminSendError) return NextResponse.json({ ok: false, reason: adminSendError.message }, { status: 502 });

  if (referrer.email) {
    const referrerFirstName = referrer.full_name?.split(" ")[0] ?? "there";
    const referrerBlocks: EmailBlock[] = [
      {
        type: "paragraph",
        text: "You've referred 3 friends to Rooming House Standard — that's the goal for your $10k builder credit!",
      },
      { type: "paragraph", text: "Our team will be in touch shortly to arrange the details." },
    ];

    await resend.emails.send({
      from: `Rooming House Standard <${fromAddress}>`,
      to: referrer.email,
      subject: "You've earned your $10k builder credit!",
      html: renderEmailHtml({
        heading: `Nice work, ${referrerFirstName}!`,
        blocks: referrerBlocks,
        cta: { label: "View your dashboard", url: `${SITE_URL}/dashboard` },
      }),
      text: `Nice work, ${referrerFirstName}!\n\n${renderEmailText(referrerBlocks)}`,
    });
  }

  await supabase
    .from("users")
    .update({ referral_reward_notified_at: new Date().toISOString() })
    .eq("id", referrer.id);

  return NextResponse.json({ ok: true });
}
