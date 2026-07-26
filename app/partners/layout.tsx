import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PartnersSidebar } from "@/components/partners/sidebar";
import { PartnersTopbar } from "@/components/partners/topbar";

export default async function PartnersLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  // Redundant with middleware's /partners gating, but keeps this layout safe on
  // its own if ever rendered outside that matcher.
  if (!profile || !["provider", "property_manager", "admin"].includes(profile.role)) {
    redirect("/account");
  }

  // Same JS-side comparison as the account layout's unread count — "unread"
  // compares two columns on the same row, which a Supabase filter can't
  // express directly.
  let unreadEnquiryCount = 0;
  if (profile.role === "property_manager" || profile.role === "admin") {
    const { data: ownedListings } = await supabase.from("listings").select("id").eq("owner_id", user.id);
    const listingIds = (ownedListings ?? []).map((l) => l.id);
    if (listingIds.length > 0) {
      const { data: conversations } = await supabase
        .from("listing_conversations")
        .select("last_message_at, manager_last_read_at")
        .in("listing_id", listingIds);
      unreadEnquiryCount = (conversations ?? []).filter(
        (c) => !c.manager_last_read_at || new Date(c.last_message_at) > new Date(c.manager_last_read_at)
      ).length;
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <PartnersSidebar role={profile.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <PartnersTopbar
          userId={user.id}
          userEmail={profile?.email ?? user.email ?? ""}
          fullName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
          role={profile?.role ?? null}
          unreadEnquiryCount={unreadEnquiryCount}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-offwhite/40 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
