"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteQuoteRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        "Delete this quote request? Any quotes and conversations submitted against it are deleted too. This can't be undone."
      )
    )
      return;
    setDeleting(true);
    const { error } = await supabase.from("service_quote_requests").delete().eq("id", requestId);
    setDeleting(false);
    if (error) {
      toast.error("Couldn't delete this request", { description: error.message });
      return;
    }
    toast.success("Quote request deleted");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Delete quote request"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
