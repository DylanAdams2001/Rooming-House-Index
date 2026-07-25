"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function StartConversationButton({
  providerId,
  businessName,
}: {
  // The friendly slug used in the URL (e.g. "provider-landlord-shield"), not the
  // service_providers table's internal uuid — resolved below via the slug column.
  providerId: string;
  businessName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: provider } = await supabase
      .from("service_providers")
      .select("id")
      .eq("slug", providerId)
      .maybeSingle();

    if (!provider) {
      setLoading(false);
      setError("Couldn't start a conversation — this provider isn't connected to a live account yet.");
      return;
    }

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("investor_id", user.id)
      .eq("provider_id", provider.id)
      .maybeSingle();

    if (existing) {
      router.push(`/dashboard/messages/${existing.id}`);
      return;
    }

    const { data: created, error: insertError } = await supabase
      .from("conversations")
      .insert({ investor_id: user.id, provider_id: provider.id })
      .select("id")
      .single();

    setLoading(false);

    if (insertError || !created) {
      setError("Couldn't start a conversation — please try again.");
      return;
    }

    router.push(`/dashboard/messages/${created.id}`);
  }

  return (
    <div className="pt-2">
      <Button className="w-full" onClick={handleClick} disabled={loading}>
        <MessageCircle className="mr-2 h-4 w-4" />
        {loading ? "Starting…" : `Message ${businessName}`}
      </Button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
