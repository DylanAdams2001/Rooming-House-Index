import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PartnersSidebar } from "@/components/partners/sidebar";
import { PartnersTopbar } from "@/components/partners/topbar";
import { HintProvider } from "@/components/hints/hint-provider";
import { PageTransition } from "@/components/page-transition";

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
  // express directly. Merged into one count since the Messages inbox itself
  // merges marketplace conversations, quote-request conversations, and (for
  // property managers) tenant room enquiries into a single list, rather than
  // splitting them across separate tabs.
  let category: string | null = null;
  let unreadMessageCount = 0;
  if (profile.role === "provider" || profile.role === "property_manager") {
    const { data: providerRow } = await supabase
      .from("service_providers")
      .select("id, category, status")
      .eq("user_id", user.id)
      .maybeSingle();

    // Admin can suspend a partner (status set away from 'approved') without
    // deleting their login — this is what actually enforces that: portal
    // access is revoked the moment it's no longer 'approved', same as how
    // the public directory already only ever shows approved providers.
    if (!providerRow || providerRow.status !== "approved") {
      redirect("/account");
    }

    category = providerRow?.category ?? null;

    let listingIds: string[] = [];
    if (profile.role === "property_manager") {
      const { data: ownedListings } = await supabase.from("listings").select("id").eq("owner_id", user.id);
      listingIds = (ownedListings ?? []).map((l) => l.id);
    }

    const [{ data: conversations }, { data: quoteConversations }, { data: listingConversations }] =
      await Promise.all([
        providerRow
          ? supabase
              .from("conversations")
              .select("last_message_at, provider_last_read_at")
              .eq("provider_id", providerRow.id)
          : Promise.resolve({ data: [] }),
        providerRow
          ? supabase
              .from("quote_conversations")
              .select("last_message_at, provider_last_read_at")
              .eq("provider_id", providerRow.id)
          : Promise.resolve({ data: [] }),
        listingIds.length > 0
          ? supabase
              .from("listing_conversations")
              .select("last_message_at, manager_last_read_at")
              .in("listing_id", listingIds)
          : Promise.resolve({ data: [] }),
      ]);

    unreadMessageCount =
      (conversations ?? []).filter(
        (c) => !c.provider_last_read_at || new Date(c.last_message_at) > new Date(c.provider_last_read_at)
      ).length +
      (quoteConversations ?? []).filter(
        (c) => !c.provider_last_read_at || new Date(c.last_message_at) > new Date(c.provider_last_read_at)
      ).length +
      (listingConversations ?? []).filter(
        (c) => !c.manager_last_read_at || new Date(c.last_message_at) > new Date(c.manager_last_read_at)
      ).length;
  }

  const { data: seenHints } = await supabase.from("user_seen_hints").select("hint_key").eq("user_id", user.id);

  return (
    <HintProvider userId={user.id} initialSeenKeys={(seenHints ?? []).map((h) => h.hint_key)}>
      <div className="flex min-h-screen bg-white">
        <PartnersSidebar role={profile.role} category={category} unreadMessageCount={unreadMessageCount} />
        <div className="flex min-w-0 flex-1 flex-col">
          <PartnersTopbar
            userId={user.id}
            userEmail={profile?.email ?? user.email ?? ""}
            fullName={profile?.full_name ?? null}
            avatarUrl={profile?.avatar_url ?? null}
            role={profile?.role ?? null}
            category={category}
            unreadMessageCount={unreadMessageCount}
          />
          <main className="min-w-0 flex-1 overflow-x-hidden bg-offwhite/40 p-6 md:p-10">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </HintProvider>
  );
}
