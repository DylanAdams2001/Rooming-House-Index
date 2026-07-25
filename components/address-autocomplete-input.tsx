"use client";

import { useEffect, useRef } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { loadGoogleMaps } from "@/lib/load-google-maps";

// Victoria's rough bounding box — biases results toward VIC without hard-
// excluding a border address, since Places doesn't support state-level
// componentRestrictions (only country).
const VIC_BOUNDS = {
  south: -39.2,
  west: 140.9,
  north: -33.9,
  east: 150.0,
};

export function AddressAutocompleteInput({
  value,
  onChange,
  ...props
}: Omit<InputProps, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let listener: { remove: () => void } | undefined;
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !inputRef.current || !window.google) return;
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "au" },
          fields: ["formatted_address"],
          types: ["address"],
          bounds: new window.google.maps.LatLngBounds(
            { lat: VIC_BOUNDS.south, lng: VIC_BOUNDS.west },
            { lat: VIC_BOUNDS.north, lng: VIC_BOUNDS.east }
          ),
        });
        listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place?.formatted_address) onChangeRef.current(place.formatted_address);
        });
      })
      .catch(() => {
        // No key configured yet, or the script failed to load — the field
        // still works as a plain text input, just without suggestions.
      });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, []);

  return (
    <Input
      ref={inputRef}
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}
