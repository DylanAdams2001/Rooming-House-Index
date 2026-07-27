import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, FileText, Search, TrendingUp } from "lucide-react";
import { Hint } from "@/components/hints/hint";

export default async function AccountHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let conversationCount = 0;
  let hasApplication = false;
  let investorAccess = "none";

  if (user) {
    const { count } = await supabase
      .from("listing_conversations")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", user.id);
    conversationCount = count ?? 0;

    const { data: tenantProfile } = await supabase
      .from("tenant_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    hasApplication = !!tenantProfile;

    const { data: profile } = await supabase
      .from("users")
      .select("investor_access")
      .eq("id", user.id)
      .maybeSingle();
    investorAccess = profile?.investor_access ?? "none";
  }

  return (
    <div>
      <Hint hintKey="welcome" title="Welcome to Rooming House Standard!">
        <p>
          This is your account home — browse rooms, message property teams once you enquire, and
          keep your rental application up to date so landlords can review it instantly.
        </p>
        <p>The first time you open a new tab, look out for a quick tip like this one.</p>
      </Hint>

      <h1 className="font-display text-3xl text-ink">Welcome back</h1>
      <p className="mt-2 text-body">Find a room, message the property team, and manage your application.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">Investor Access</CardTitle>
            <TrendingUp className="h-5 w-5 text-ink" />
          </CardHeader>
          <CardContent>
            {investorAccess === "active" ? (
              <div className="font-display text-2xl text-ink">Active</div>
            ) : (
              <Button asChild size="sm" className="w-full">
                <Link href="/account/upgrade">Get investor access</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
