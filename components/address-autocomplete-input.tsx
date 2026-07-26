"use client";

import { useEffect, useRef, useState } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { loadGoogleMaps } from "@/lib/load-google-maps";

// Victoria's rough bounding box — biases results toward VIC without hard-
// excluding a border address, since Places doesn't support state-level
// region restriction (only country-level via includedRegionCodes).
const VIC_BOUNDS = {
  south: -39.2,
  west: 140.9,
  north: -33.9,
  east: 150.0,
};

// Uses Places API (New)'s PlaceAutocompleteElement — the actively-developed
// replacement for the legacy google.maps.places.Autocomplete widget, which
// Google has on a path to eventual retirement.
export type AddressParts = {
  suburb?: string;
  postcode?: string;
  lat?: number;
  lng?: number;
};

export function AddressAutocompleteInput({
  value,
  onChange,
  onPlaceSelect,
  id,
  placeholder,
  className,
  ...props
}: Omit<InputProps, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  // Fired only on an explicit Places selection (not free typing), with whatever
  // suburb/postcode components Google returns — lets forms like the listing
  // creator auto-fill those fields instead of requiring them typed separately.
  onPlaceSelect?: (parts: AddressParts) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onPlaceSelectRef = useRef(onPlaceSelect);
  onPlaceSelectRef.current = onPlaceSelect;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let element: any;

    loadGoogleMaps()
      .then(async () => {
        if (cancelled || !containerRef.current || !window.google?.maps?.importLibrary) return;
        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");
        if (cancelled || !containerRef.current) return;

        element = new PlaceAutocompleteElement({
          includedRegionCodes: ["au"],
          locationBias: {
            west: VIC_BOUNDS.west,
            south: VIC_BOUNDS.south,
            east: VIC_BOUNDS.east,
            north: VIC_BOUNDS.north,
          },
        });
        if (id) element.id = id;
        if (placeholder) element.setAttribute("placeholder", placeholder);
        element.classList.add("rhi-address-autocomplete");

        // Keep React state in sync with free typing, not just an explicit
        // selection, so "Request quotes" enables as soon as text is entered.
        element.addEventListener("input", (e: any) => {
          onChangeRef.current(e.target?.value ?? "");
        });

        element.addEventListener("gmp-select", async (event: any) => {
          const place = event.placePrediction.toPlace();
          await place.fetchFields({
            fields: ["formattedAddress", "addressComponents", "location"],
          });
          onChangeRef.current(place.formattedAddress ?? "");

          if (onPlaceSelectRef.current) {
            const components: { longText?: string; shortText?: string; types: string[] }[] =
              place.addressComponents ?? [];
            const suburb = components.find((c) => c.types.includes("locality"))?.longText;
            const postcode = components.find((c) => c.types.includes("postal_code"))?.longText;
            const lat = place.location?.lat?.();
            const lng = place.location?.lng?.();
            onPlaceSelectRef.current({ suburb, postcode, lat, lng });
          }
        });

        containerRef.current.appendChild(element);
        setReady(true);
      })
      .catch(() => {
        // No key configured, project restrictions not yet propagated, or the
        // library failed to load — the plain text field below stays usable.
      });

    return () => {
      cancelled = true;
      element?.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      <div ref={containerRef} className={ready ? "" : "hidden"} />
      {!ready && (
        <Input
          id={id}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          {...props}
        />
      )}
    </div>
  );
}
