"use client";

import dynamic from "next/dynamic";

// Leaflet touches window/document at import time, so it can't run during SSR —
// this client-boundary wrapper is what lets a Server Component (the listing
// detail page) still render it via a plain import.
export const ListingMapDynamic = dynamic(
  () => import("./listing-map").then((mod) => mod.ListingMap),
  {
    ssr: false,
    loading: () => <div className="h-[320px] w-full animate-pulse rounded-card border border-line bg-offwhite" />,
  }
);
