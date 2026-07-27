"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function PackageDeleteButton({ packageId }: { packageId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this package? This can't be undone.")) return;
    setDeleting(true);
    await supabase.from("service_provider_packages").delete().eq("id", packageId);
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
