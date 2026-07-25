import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

// Shared between /dashboard/messages (investors/providers/admins) and
// /account/messages (tenants) — the conversations table doesn't distinguish
// between account types, so the same inbox works for both.
export async function MessagesInbox({ basePath }: { basePath: string }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let conversations: {
    id: string;
    last_message_at: string;
    service_providers: { business_name: string; category: string } | null;
  }[] = [];
  let loadError: string | null = null;

  if (user) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, last_message_at, service_providers(business_name, category)")
      .eq("investor_id", user.id)
      .order("last_message_at", { ascending: false });

    if (error) {
      loadError = error.message;
    } else {
      conversations = (data ?? []) as unknown as typeof conversations;
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Messages</h1>
      <p className="mt-2 text-body">Your conversations with service providers.</p>

      {loadError && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-8 text-center">
          <p className="text-body">
            Messaging isn&apos;t connected to a live Supabase project yet, so conversations
            can&apos;t load.
          </p>
          <p className="mt-1 text-xs text-muted">{loadError}</p>
        </div>
      )}

      {!loadError && conversations.length === 0 && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-body">No conversations yet.</p>
          <p className="mt-1 text-sm text-muted">
            Start one from any provider&apos;s profile in{" "}
            <Link href="/dashboard/services" className="underline underline-offset-4">
              Services
            </Link>
            .
          </p>
        </div>
      )}

      {!loadError && conversations.length > 0 && (
        <div className="mt-6 space-y-3">
          {conversations.map((c) => (
            <Link key={c.id} href={`${basePath}/messages/${c.id}`}>
              <Card className="transition-colors hover:bg-linen">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-display text-lg text-ink">
                      {c.service_providers?.business_name ?? "Provider"}
                    </p>
                    <p className="text-xs text-muted">
                      Last message {new Date(c.last_message_at).toLocaleString("en-AU")}
                    </p>
                  </div>
                  <MessageCircle className="h-5 w-5 text-muted" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
