import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default async function AccountSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { full_name: string | null; phone: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Settings</h1>
      <p className="mt-2 text-body">Manage your account details.</p>

      <Card className="mt-8 max-w-lg">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={profile?.full_name ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={profile?.phone ?? ""} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
