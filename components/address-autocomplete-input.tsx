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
export function AddressAutocompleteInput({
  value,
  onChange,
  id,
  placeholder,
  className,
  ...props
}: Omit<InputProps, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
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
          await place.fetchFields({ fields: ["formattedAddress"] });
          onChangeRef.current(place.formattedAddress ?? "");
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
