"use client";

import { useEffect, useRef } from "react";
import { loadGoogleMaps } from "@/lib/load-google-maps";

export function ListingMap({
  lat,
  lng,
  title,
  suburbName,
  approximate,
}: {
  lat: number;
  lng: number;
  title: string;
  suburbName: string;
  approximate: boolean;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current || !window.google) return;
        const position = { lat, lng };
        const map = new window.google.maps.Map(mapRef.current, {
          center: position,
          zoom: approximate ? 14 : 17,
          // Street View (the Pegman control) is only offered for a verified
          // real address — dropping it onto an approximate suburb-level pin
          // would show real imagery for the wrong house.
          streetViewControl: !approximate,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        new window.google.maps.Marker({
          position,
          map,
          title,
        });
      })
      .catch(() => {
        // No key configured, or the script failed to load — the disclaimer
        // below (when approximate) still renders either way.
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng, approximate, title]);

  return (
    <div className="overflow-hidden rounded-card border border-line">
      <div ref={mapRef} style={{ height: "320px", width: "100%" }} className="bg-offwhite" />
      {approximate && (
        <p className="border-t border-line bg-white px-4 py-2 text-xs text-muted">
          Approximate location — showing the {suburbName} area, not the exact address.
        </p>
      )}
    </div>
  );
}
