"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, FileText, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExistingQuote = {
  id: string;
  feeType: "monthly_pct" | "flat";
  monthlyFeePct: number | null;
  flatFee: string | null;
  notes: string | null;
  documentUrl: string | null;
};

// The formal, comparable quote a provider submits for a specific request —
// separate from the chat thread (questions/back-and-forth), this is the
// actual deliverable investors see listed on their Services page.
export function QuoteSubmissionForm({
  requestId,
  providerId,
  businessName,
  existing,
}: {
  requestId: string;
  providerId: string;
  businessName: string;
  existing?: ExistingQuote | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [feeType, setFeeType] = useState<string>(existing?.feeType ?? "monthly_pct");
  const [monthlyFeePct, setMonthlyFeePct] = useState(existing?.monthlyFeePct?.toString() ?? "");
  const [flatFee, setFlatFee] = useState(existing?.flatFee ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [documentUrl, setDocumentUrl] = useState<string | null>(existing?.documentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${requestId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("quote-documents")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      setError("Couldn't upload the document — please try again.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("quote-documents").getPublicUrl(path);
    setDocumentUrl(publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const payload = {
      request_id: requestId,
      provider_id: providerId,
      provider_name: businessName,
      monthly_fee_pct: feeType === "monthly_pct" && monthlyFeePct ? Number(monthlyFeePct) : null,
      flat_fee: feeType === "flat" && flatFee ? flatFee.trim() : null,
      notes: notes.trim() || null,
      document_url: documentUrl,
    };

    const { error: writeError } = existing
      ? await supabase.from("service_quote_quotes").update(payload).eq("id", existing.id)
      : await supabase.from("service_quote_quotes").insert(payload);

    if (writeError) {
      setStatus("idle");
      setError("Couldn't save your quote — please try again.");
      return;
    }

    setStatus("success");
    router.refresh();
  }

  const busy = status === "submitting" || uploading;

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-4 rounded-card border border-line bg-white p-5">
      <p className="font-display text-base text-ink">
        {existing ? "Update your quote" : "Submit your quote"}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Fee type</Label>
          <Select value={feeType} onValueChange={setFeeType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly_pct">% of rent (monthly)</SelectItem>
              <SelectItem value="flat">Flat fee</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {feeType === "monthly_pct" ? (
          <div className="space-y-2">
            <Label htmlFor="monthlyFeePct">Monthly fee (%)</Label>
            <Input
              id="monthlyFeePct"
              type="number"
              step="0.1"
              min={0}
              value={monthlyFeePct}
              onChange={(e) => setMonthlyFeePct(e.target.value)}
              placeholder="e.g. 7.5"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="flatFee">Flat fee</Label>
            <Input
              id="flatFee"
              value={flatFee}
              onChange={(e) => setFlatFee(e.target.value)}
              placeholder="e.g. $450/yr"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What's included, any conditions, etc."
        />
      </div>

      <div className="space-y-2">
        <Label>Quote document (optional)</Label>
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        className={cn(
          "w-full transition-colors duration-300",
          status === "success" && "bg-green-600 hover:bg-green-600"
        )}
        disabled={busy}
      >
        {status === "submitting" && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
          </>
        )}
        {status === "success" && (
          <>
            <Check className="mr-2 h-4 w-4" /> Saved
          </>
        )}
        {status === "idle" && (existing ? "Update quote" : "Submit quote")}
      </Button>
    </form>
  );
}
