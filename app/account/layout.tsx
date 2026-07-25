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

  // This area is deliberately separate from /dashboard — a tenant looking for a room has
  // no reason to see investor suburb/market data, and vice versa. Investors/providers/admins
  // who land here (e.g. an old bookmark) get sent back to their actual area.
  const { data: profile } = await supabase
    .from("users")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && profile.role !== "tenant") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AccountSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AccountTopbar userEmail={profile?.email ?? user.email ?? ""} />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-offwhite/40 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
