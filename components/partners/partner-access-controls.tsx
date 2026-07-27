"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "approved", label: "Approved — live in the directory, full portal access" },
  { value: "pending", label: "Pending — hidden from investors, portal access suspended" },
  { value: "rejected", label: "Rejected — hidden from investors, portal access suspended" },
];

// Admin-only controls on a business partner's detail page. Status change
// enforces itself via app/partners/layout.tsx (redirects to /account the
// moment status isn't 'approved') — their login stays intact either way,
// they just lose portal access while suspended. Delete removes the
// service_providers row outright (cascades to their conversations/quote
// threads via the existing FK), but never touches the user's login account.
export function PartnerAccessControls({
  providerId,
  businessName,
  status,
}: {
  providerId: string;
  businessName: string;
  status: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [pendingStatus, setPendingStatus] = useState(status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveStatus() {
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("service_providers")
      .update({ status: pendingStatus })
      .eq("id", providerId);
    setSaving(false);
    if (updateError) {
      setError("Couldn't update status — please try again.");
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${businessName}? This removes their business listing and every conversation/quote thread with them. Their login account itself is not deleted. This can't be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    const { error: deleteError } = await supabase.from("service_providers").delete().eq("id", providerId);
    setDeleting(false);
    if (deleteError) {
      setError("Couldn't delete this business partner — please try again.");
      return;
    }
    router.push("/partners");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[280px] flex-1 space-y-2">
          <Select value={pendingStatus} onValueChange={setPendingStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSaveStatus} disabled={saving || pendingStatus === status}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save status
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button variant="outline" onClick={handleDelete} disabled={deleting} className="border-red-600 text-red-600 hover:bg-red-50">
        <Trash2 className="mr-2 h-4 w-4" />
        {deleting ? "Deleting…" : "Delete business partner"}
      </Button>
    </div>
  );
}
