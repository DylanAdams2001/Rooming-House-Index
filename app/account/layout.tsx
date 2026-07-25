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

  return (
    <div className="flex min-h-screen bg-white">
      <AccountSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AccountTopbar
          userId={user.id}
          userEmail={profile?.email ?? user.email ?? ""}
          fullName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-offwhite/40 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
