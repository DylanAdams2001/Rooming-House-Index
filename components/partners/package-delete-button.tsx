"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function PackageDeleteButton({ packageId }: { packageId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this package? This can't be undone.")) return;
    setDeleting(true);
    const { error } = await supabase.from("service_provider_packages").delete().eq("id", packageId);
    setDeleting(false);
    if (error) {
      toast.error("Couldn't delete this package", { description: error.message });
      return;
    }
    toast.success("Package deleted");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Delete package"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
