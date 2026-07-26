import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isValidWebhookRequest } from "@/lib/webhook-auth";

export const runtime = "nodejs";
// pg_net's own call timeout is set generously in the trigger function, but
// this keeps Vercel from cutting the function off early on a cold start too.
export const maxDuration = 15;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rooming-house-index.vercel.app";

// Configured as a Supabase Database Webhook (via a trigger calling
// notify_listing_message()) on listing_messages INSERT. Fires both ways:
// a tenant's message notifies the property manager who owns the listing,
// and a manager's reply notifies the tenant back, each with a link to open
// the conversation and reply from the site.
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
    table: string;
    record: { id: string; conversation_id: string; sender_id: string | null; is_manager: boolean; body: string };
  };

  if (payload.type !== "INSERT") {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceRoleClient();
  const resend = new Resend(apiKey);

  const { data: conversation } = await supabase
    .from("listing_conversations")
    .select("listing_id, tenant_id")
    .eq("id", payload.record.conversation_id)
    .maybeSingle();

  if (!conversation) return NextResponse.json({ ok: true });

  // These three only depend on the conversation row, not on each other —
  // run them together instead of one after another to shave real latency
  // off a cold-started function (this is what was causing pg_net's 5s
  // timeout to trip before the request ever finished).
  const [{ data: listing }, { data: tenant }, { data: profile }] = await Promise.all([
    supabase.from("listings").select("owner_id, address").eq("id", conversation.listing_id).maybeSingle(),
    supabase.from("users").select("email, full_name, phone").eq("id", conversation.tenant_id).maybeSingle(),
    supabase.from("tenant_profiles").select("*").eq("user_id", conversation.tenant_id).maybeSingle(),
  ]);

  if (!listing) return NextResponse.json({ ok: true });

  if (payload.record.is_manager) {
    // The property manager replied — notify the tenant, with the reply text
    // and a link straight back into their side of the conversation.
    if (!tenant?.email) return NextResponse.json({ ok: true });

    const { error: sendError } = await resend.emails.send({
      from: fromAddress,
      to: tenant.email,
      subject: `New reply about ${listing.address}`,
      text: `The property team replied about ${listing.address}:\n\n"${payload.record.body}"\n\nReply here: ${SITE_URL}/account/messages/${payload.record.conversation_id}`,
    });

    if (sendError) {
      return NextResponse.json({ ok: false, reason: sendError.message }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  }

  if (!listing.owner_id) return NextResponse.json({ ok: true });

  const { data: owner } = await supabase
    .from("users")
    .select("email")
    .eq("id", listing.owner_id)
    .maybeSingle();

  if (!owner?.email) return NextResponse.json({ ok: true });

  // The tenant already filled this in before they could enquire at all — pass
  // it straight through rather than making the manager log in just to see who
  // they're talking to.
  const applicantLines = [
    `Name: ${tenant?.full_name ?? "Not provided"}`,
    `Email: ${tenant?.email ?? "Not provided"}`,
    `Phone: ${tenant?.phone ?? "Not provided"}`,
    profile?.employment_status
      ? `Employment: ${profile.employment_status}${profile.occupation ? ` — ${profile.occupation}` : ""}`
      : null,
    profile?.weekly_income_range ? `Income: ${profile.weekly_income_range}` : null,
    `Occupants: ${profile?.num_occupants ?? 1}`,
    `Pets: ${profile?.has_pets ? profile.pet_details || "Yes" : "No"}`,
    `Smoker: ${profile?.is_smoker ? "Yes" : "No"}`,
    profile?.preferred_move_in_date ? `Preferred move-in: ${profile.preferred_move_in_date}` : null,
    profile?.reference_name
      ? `Reference: ${profile.reference_name}${profile.reference_phone ? ` — ${profile.reference_phone}` : ""}`
      : null,
    profile?.additional_notes ? `Notes: ${profile.additional_notes}` : null,
  ].filter(Boolean);

  const { error: sendError } = await resend.emails.send({
    from: fromAddress,
    to: owner.email,
    subject: `New enquiry about ${listing.address}`,
    text: `A tenant sent a message about your listing at ${listing.address}:\n\n"${payload.record.body}"\n\nApplicant details:\n${applicantLines.join(
      "\n"
    )}\n\nReply here: ${SITE_URL}/partners/enquiries/${payload.record.conversation_id}`,
  });

  if (sendError) {
    return NextResponse.json({ ok: false, reason: sendError.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
