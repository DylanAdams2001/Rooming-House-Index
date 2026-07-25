import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, FileText, Search } from "lucide-react";

export default async function AccountHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let conversationCount = 0;
  let hasApplication = false;

  if (user) {
    const { count } = await supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("investor_id", user.id);
    conversationCount = count ?? 0;

    const { data: tenantProfile } = await supabase
      .from("tenant_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    hasApplication = !!tenantProfile;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Welcome back</h1>
      <p className="mt-2 text-body">Find a room, message operators, and manage your application.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">Active Conversations</CardTitle>
            <MessageCircle className="h-5 w-5 text-ink" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl text-ink">{conversationCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">Application Status</CardTitle>
            <FileText className="h-5 w-5 text-ink" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl text-ink">
              {hasApplication ? "Complete" : "Not started"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">Find a Room</CardTitle>
            <Search className="h-5 w-5 text-ink" />
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" className="w-full">
              <Link href="/listings">Browse Listings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
