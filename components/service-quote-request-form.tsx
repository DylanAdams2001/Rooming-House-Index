"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ARRANGEMENT_OPTIONS = [
  { value: "self_managed", label: "I self-manage it" },
  { value: "with_agent", label: "Managed by another agent" },
  { value: "not_yet_operating", label: "Not operating as a rooming house yet" },
];

export function ServiceQuoteRequestForm({
  userId,
  category,
}: {
  userId: string;
  // Matches service-categories.ts dbCategory — stored alongside the request so
  // one shared table can serve every quote-based category.
  category: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [propertyAddress, setPropertyAddress] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState("");
  const [currentArrangement, setCurrentArrangement] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyAddress.trim()) return;
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("service_quote_requests").insert({
      user_id: userId,
      category,
      property_address: propertyAddress.trim(),
      number_of_rooms: numberOfRooms ? Number(numberOfRooms) : null,
      current_arrangement: currentArrangement || null,
      notes: notes.trim() || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Couldn't submit your request — please try again.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="propertyAddress">Property address</Label>
        <Input
          id="propertyAddress"
          required
          value={propertyAddress}
          onChange={(e) => setPropertyAddress(e.target.value)}
          placeholder="15 Grace Street, St Albans VIC 3021"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfRooms">Number of rooms</Label>
        <Input
          id="numberOfRooms"
          type="number"
          min={1}
          value={numberOfRooms}
          onChange={(e) => setNumberOfRooms(e.target.value)}
          placeholder="e.g. 6"
        />
      </div>

      <div className="space-y-2">
        <Label>Current arrangement</Label>
        <Select value={currentArrangement} onValueChange={setCurrentArrangement}>
          <SelectTrigger>
            <SelectValue placeholder="Select one" />
          </SelectTrigger>
          <SelectContent>
            {ARRANGEMENT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Anything else we should know?</Label>
        <Textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tenant turnover, special requirements, timeline, etc."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting || !propertyAddress.trim()}>
        {submitting ? "Submitting…" : "Request quotes"}
      </Button>
    </form>
  );
}
