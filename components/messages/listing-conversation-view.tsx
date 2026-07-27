import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getListingTitle } from "@/lib/mock-listings";
import { getApprovedListingById } from "@/lib/listings";
import { LISTING_COLUMNS, mapListingRow } from "@/lib/listings-shared";
import { ChatThread } from "@/components/chat/chat-thread";
import {
  TenantApplicationSummary,
  type TenantApplication,
} from "@/components/partners/tenant-application-summary";
import { ArrowLeft, CalendarClock } from "lucide-react";

export async function ListingConversationView({
  conversationId,
  basePath = "/account",
  perspective = "tenant",
}: {
  conversationId: string;
  basePath?: string;
  perspective?: "tenant" | "manager";
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: conversation, error } = await supabase
    .from("listing_conversations")
    .select("id, listing_id, tenant_id")
    .eq("id", conversationId)
    .maybeSingle();

  const { data: initialMessages } = conversation
    ? await supabase
        .from("listing_messages")
        .select("id, sender_id, body, created_at, is_manager, attachment_url, attachment_name")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
    : { data: [] };

  if (conversation) {
    // Fire-and-forget: mark this side as having seen the conversation up to
    // now, so the inbox list's unread indicator clears once they've opened it.
    const readColumn = perspective === "manager" ? "manager_last_read_at" : "tenant_last_read_at";
    supabase
      .from("listing_conversations")
      .update({ [readColumn]: new Date().toISOString() })
      .eq("id", conversation.id)
      .then(() => {});
  }

  let listing = null;
  if (conversation) {
    if (perspective === "manager") {
      const { data } = await supabase
        .from("listings")
        .select(LISTING_COLUMNS)
        .eq("id", conversation.listing_id)
        .maybeSingle();
      listing = data ? mapListingRow(data) : null;
    } else {
      listing = await getApprovedListingById(conversation.listing_id);
    }
  }

  let tenantName: string | null = null;
  let application: TenantApplication | null = null;
  if (conversation && perspective === "manager") {
    const { data: tenant } = await supabase
      .from("users")
      .select("email, full_name, phone")
      .eq("id", conversation.tenant_id)
      .maybeSingle();
    tenantName = tenant?.full_name ?? tenant?.email ?? null;

    const { data: profile } = await supabase
      .from("tenant_profiles")
      .select("*")
      .eq("user_id", conversation.tenant_id)
      .maybeSingle();

    if (tenant && profile) {
      application = {
        fullName: tenant.full_name,
        email: tenant.email,
        phone: tenant.phone,
        employmentStatus: profile.employment_status,
        occupation: profile.occupation,
        weeklyIncomeRange: profile.weekly_income_range,
        numOccupants: profile.num_occupants,
        hasPets: profile.has_pets,
        petDetails: profile.pet_details,
        isSmoker: profile.is_smoker,
        preferredMoveInDate: profile.preferred_move_in_date,
        referenceName: profile.reference_name,
        referencePhone: profile.reference_phone,
        additionalNotes: profile.additional_notes,
      };
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Link
        href={`${basePath}/${perspective === "manager" ? "enquiries" : "messages"}`}
        className="mb-4 flex items-center gap-2 text-sm text-body hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All {perspective === "manager" ? "enquiries" : "messages"}
      </Link>

      {!conversation || error || !user ? (
        <div className="rounded-card border border-dashed border-line bg-white p-8 text-center">
          <p className="text-body">
            This conversation isn&apos;t available — either it doesn&apos;t exist, or messaging
            isn&apos;t connected to a live Supabase project yet.
          </p>
        </div>
      ) : (
        <>
          {listing && (
            <Link
              href={`/listings/${listing.id}`}
              className="mb-4 flex items-center justify-between gap-4 rounded-card border border-line bg-white px-5 py-3 transition-colors hover:bg-linen"
            >
              <div>
                <p className="font-display text-base text-ink">{getListingTitle(listing)}</p>
                <p className="text-xs text-muted">
                  {listing.roomType} room · ${listing.weeklyRate}/wk
                  {perspective === "manager" && tenantName ? ` · Tenant: ${tenantName}` : ""}
                </p>
              </div>
              {listing.inspectionTime && (
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {listing.inspectionTime}
                </div>
              )}
            </Link>
          )}
          {perspective === "manager" && application && (
            <TenantApplicationSummary application={application} />
          )}
          <ChatThread
            conversationId={conversation.id}
            currentUserId={user.id}
            otherPartyName={perspective === "manager" ? tenantName ?? "Tenant" : "Property Team"}
            initialMessages={initialMessages ?? []}
            table="listing_messages"
            businessSideReply={perspective === "manager"}
            complianceNote={
              perspective === "manager"
                ? "Replies here are sent to the tenant as the property team."
                : "Confirm you'll be at the inspection, ask questions, or reschedule — the property team will reply here."
            }
          />
        </>
      )}
    </div>
  );
}
