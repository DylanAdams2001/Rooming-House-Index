"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, FileText, Loader2, X } from "lucide-react";

export type ExistingPackage = {
  id: string;
  label: string;
  price: string;
  description: string | null;
  documentUrl: string | null;
};

// Shared add/edit form — a provider's own furniture packages (or similar,
// for whichever other category ends up wanting the same thing) shown on
// their public profile so investors can compare before ever messaging.
export function PackageForm({
  providerId,
  existing,
  onDone,
}: {
  providerId: string;
  existing?: ExistingPackage | null;
  // Only used when editing inline in a list — lets the parent collapse the
  // form back down after a successful save instead of leaving it open.
  onDone?: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [label, setLabel] = useState(existing?.label ?? "");
  const [price, setPrice] = useState(existing?.price ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
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
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("package-documents").upload(path, file);

    if (uploadError) {
      setUploading(false);
      setError("Couldn't upload the document — please try again.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("package-documents").getPublicUrl(path);
    setDocumentUrl(publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !price.trim()) return;
    setStatus("submitting");
    setError(null);

    const payload = {
      label: label.trim(),
      price: price.trim(),
      description: description.trim() || null,
      document_url: documentUrl,
    };

    const { error: writeError } = existing
      ? await supabase.from("service_provider_packages").update(payload).eq("id", existing.id)
      : await supabase.from("service_provider_packages").insert({ ...payload, provider_id: providerId });

    if (writeError) {
      setStatus("idle");
      setError("Couldn't save this package — please try again.");
      return;
    }

    setStatus("success");
    router.refresh();
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-card border border-line bg-white p-5">
      <p className="font-display text-base text-ink">{existing ? "Edit package" : "Add a package"}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="label">Package name</Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. 2-Bedroom Furniture Pack"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. $3,500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's included, lead time, etc."
        />
      </div>

      <div className="space-y-2">
        <Label>Brochure/PDF (optional)</Label>
        {documentUrl ? (
          <div className="flex items-center justify-between rounded-btn border border-line px-4 py-2 text-sm">
            <a
              href={documentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-ink underline underline-offset-4"
            >
              <FileText className="h-4 w-4" />
              View uploaded file
            </a>
            <button
              type="button"
              onClick={() => setDocumentUrl(null)}
              aria-label="Remove file"
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

      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1"
          disabled={status === "submitting" || uploading || !label.trim() || !price.trim()}
        >
          {status === "submitting" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === "success" && <Check className="mr-2 h-4 w-4" />}
          {existing ? "Save changes" : "Add package"}
        </Button>
        {onDone && (
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
