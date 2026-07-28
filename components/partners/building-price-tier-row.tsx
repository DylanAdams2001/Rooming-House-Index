"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, FileText, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export type BuildingPriceTier = {
  id: string;
  label: string;
  price: number;
  notes: string | null;
  documentUrl: string | null;
  inclusionsText: string | null;
  internalNote: string | null;
  revealDelayMinutes: number;
};

export function BuildingPriceTierRow({ tier }: { tier: BuildingPriceTier }) {
  const router = useRouter();
  const supabase = createClient();
  const [label, setLabel] = useState(tier.label);
  const [price, setPrice] = useState(String(tier.price));
  const [notes, setNotes] = useState(tier.notes ?? "");
  const [documentUrl, setDocumentUrl] = useState<string | null>(tier.documentUrl);
  const [inclusionsText, setInclusionsText] = useState(tier.inclusionsText ?? "");
  const [internalNote, setInternalNote] = useState(tier.internalNote ?? "");
  const [revealDelayMinutes, setRevealDelayMinutes] = useState(String(tier.revealDelayMinutes));
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/building-${tier.id}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("quote-documents")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      toast.error("Couldn't upload the document", { description: uploadError.message });
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("quote-documents").getPublicUrl(path);
    setDocumentUrl(publicUrl);
    setUploading(false);
  }

  async function handleSave() {
    setStatus("saving");
    const { error } = await supabase
      .from("building_price_tiers")
      .update({
        label: label.trim(),
        price: Number(price),
        notes: notes.trim() || null,
        document_url: documentUrl,
        inclusions_text: inclusionsText.trim() || null,
        internal_note: internalNote.trim() || null,
        reveal_delay_minutes: Number(revealDelayMinutes) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tier.id);

    if (error) {
      setStatus("idle");
      toast.error("Couldn't save this price tier", { description: error.message });
      return;
    }
    setStatus("saved");
    toast.success(`${label.trim()} saved`);
    router.refresh();
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <div className="space-y-3 rounded-btn border border-line bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-xs">Label shown to investor</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Price ($)</Label>
          <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Internal note (admin-only)</Label>
          <Input
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="Which builder"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Reveal delay (min)</Label>
          <Input
            type="number"
            min={0}
            value={revealDelayMinutes}
            onChange={(e) => setRevealDelayMinutes(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Description shown to investor</Label>
        <Textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="A short blurb describing this quote — keep each of the 3 different."
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">
          Inclusions, in this builder&apos;s own words (leave blank to use the generic list)
        </Label>
        <Textarea
          rows={6}
          value={inclusionsText}
          onChange={(e) => setInclusionsText(e.target.value)}
          placeholder="Same underlying scope as the other quotes — just worded the way this builder would describe it."
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Quote document (PDF)</Label>
        {documentUrl ? (
          <div className="flex items-center justify-between rounded-btn border border-line px-4 py-2 text-sm">
            <a
              href={documentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-ink underline underline-offset-4"
            >
              <FileText className="h-4 w-4" />
              View uploaded document
            </a>
            <button
              type="button"
              onClick={() => setDocumentUrl(null)}
              aria-label="Remove document"
              className="text-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink underline underline-offset-4">
            {uploading ? "Uploading…" : "Attach a PDF"}
            <input type="file" accept="application/pdf" onChange={handleFileUpload} disabled={uploading} className="hidden" />
          </label>
        )}
      </div>

      <Button onClick={handleSave} disabled={status === "saving" || uploading}>
        {status === "saving" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {status === "saved" && <Check className="mr-2 h-4 w-4" />}
        Save
      </Button>
    </div>
  );
}
