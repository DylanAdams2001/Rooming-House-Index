import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default async function AdminConversationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  if (!isAdmin) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
        <p className="text-body">
          This page is restricted to admin accounts. Set your role to &apos;admin&apos; in the
          public.users table (Supabase) to access it.
        </p>
      </div>
    );
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(
      "id, last_message_at, investor_id, users!conversations_investor_id_fkey(email), service_providers(business_name, category)"
    )
    .order("last_message_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-ink" />
        <h1 className="font-display text-3xl text-ink">All Conversations</h1>
      </div>
      <p className="mt-2 text-body">
        Every conversation across every provider, for payment verification and compliance
        oversight.
      </p>

      {error && <p className="mt-6 text-sm text-red-600">{error.message}</p>}

      {!error && (
        <div className="mt-6 space-y-3">
          {(conversations ?? []).map((c) => (
            <Link key={c.id} href={`/dashboard/admin/conversations/${c.id}`}>
              <Card className="transition-colors hover:bg-linen">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-display text-lg text-ink">
                      {(c.service_providers as unknown as { business_name: string } | null)
                        ?.business_name ?? "Provider"}
                    </p>
                    <p className="text-xs text-muted">
                      Investor: {(c.users as unknown as { email: string } | null)?.email ?? c.investor_id}
                    </p>
                  </div>
                  <p className="text-xs text-muted">
                    {new Date(c.last_message_at).toLocaleString("en-AU")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {(conversations ?? []).length === 0 && (
            <p className="text-sm text-muted">No conversations yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
