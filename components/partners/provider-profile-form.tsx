"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ServiceCategory } from "@/lib/service-categories";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Kept as a fixed set rather than free text — a response-time claim shown to
// investors should stay within the realm of something a real business could
// actually commit to, not an open field anyone could overstate.
const RESPONSE_TIME_OPTIONS = [
  "Typically responds within 5 minutes",
  "Typically responds within an hour",
  "Typically responds within a few hours",
  "Typically responds within a day",
];

export function ProviderProfileForm({
  providerId,
  category,
  initial,
}: {
  providerId: string;
  category: ServiceCategory | undefined;
  initial: {
    businessName: string;
    description: string | null;
    contactEmail: string;
    contactPhone: string | null;
    coverageAreas: string[];
    licenseNumber: string | null;
    credentials: Record<string, string | string[]>;
    responseTimeLabel: string | null;
  };
}) {
  const router = useRouter();
  const supabase = createClient();

  const [businessName, setBusinessName] = useState(initial.businessName);
  const [description, setDescription] = useState(initial.description ?? "");
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [contactPhone, setContactPhone] = useState(initial.contactPhone ?? "");
  const [coverageAreas, setCoverageAreas] = useState(initial.coverageAreas.join(", "));
  const [licenseNumber, setLicenseNumber] = useState(initial.licenseNumber ?? "");
  const [responseTimeLabel, setResponseTimeLabel] = useState(initial.responseTimeLabel ?? "");
  const [credentialValues, setCredentialValues] = useState<Record<string, string>>(() => {
    const values: Record<string, string> = {};
    for (const field of category?.credentialFields ?? []) {
      const raw = initial.credentials[field.key];
      values[field.key] = Array.isArray(raw) ? raw.join(", ") : raw ?? "";
    }
    return values;
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const credentials: Record<string, string | string[]> = {};
    for (const field of category?.credentialFields ?? []) {
      const raw = credentialValues[field.key] ?? "";
      credentials[field.key] = field.key.toLowerCase().includes("represented")
        ? raw.split(",").map((s) => s.trim()).filter(Boolean)
        : raw;
    }

    const { error: updateError } = await supabase
      .from("service_providers")
      .update({
        business_name: businessName,
        description,
        contact_email: contactEmail,
        contact_phone: contactPhone || null,
        coverage_areas: coverageAreas.split(",").map((s) => s.trim()).filter(Boolean),
        license_number: licenseNumber || null,
        credentials,
        response_time_label: responseTimeLabel || null,
      })
      .eq("id", providerId);

    if (updateError) {
      setStatus("idle");
      setError("Couldn't save your changes — please try again.");
      toast.error("Couldn't save your changes");
      return;
    }

    setStatus("saved");
    toast.success("Profile updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-card border border-line bg-white p-6">
      <div className="space-y-2">
        <Label htmlFor="businessName">Business name</Label>
        <Input id="businessName" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" required value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input id="contactEmail" type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverageAreas">Coverage areas (comma-separated)</Label>
        <Input id="coverageAreas" value={coverageAreas} onChange={(e) => setCoverageAreas(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="licenseNumber">License / registration number</Label>
        <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="responseTimeLabel">Typical response time</Label>
        <p className="text-xs text-muted">
          Shown on your listing to encourage investors to message you — pick whatever you can
          actually commit to.
        </p>
        <Select value={responseTimeLabel} onValueChange={setResponseTimeLabel}>
          <SelectTrigger id="responseTimeLabel">
            <SelectValue placeholder="Not shown" />
          </SelectTrigger>
          <SelectContent>
            {RESPONSE_TIME_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(category?.credentialFields ?? []).map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            placeholder={field.placeholder}
            value={credentialValues[field.key] ?? ""}
            onChange={(e) =>
              setCredentialValues((prev) => ({ ...prev, [field.key]: e.target.value }))
            }
          />
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        className={cn(
          "w-full transition-colors duration-300",
          status === "saved" && "bg-green-600 hover:bg-green-600"
        )}
        disabled={status === "saving"}
      >
        {status === "saving" && "Saving…"}
        {status === "saved" && (
          <>
            <Check className="mr-2 h-4 w-4" /> Saved
          </>
        )}
        {status === "idle" && "Save changes"}
      </Button>
    </form>
  );
}
