import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Same JS-side comparison used by the account/partners unread badges —
  // "unread" compares two columns on the same row, which a Supabase filter
  // can't express directly. RLS already scopes this to the investor's own
  // quote conversations.
  const { data: quoteConversations } = await supabase
    .from("quote_conversations")
    .select("last_message_at, investor_last_read_at");
  const unreadQuoteMessageCount = (quoteConversations ?? []).filter(
    (c) => !c.investor_last_read_at || new Date(c.last_message_at) > new Date(c.investor_last_read_at)
  ).length;

  return (
    <div className="flex min-h-screen bg-white">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          userId={user.id}
          userEmail={profile?.email ?? user.email ?? ""}
          fullName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
          unreadQuoteMessageCount={unreadQuoteMessageCount}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-offwhite/40 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
