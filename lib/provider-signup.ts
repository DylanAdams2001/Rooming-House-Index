import type { SupabaseClient } from "@supabase/supabase-js";

// Creates a minimal, pre-approved service_providers row for a newly signed-up
// provider account — used by the private per-category signup links (e.g.
// /signup/provider/insurance), which replace the old public self-serve join
// flow. Providers here are hand-picked and vetted before ever getting the
// link, so there's no pending-review step: business_name/contact_email start
// as placeholders the provider fills in properly from /partners/profile.
export async function createProviderListing(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string,
  categoryDbValue: string,
  categoryLabel: string
) {
  await supabase.from("users").update({ role: "provider" }).eq("id", userId);

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
