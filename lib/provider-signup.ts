import type { SupabaseClient } from "@supabase/supabase-js";

// Creates a minimal, pre-approved service_providers row for a newly signed-up
// partner account — used by the private per-category signup links (e.g.
// /signup/provider/insurance, /signup/property-manager), which replace the
// old public self-serve join flow. Partners here are hand-picked and vetted
// before ever getting the link, so there's no pending-review step: business_
// name/contact_email start as placeholders the account fills in properly
// from /partners/profile.
//
// Property managers get one of these too (category="property_management"),
// not just the room-listing role flip — they're a single account that both
// manages room listings/tenant enquiries AND replies to investor quote
// requests, not two separate account types.
export async function createProviderListing(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string,
  role: string,
  categoryDbValue: string,
  categoryLabel: string
) {
  await supabase.from("users").update({ role }).eq("id", userId);

  await supabase.from("service_providers").insert({
    user_id: userId,
    category: categoryDbValue,
    business_name: `New ${categoryLabel} Provider`,
    description: "",
    contact_email: userEmail,
    coverage_areas: ["VIC"],
    status: "approved",
  });
}
