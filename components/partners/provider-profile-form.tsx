"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ServiceCategory } from "@/lib/service-categories";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
      })
      .eq("id", providerId);

    if (updateError) {
      setStatus("idle");
      setError("Couldn't save your changes — please try again.");
      return;
    }

    setStatus("saved");
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
