"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

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
  return (
    <div className="overflow-hidden rounded-card border border-line">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "320px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <CircleMarker
          center={[lat, lng]}
          radius={10}
          pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#1a1a1a", fillOpacity: 1 }}
        >
          <Popup minWidth={160}>
            <p className="text-sm text-ink">{title}</p>
            <p className="text-xs text-muted">{suburbName}</p>
          </Popup>
        </CircleMarker>
      </MapContainer>
      {approximate && (
        <p className="border-t border-line bg-white px-4 py-2 text-xs text-muted">
          Approximate location — showing the {suburbName} area, not the exact address.
        </p>
      )}
    </div>
  );
}
