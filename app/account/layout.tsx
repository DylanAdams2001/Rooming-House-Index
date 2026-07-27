import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountSidebar } from "@/components/account/sidebar";
import { AccountTopbar } from "@/components/account/topbar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // /account is every account's home — messages, application, settings, and the
  // investor upsell. /dashboard (suburb/market data) is a separate add-on layered
  // on top of the same login, gated in middleware rather than by a different area here.
  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Counted here (not derived from a single query) since "unread" compares two
  // columns on the same row — not something a Supabase filter can express
  // directly, so the small number of rows are pulled and compared in JS,
  // same approach as the inbox list itself.
  const { data: conversations } = await supabase
    .from("listing_conversations")
    .select("last_message_at, tenant_last_read_at")
    .eq("tenant_id", user.id);
  const unreadMessageCount = (conversations ?? []).filter(
    (c) => !c.tenant_last_read_at || new Date(c.last_message_at) > new Date(c.tenant_last_read_at)
  ).length;

  return (
    <div className="flex min-h-screen bg-white">
      <AccountSidebar unreadMessageCount={unreadMessageCount} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AccountTopbar
          userId={user.id}
          userEmail={profile?.email ?? user.email ?? ""}
          fullName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
          unreadMessageCount={unreadMessageCount}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-offwhite/40 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
