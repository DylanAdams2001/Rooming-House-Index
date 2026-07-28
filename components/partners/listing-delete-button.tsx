"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ListingDeleteButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this listing? This can't be undone.")) return;
    setDeleting(true);
    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    setDeleting(false);
    if (error) {
      toast.error("Couldn't delete this listing", { description: error.message });
      return;
    }
    toast.success("Listing deleted");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Delete listing"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
