"use client";

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import { formatAvgRoomRate, type Suburb, type DemandLevel } from "@/lib/mock-data";
import { DemandBadge } from "@/components/demand-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  loadSuburbAddresses,
  groupByStreet,
  type AddressPoint,
} from "@/lib/load-suburb-addresses";

const markerColor: Record<DemandLevel, string> = {
  High: "#1a1a1a",
  Medium: "#999999",
  Low: "#c9c9c9",
};

const VIC_CENTER: [number, number] = [-37.95, 144.95];
const VIC_ZOOM = 9;
const SUBURB_ZOOM = 15;

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

export function SuburbMap({ suburbs }: { suburbs: Suburb[] }) {
  const [expanded, setExpanded] = useState<Suburb | null>(null);
  const [addresses, setAddresses] = useState<AddressPoint[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  function expandSuburb(suburb: Suburb) {
    setExpanded(suburb);
    setLoadingAddresses(true);
    loadSuburbAddresses(suburb.postcode).then((points) => {
      setAddresses(points);
      setLoadingAddresses(false);
    });
  }

  function collapse() {
    setExpanded(null);
    setAddresses([]);
  }

  const streetCounts = expanded ? groupByStreet(addresses) : [];

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
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
                  fillColor: markerColor[suburb.demandLevel],
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
            addresses.map((a, i) => (
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
        </div>
      ) : (
        <div className="flex items-center gap-6 border-t border-line bg-white px-6 py-3 text-xs text-body">
          <span className="font-medium text-muted">Demand</span>
          {(["High", "Medium", "Low"] as DemandLevel[]).map((level) => (
            <span key={level} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: markerColor[level] }}
              />
              {level}
            </span>
          ))}
          <span className="ml-auto text-muted">Click a suburb to see individual addresses</span>
        </div>
      )}
    </div>
  );
}
