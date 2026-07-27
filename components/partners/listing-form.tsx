"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AddressAutocompleteInput, type AddressParts } from "@/components/address-autocomplete-input";
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
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ROOM_TYPES = ["Single", "Shared"] as const;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatTime(time: string) {
  const [hoursStr, minutes] = time.split(":");
  const hours = Number(hoursStr);
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes}${period}`;
}

// Builds the same free-text style already used across the site ("Saturday 25
// Jul, 10:00am - 10:30am") from separate date/start/end picker values, so every
// existing display of inspection_time (cards, listing detail, enquiry threads)
// keeps working unchanged.
function formatInspectionTime(date: string, startTime: string, endTime: string) {
  if (!date || !startTime) return "";
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  const dateLabel = parsed.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  return endTime
    ? `${dateLabel}, ${formatTime(startTime)} - ${formatTime(endTime)}`
    : `${dateLabel}, ${formatTime(startTime)}`;
}

export type ListingFormInitial = {
  id?: string;
  address: string;
  suburbName: string;
  postcode: string;
  lat?: number;
  lng?: number;
  roomType: "Single" | "Shared";
  weeklyRate: string;
  availableFrom: string;
  description: string;
  inspectionTime: string;
  photos: string[];
};

export function ListingForm({
  initial,
  redirectTo = "/partners/listings",
}: {
  initial?: ListingFormInitial;
  // Defaults to the owner's own "my listings" page — admin editing another
  // owner's listing from the Business Partners directory overrides this so
  // saving doesn't land them on their own (unrelated, likely empty) list.
  redirectTo?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [address, setAddress] = useState(initial?.address ?? "");
  const [suburbName, setSuburbName] = useState(initial?.suburbName ?? "");
  const [postcode, setPostcode] = useState(initial?.postcode ?? "");
  // Only set from an actual Places selection (see handleAddressSelect) — typing
  // an address by hand with no selection leaves this null, so the map correctly
  // falls back to an approximate suburb-level pin instead of a stale/wrong one.
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initial?.lat != null && initial?.lng != null ? { lat: initial.lat, lng: initial.lng } : null
  );
  const [roomType, setRoomType] = useState<string>(initial?.roomType ?? "");
  const [weeklyRate, setWeeklyRate] = useState(initial?.weeklyRate ?? "");
  const [availableFrom, setAvailableFrom] = useState(initial?.availableFrom ?? "Available now");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [inspectionDate, setInspectionDate] = useState("");
  const [inspectionStartTime, setInspectionStartTime] = useState("");
  const [inspectionEndTime, setInspectionEndTime] = useState("");
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUploading(false);
      return;
    }

    const uploadedUrls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError("Couldn't upload one or more photos — please try again.");
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("listing-photos").getPublicUrl(path);
      uploadedUrls.push(publicUrl);
    }

    setPhotos((prev) => [...prev, ...uploadedUrls]);
    setUploading(false);
    e.target.value = "";
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url));
  }

  function handleAddressChange(value: string) {
    setAddress(value);
    // Free typing (not a Places selection) invalidates any coordinates from a
    // previous selection — cleared here so a stale pin never outlives the text
    // it was resolved from; handleAddressSelect below re-sets it immediately
    // afterward when the change was actually a Places selection.
    setCoords(null);
  }

  function handleAddressSelect(parts: AddressParts) {
    if (parts.suburb) setSuburbName(parts.suburb);
    if (parts.postcode) setPostcode(parts.postcode);
    if (parts.lat != null && parts.lng != null) setCoords({ lat: parts.lat, lng: parts.lng });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("idle");
      return;
    }

    const formattedInspectionTime = formatInspectionTime(
      inspectionDate,
      inspectionStartTime,
      inspectionEndTime
    );

    const payload = {
      suburb_id: `${slugify(suburbName)}-${postcode.trim()}`,
      suburb_name: suburbName.trim(),
      address: address.trim(),
      // Only true when we have real coordinates from a Places selection — this
      // is what lets the listing map show the exact address (with Street View)
      // instead of an approximate suburb-level pin.
      address_verified: coords !== null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      room_type: roomType,
      weekly_rate: Number(weeklyRate),
      available_from: availableFrom.trim(),
      description: description.trim(),
      photos,
      // Falls back to whatever inspection time the listing already had if the
      // picker was left untouched while editing (e.g. changing only the price).
      inspection_time: formattedInspectionTime || initial?.inspectionTime || null,
    };

    // Property managers are hand-picked and already vetted before they're ever
    // sent a signup link, so their listings publish immediately rather than
    // sitting in a pending queue (unlike self-serve service provider signups).
    // owner_id is only ever set on insert — an admin editing another owner's
    // listing must not silently reassign it to themselves on save.
    const { error: writeError } = initial?.id
      ? await supabase.from("listings").update(payload).eq("id", initial.id)
      : await supabase.from("listings").insert({ ...payload, owner_id: user.id, status: "approved" });

    if (writeError) {
      setStatus("idle");
      setError("Couldn't save this listing — please try again.");
      return;
    }

    setStatus("success");
    router.push(redirectTo);
    router.refresh();
  }

  const busy = status !== "idle" || uploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-card border border-line bg-white p-6">
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <AddressAutocompleteInput
          id="address"
          required
          value={address}
          onChange={handleAddressChange}
          onPlaceSelect={handleAddressSelect}
          placeholder="15 Grace Street, St Albans VIC 3021"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="suburbName">Suburb</Label>
          <Input id="suburbName" required value={suburbName} onChange={(e) => setSuburbName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postcode">Postcode</Label>
          <Input id="postcode" required value={postcode} onChange={(e) => setPostcode(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Room type</Label>
          <Select value={roomType} onValueChange={setRoomType}>
            <SelectTrigger>
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent>
              {ROOM_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weeklyRate">Weekly rate ($)</Label>
          <Input
            id="weeklyRate"
            type="number"
            min={0}
            required
            value={weeklyRate}
            onChange={(e) => setWeeklyRate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="availableFrom">Available from</Label>
        <Input
          id="availableFrom"
          required
          value={availableFrom}
          onChange={(e) => setAvailableFrom(e.target.value)}
          placeholder="Available now, or e.g. Available 1 Aug"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Inspection time (optional)</Label>
        {initial?.inspectionTime && !inspectionDate && (
          <p className="text-xs text-muted">Current: {initial.inspectionTime}</p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            type="date"
            aria-label="Inspection date"
            value={inspectionDate}
            onChange={(e) => setInspectionDate(e.target.value)}
          />
          <Input
            type="time"
            aria-label="Inspection start time"
            value={inspectionStartTime}
            onChange={(e) => setInspectionStartTime(e.target.value)}
          />
          <Input
            type="time"
            aria-label="Inspection end time"
            value={inspectionEndTime}
            onChange={(e) => setInspectionEndTime(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Photos</Label>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((url) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-btn border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Room photo" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink underline underline-offset-4">
          {uploading ? "Uploading…" : "Add photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
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
        {status === "idle" && (initial?.id ? "Save changes" : "Publish listing")}
      </Button>
    </form>
  );
}
