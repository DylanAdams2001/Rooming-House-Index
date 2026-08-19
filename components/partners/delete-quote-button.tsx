"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteQuoteButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this quote? This can't be undone.")) return;
    setDeleting(true);
    const { error } = await supabase.from("service_quote_quotes").delete().eq("id", quoteId);
    setDeleting(false);
    if (error) {
      toast.error("Couldn't delete this quote", { description: error.message });
      return;
    }
    toast.success("Quote deleted");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Delete quote"
      className="shrink-0"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
