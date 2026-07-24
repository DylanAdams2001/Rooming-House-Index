"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ServiceCategory } from "@/lib/service-categories";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ProviderJoinForm({ category }: { category: ServiceCategory }) {
  const router = useRouter();
  const supabase = createClient();

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [coverageAreas, setCoverageAreas] = useState("VIC");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [credentialValues, setCredentialValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const credentials: Record<string, string | string[]> = {};
    for (const field of category.credentialFields) {
      const raw = credentialValues[field.key] ?? "";
      credentials[field.key] = field.key.toLowerCase().includes("represented")
        ? raw.split(",").map((s) => s.trim()).filter(Boolean)
        : raw;
    }

    const { error: insertError } = await supabase.from("service_providers").insert({
      user_id: user.id,
      category: category.dbCategory,
      business_name: businessName,
      description,
      contact_email: contactEmail,
      contact_phone: contactPhone || null,
      coverage_areas: coverageAreas.split(",").map((s) => s.trim()).filter(Boolean),
      license_number: licenseNumber || null,
      credentials,
    });

    // A provider account is distinct from a plain investor account.
    await supabase.from("users").update({ role: "provider" }).eq("id", user.id);

    setLoading(false);

    if (insertError) {
      setError(
        "Couldn't submit your listing — this needs a live Supabase project connected to work."
      );
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-card border border-line bg-white p-8 text-center">
        <p className="font-display text-xl text-ink">Listing submitted</p>
        <p className="mt-2 text-sm text-body">
          Your {category.label.toLowerCase()} listing is pending review. We&apos;ll be in touch
          once it&apos;s approved and visible in the directory.
        </p>
      </div>
    );
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

      {category.credentialFields.map((field) => (
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting…" : "Submit listing for review"}
      </Button>
    </form>
  );
}
