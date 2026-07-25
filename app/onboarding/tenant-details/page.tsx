"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StepHeader } from "@/components/onboarding/step-header";
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

const EMPLOYMENT_OPTIONS = ["Full-time", "Part-time", "Casual", "Student", "Self-employed", "Other"];
const INCOME_RANGES = ["Under $800/wk", "$800-1000/wk", "$1000-1200/wk", "$1200-1500/wk", "$1500+/wk"];

function TenantDetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const supabase = createClient();

  const [employmentStatus, setEmploymentStatus] = useState("");
  const [occupation, setOccupation] = useState("");
  const [incomeRange, setIncomeRange] = useState("");
  const [numOccupants, setNumOccupants] = useState("1");
  const [hasPets, setHasPets] = useState(false);
  const [petDetails, setPetDetails] = useState("");
  const [isSmoker, setIsSmoker] = useState(false);
  const [moveInDate, setMoveInDate] = useState("");
  const [referenceName, setReferenceName] = useState("");
  const [referencePhone, setReferencePhone] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { error: upsertError } = await supabase.from("tenant_profiles").upsert({
      user_id: user.id,
      employment_status: employmentStatus || null,
      occupation: occupation || null,
      weekly_income_range: incomeRange || null,
      num_occupants: Number(numOccupants) || 1,
      has_pets: hasPets,
      pet_details: hasPets ? petDetails || null : null,
      is_smoker: isSmoker,
      preferred_move_in_date: moveInDate || null,
      reference_name: referenceName || null,
      reference_phone: referencePhone || null,
      additional_notes: additionalNotes || null,
    });

    if (!upsertError) {
      await supabase.from("users").update({ onboarding_step: "complete" }).eq("id", user.id);
    }

    setLoading(false);

    if (upsertError) {
      setError("Couldn't save your application details — this needs a live Supabase project connected.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <>
      <StepHeader
        step={3}
        totalSteps={3}
        title="Your rental application"
        subtitle="The details a landlord would want before approving an enquiry — fill this in once, use it everywhere."
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Employment status</Label>
            <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Nurse, Student"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Weekly income</Label>
            <Select value={incomeRange} onValueChange={setIncomeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a range…" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_RANGES.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numOccupants">Number of occupants</Label>
            <Input
              id="numOccupants"
              type="number"
              min={1}
              value={numOccupants}
              onChange={(e) => setNumOccupants(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="moveInDate">Preferred move-in date</Label>
          <Input
            id="moveInDate"
            type="date"
            value={moveInDate}
            onChange={(e) => setMoveInDate(e.target.value)}
          />
        </div>

        <div className="space-y-3 rounded-btn border border-line p-4">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={hasPets}
              onChange={(e) => setHasPets(e.target.checked)}
              className="h-4 w-4 rounded-sm border-line accent-ink"
            />
            I have pets
          </label>
          {hasPets && (
            <Input
              value={petDetails}
              onChange={(e) => setPetDetails(e.target.value)}
              placeholder="e.g. 1 small dog"
            />
          )}
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={isSmoker}
              onChange={(e) => setIsSmoker(e.target.checked)}
              className="h-4 w-4 rounded-sm border-line accent-ink"
            />
            I&apos;m a smoker
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="referenceName">Reference name (optional)</Label>
            <Input
              id="referenceName"
              value={referenceName}
              onChange={(e) => setReferenceName(e.target.value)}
              placeholder="Previous landlord/agent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referencePhone">Reference phone</Label>
            <Input
              id="referencePhone"
              type="tel"
              value={referencePhone}
              onChange={(e) => setReferencePhone(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Anything else a landlord should know?</Label>
          <Input
            id="notes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : "Finish setting up my profile"}
        </Button>
      </form>
    </>
  );
}

export default function TenantDetailsPage() {
  return (
    <Suspense fallback={null}>
      <TenantDetailsForm />
    </Suspense>
  );
}
