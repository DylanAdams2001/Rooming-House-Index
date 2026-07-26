import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isValidWebhookRequest } from "@/lib/webhook-auth";

export const runtime = "nodejs";

// Configured as a Supabase Database Webhook on listing_messages INSERT (see
// Database -> Webhooks in the Supabase dashboard). Notifies the property
// manager who owns the listing whenever a tenant sends a new message —
// skips the auto "Property Team" welcome reply and any manager's own replies,
// since those shouldn't notify the manager about themselves.
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

  if (payload.type !== "INSERT" || payload.record.is_manager) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceRoleClient();

  const { data: conversation } = await supabase
    .from("listing_conversations")
    .select("listing_id")
    .eq("id", payload.record.conversation_id)
    .maybeSingle();

  if (!conversation) return NextResponse.json({ ok: true });

  const { data: listing } = await supabase
    .from("listings")
    .select("owner_id, address")
    .eq("id", conversation.listing_id)
    .maybeSingle();

  if (!listing?.owner_id) return NextResponse.json({ ok: true });

  const { data: owner } = await supabase
    .from("users")
    .select("email")
    .eq("id", listing.owner_id)
    .maybeSingle();

  if (!owner?.email) return NextResponse.json({ ok: true });

  await new Resend(apiKey).emails.send({
    from: fromAddress,
    to: owner.email,
    subject: `New enquiry about ${listing.address}`,
    text: `A tenant sent a message about your listing at ${listing.address}:\n\n"${payload.record.body}"\n\nReply from your Partner Portal at /partners/enquiries.`,
  });

  return NextResponse.json({ ok: true });
}
