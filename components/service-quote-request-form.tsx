"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const lockRef = useRef(false);

  const [propertyAddress, setPropertyAddress] = useState("");
  const [addressBook, setAddressBook] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [numberOfRooms, setNumberOfRooms] = useState("");
  const [currentArrangement, setCurrentArrangement] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  // A pending request already exists in this category — blocks a duplicate
  // (double-click, mis-click, or spam) until quotes actually come back,
  // rather than making them wait out an arbitrary timer.
  const [hasPending, setHasPending] = useState(false);

  async function checkPending() {
    const { data } = await supabase
      .from("service_quote_requests")
      .select("id")
      .eq("user_id", userId)
      .eq("category", category)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();
    setHasPending(!!data);
  }

  // Address book: the account's own previously-submitted addresses (any
  // category) — suggested as they type instead of a third-party lookup.
  useEffect(() => {
    supabase
      .from("service_quote_requests")
      .select("property_address")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const unique = Array.from(new Set((data ?? []).map((r) => r.property_address)));
        setAddressBook(unique);
      });

    checkPending();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const suggestions = useMemo(() => {
    if (!propertyAddress.trim()) return [];
    return addressBook
      .filter((a) => a.toLowerCase().includes(propertyAddress.trim().toLowerCase()))
      .filter((a) => a !== propertyAddress)
      .slice(0, 5);
  }, [addressBook, propertyAddress]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lockRef.current || !propertyAddress.trim()) return;
    lockRef.current = true;
    setError(null);
    setStatus("checking");

    const { data: pending } = await supabase
      .from("service_quote_requests")
      .select("id")
      .eq("user_id", userId)
      .eq("category", category)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();

    if (pending) {
      setHasPending(true);
      setStatus("idle");
      setError("You already have a quote request in progress for this category.");
      lockRef.current = false;
      return;
    }

    setStatus("submitting");

    const { error: insertError } = await supabase.from("service_quote_requests").insert({
      user_id: userId,
      category,
      property_address: propertyAddress.trim(),
      number_of_rooms: numberOfRooms ? Number(numberOfRooms) : null,
      current_arrangement: currentArrangement || null,
      notes: notes.trim() || null,
    });

    if (insertError) {
      setStatus("idle");
      setError(
        insertError.message.includes("already have a quote request")
          ? "You already have a quote request in progress for this category."
          : "Couldn't submit your request — please try again."
      );
      if (insertError.message.includes("already have a quote request")) setHasPending(true);
      lockRef.current = false;
      return;
    }

    setStatus("success");
    setHasPending(true);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    router.refresh();
    setPropertyAddress("");
    setNumberOfRooms("");
    setCurrentArrangement("");
    setNotes("");
    setStatus("idle");
    lockRef.current = false;
  }

  const busy = status !== "idle";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative space-y-2">
        <Label htmlFor="propertyAddress">Property address</Label>
        <Input
          id="propertyAddress"
          required
          autoComplete="off"
          value={propertyAddress}
          onChange={(e) => setPropertyAddress(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="15 Grace Street, St Albans VIC 3021"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-btn border border-line bg-white shadow-lg">
            {suggestions.map((a) => (
              <button
                key={a}
                type="button"
                onMouseDown={() => setPropertyAddress(a)}
                className="block w-full px-4 py-2 text-left text-sm text-body hover:bg-linen hover:text-ink"
              >
                {a}
              </button>
            ))}
          </div>
        )}
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
      {!error && hasPending && status === "idle" && (
        <p className="text-sm text-muted">
          You already have a quote request in progress for this category — we&apos;ll be in
          touch soon. You can request again once it&apos;s quoted.
        </p>
      )}

      <Button
        type="submit"
        className={cn(
          "w-full transition-colors duration-300",
          status === "success" && "bg-green-600 hover:bg-green-600"
        )}
        disabled={busy || hasPending || !propertyAddress.trim()}
      >
        {status === "checking" && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…
          </>
        )}
        {status === "submitting" && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
          </>
        )}
        {status === "success" && (
          <>
            <Check className="mr-2 h-4 w-4" /> Request sent
          </>
        )}
        {status === "idle" && "Request quotes"}
      </Button>
    </form>
  );
}
