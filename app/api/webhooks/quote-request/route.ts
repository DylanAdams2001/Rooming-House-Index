import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isValidWebhookRequest } from "@/lib/webhook-auth";

export const runtime = "nodejs";
export const maxDuration = 15;

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

  const subject =
    category === "property_management"
      ? "New property management quote request"
      : "New insurance quote request";

  const text = `A new ${category.replace(
    "_",
    " "
  )} quote request came in.\n\nProperty: ${property_address}\n${
    number_of_rooms ? `Rooms: ${number_of_rooms}\n` : ""
  }${notes ? `Notes: ${notes}\n` : ""}`;

  await resend.emails.send({
    from: `Rooming House Index <${fromAddress}>`,
    to: recipients,
    subject,
    text,
  });

  return NextResponse.json({ ok: true });
}
