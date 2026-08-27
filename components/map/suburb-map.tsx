"use client";

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import { formatAvgRoomRate, type Suburb } from "@/lib/mock-data";
import {
  getPropertyRentalsForSuburb,
  getPropertyConfirmationStatus,
  type PropertyRental,
} from "@/lib/property-rentals";
import { listingsToPropertyRentals } from "@/lib/listing-property-adapter";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  loadSuburbAddresses,
  groupByStreet,
  type AddressPoint,
} from "@/lib/load-suburb-addresses";

// Suburb-level dots (the unexpanded, all-Victoria view): green means this
// suburb has a real verified average room rate, dark means it's still a
// placeholder estimate — same distinction formatAvgRoomRate already makes
// in text, just visible on the map before anyone clicks in.
const SUBURB_VERIFIED_COLOR = "#16a34a";
const SUBURB_UNVERIFIED_COLOR = "#1a1a1a";

const PROPERTY_STATUS_COLOR: Record<"tenanted" | "advertised", string> = {
  tenanted: "#16a34a",
  advertised: "#2563eb",
};

const VIC_CENTER: [number, number] = [-37.95, 144.95];
const VIC_ZOOM = 9;
const SUBURB_ZOOM = 15;

function FlyTo({
  center,
  zoom,
  bounds,
}: {
  center: [number, number];
  zoom: number;
  bounds?: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    // When the expanded suburb has verified property markers, fit the view to include
    // them too — they can sit a few km from the suburb's own stored lat/lng, and a fixed
    // zoom centered only on the suburb would leave them off-screen.
    if (bounds && bounds.length > 1) {
      map.flyToBounds(bounds, { padding: [60, 60], maxZoom: zoom, duration: 0.8 });
    } else {
      map.flyTo(center, zoom, { duration: 0.8 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, zoom, bounds, map]);
  return null;
}

export type FocusSuburbTrigger = { id: string; nonce: number };

export function SuburbMap({
  suburbs,
  focusSuburb,
}: {
  suburbs: Suburb[];
  focusSuburb?: FocusSuburbTrigger | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [expanded, setExpanded] = useState<Suburb | null>(null);
  const [addresses, setAddresses] = useState<AddressPoint[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [listingProperties, setListingProperties] = useState<PropertyRental[]>([]);

  function expandSuburb(suburb: Suburb) {
    setExpanded(suburb);
    setLoadingAddresses(true);
    loadSuburbAddresses(suburb.id, suburb.postcode).then((points) => {
      setAddresses(points);
      setLoadingAddresses(false);
    });
    supabase
      .from("listings")
      .select("id, address, suburb_id, lat, lng, room_type, weekly_rate, rented_weekly_rate, status, created_at, rented_at")
      .eq("suburb_id", suburb.id)
      .in("status", ["approved", "rented"])
      .then(({ data }) => {
        setListingProperties(listingsToPropertyRentals(data ?? []));
      });
  }

  function collapse() {
    setExpanded(null);
    setAddresses([]);
    setListingProperties([]);
  }

  // Selecting a suburb from the search box (while already on the map view) should
  // pan/zoom to it on the map instead of navigating away to its detail page. The nonce
  // (not just the id) is the dep so re-selecting the same suburb twice still re-fires.
  useEffect(() => {
    if (!focusSuburb) return;
    const match = suburbs.find((s) => s.id === focusSuburb.id);
    if (match) expandSuburb(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSuburb]);

  const streetCounts = expanded ? groupByStreet(addresses) : [];
  const propertiesForExpanded = expanded
    ? [...getPropertyRentalsForSuburb(expanded.id), ...listingProperties]
    : [];
  // A verified property is often also one of the plain CAV-register addresses (same
  // coordinates) — skip the generic dot for those so it doesn't sit underneath, and
  // block, the amber marker.
  const propertyCoordKeys = new Set(
    propertiesForExpanded.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`)
  );
  const plainAddresses = addresses.filter(
    (a) => !propertyCoordKeys.has(`${a.lat.toFixed(5)},${a.lng.toFixed(5)}`)
  );

  return (
    <div className="overflow-hidden rounded-card border border-line">
      <div className="relative">
        <MapContainer
          center={VIC_CENTER}
          zoom={VIC_ZOOM}
          scrollWheelZoom={true}
          style={{ height: "560px", width: "100%" }}
        >
          <FlyTo
            center={expanded ? [expanded.lat, expanded.lng] : VIC_CENTER}
            zoom={expanded ? SUBURB_ZOOM : VIC_ZOOM}
            bounds={
              expanded && propertiesForExpanded.length > 0
                ? [
                    [expanded.lat, expanded.lng],
                    ...propertiesForExpanded.map((p): [number, number] => [p.lat, p.lng]),
                  ]
                : undefined
            }
          />
          {/* CARTO's free anonymous basemap tiles now require an API key
              (carto.com/basemaps/apikey) — this switched over without
              warning and was showing "API KEY REQUIRED" watermarked tiles
              in production. Esri's Light Gray Canvas is a free,
              no-key-required basemap with the same muted, low-color look
              CARTO's "Positron" style had — closer to how the map looked
              before than OSM's full-color default tiles. Note the
              {z}/{y}/{x} order here, which is reversed from the usual
              {z}/{x}/{y} slippy-map convention. */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com">Esri</a>'
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />

          {!expanded &&
            suburbs.map((suburb) => (
              <CircleMarker
                key={suburb.id}
                center={[suburb.lat, suburb.lng]}
                radius={9}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  fillColor: suburb.avgRoomRateVerified ? SUBURB_VERIFIED_COLOR : SUBURB_UNVERIFIED_COLOR,
                  fillOpacity: 1,
                }}
                eventHandlers={{ click: () => expandSuburb(suburb) }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  <div className="text-xs">
                    <p className="font-display text-sm text-ink">{suburb.name}</p>
                    <p className="text-muted">
                      {formatAvgRoomRate(suburb)} &middot; {suburb.numRoomingHouses} rooming houses
                    </p>
                    <p className="mt-0.5 text-muted">Click to view addresses</p>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}

          {expanded &&
            plainAddresses.map((a, i) => (
              <CircleMarker
                key={i}
                center={[a.lat, a.lng]}
                radius={6}
                pathOptions={{
                  color: "#ffffff",
                  weight: 1.5,
                  fillColor: "#1a1a1a",
                  fillOpacity: 0.85,
                }}
              >
                <Popup minWidth={160}>
                  <p className="text-sm text-ink">{a.street}</p>
                  <p className="text-xs text-muted">{expanded.name}</p>
                </Popup>
              </CircleMarker>
            ))}

          {expanded &&
            propertiesForExpanded.map((property) => {
              const status = getPropertyConfirmationStatus(property);
              return (
                <CircleMarker
                  key={property.id}
                  center={[property.lat, property.lng]}
                  radius={9}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 2,
                    fillColor: PROPERTY_STATUS_COLOR[status],
                    fillOpacity: 1,
                  }}
                  eventHandlers={{
                    click: () =>
                      router.push(`/dashboard/suburbs/${expanded.id}/property/${property.id}`),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]}>
                    <div className="text-xs">
                      <p className="font-display text-sm text-ink">{property.address}</p>
                      <p className="text-muted">
                        {property.rooms.length} rooms &middot; from ${Math.min(
                          ...property.rooms.filter((r) => r.weeklyRate > 0).map((r) => r.weeklyRate)
                        )}/wk &middot; {status === "tenanted" ? "confirmed tenanted rate" : "advertised, not yet rented"}
                      </p>
                      <p className="mt-0.5 text-muted">Click to view room-by-room rents</p>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
        </MapContainer>

        {expanded && (
          <button
            type="button"
            onClick={collapse}
            className="absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded-btn border border-line bg-white px-3 py-2 text-sm text-ink shadow-sm hover:bg-linen"
          >
            <ArrowLeft className="h-4 w-4" />
            All suburbs
          </button>
        )}

        <div className="absolute bottom-3 left-3 z-[1000] space-y-1.5 rounded-btn border border-line bg-white px-3 py-2 text-xs text-body shadow-sm">
          {expanded ? (
            <div className="flex items-center gap-3">
              <span className="font-medium text-muted">Real rent data</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PROPERTY_STATUS_COLOR.tenanted }}
                />
                Tenanted
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PROPERTY_STATUS_COLOR.advertised }}
                />
                Advertised
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-medium text-muted">Suburb data</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SUBURB_VERIFIED_COLOR }}
                />
                Verified rate
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SUBURB_UNVERIFIED_COLOR }}
                />
                No data yet
              </span>
            </div>
          )}
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-line bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="font-display text-base text-ink">
              {expanded.name}
              <span className="ml-2 font-sans text-sm font-normal text-muted">
                {loadingAddresses
                  ? "Loading addresses…"
                  : `${addresses.length} registered address${addresses.length === 1 ? "" : "es"}`}
              </span>
            </p>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={`/dashboard/suburbs/${expanded.id}`}>View suburb details</Link>
            </Button>
          </div>
          {!loadingAddresses && streetCounts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-body">
              {streetCounts.map((s) => (
                <span key={s.street}>
                  {s.street} <span className="text-muted">&middot; {s.count}</span>
                </span>
              ))}
            </div>
          )}
          {!loadingAddresses && addresses.length === 0 && (
            <p className="mt-2 text-sm text-muted">
              Address-level data isn&apos;t available for this suburb yet.
            </p>
          )}
          {propertiesForExpanded.length > 0 && (
            <p className="mt-3 text-xs text-muted">
              Click a colored marker on the map to view its room-by-room rents.
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-6 border-t border-line bg-white px-6 py-3 text-xs text-body">
          <span className="ml-auto text-muted">Click a suburb to see individual addresses</span>
        </div>
      )}
    </div>
  );
}
