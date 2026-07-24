"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// TODO: flip to true once a real Supabase project is connected. Until then,
// "Message" opens a local-state preview of the chat UI instead of hitting
// auth/DB calls that can't succeed against placeholder credentials.
const CHAT_BACKEND_ENABLED = false;

export function StartConversationButton({
  providerId,
  businessName,
}: {
  providerId: string;
  businessName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!CHAT_BACKEND_ENABLED) {
      router.push(`/dashboard/messages/preview?name=${encodeURIComponent(businessName)}`);
      return;
    }

    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("investor_id", user.id)
      .eq("provider_id", providerId)
      .maybeSingle();

    if (existing) {
      router.push(`/dashboard/messages/${existing.id}`);
      return;
    }

    const { data: created, error: insertError } = await supabase
      .from("conversations")
      .insert({ investor_id: user.id, provider_id: providerId })
      .select("id")
      .single();

    setLoading(false);

    if (insertError || !created) {
      setError(
        "Couldn't start a conversation — this provider isn't connected to a live account yet."
      );
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
