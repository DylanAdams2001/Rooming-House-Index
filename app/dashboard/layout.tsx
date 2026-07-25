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

  return (
    <div className="flex min-h-screen bg-white">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
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
