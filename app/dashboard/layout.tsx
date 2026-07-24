import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: re-enable auth gate before launch — disabled temporarily for design review.
  const AUTH_GATE_ENABLED = false;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (AUTH_GATE_ENABLED && !user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-white">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar userEmail={user?.email ?? "demo@roominghouseindex.com"} />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-offwhite/40 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
