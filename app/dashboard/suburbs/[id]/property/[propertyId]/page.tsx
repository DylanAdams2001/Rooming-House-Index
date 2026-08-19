import { notFound } from "next/navigation";
import { getSuburbById } from "@/lib/mock-data";
import { getPropertyRentalById } from "@/lib/property-rentals";
import { listingToPropertyRental } from "@/lib/listing-property-adapter";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackLink } from "@/components/back-link";
import { cn } from "@/lib/utils";
import type { PropertyRoomRental } from "@/lib/property-rentals";

// Real listings can flip to "rented" (or be newly approved) at any time, so
// this page can't be statically generated — always fetch fresh.
export const dynamic = "force-dynamic";

const statusStyles: Record<PropertyRoomRental["status"], string> = {
  tenanted: "border-line bg-white text-body",
  vacant: "border-green-600 bg-green-50 text-green-700",
  "under-application": "border-line bg-linen text-ink",
  unknown: "border-line bg-offwhite text-muted",
};

const statusLabels: Record<PropertyRoomRental["status"], string> = {
  tenanted: "Tenanted",
  vacant: "Vacant",
  "under-application": "Under application",
  unknown: "No data",
};

export default async function PropertyRentalPage({
  params,
}: {
  params: { id: string; propertyId: string };
}) {
  const suburb = getSuburbById(params.id);
  let property = getPropertyRentalById(params.propertyId);

  if (!property) {
    const supabase = createClient();
    const { data: listing } = await supabase
      .from("listings")
      .select("id, address, suburb_id, lat, lng, room_type, weekly_rate, rented_weekly_rate, status, created_at, rented_at")
      .eq("id", params.propertyId)
      .in("status", ["approved", "rented"])
      .maybeSingle();
    property = listing ? listingToPropertyRental(listing) ?? undefined : undefined;
  }

  if (!suburb || !property || property.suburbId !== suburb.id) {
    notFound();
  }

  const knownRooms = property.rooms.filter(
    (r) => r.status !== "unknown" && r.weeklyRate > 0
  );
  const rateLabel =
    property.avgWeeklyRate !== undefined
      ? "Avg. room rate"
      : `Known rate (${knownRooms.length} of ${property.rooms.length})`;
  const rateValue =
    property.avgWeeklyRate ??
    (knownRooms.length > 0
      ? Math.round(knownRooms.reduce((sum, r) => sum + r.weeklyRate, 0) / knownRooms.length)
      : null);

  return (
    <div>
      <BackLink href={`/dashboard/suburbs/${suburb.id}`} label={suburb.name} />

      <div>
        <p className="text-sm text-muted">{suburb.name} rooming house</p>
        <h1 className="mt-1 font-display text-4xl text-ink">{property.address}</h1>
        <p className="mt-1 text-xs text-muted">
          Added{" "}
          {new Date(property.dateAdded).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          })}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label={rateLabel}
          value={rateValue !== null ? `$${rateValue}/wk` : "No data"}
        />
        <StatTile label="Total rooms" value={String(property.rooms.length)} />
        <StatTile
          label="Vacant now"
          value={String(property.rooms.filter((r) => r.status === "vacant").length)}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Room-by-room rent</CardTitle>
          <p className="text-sm text-muted">{property.sourceNote}</p>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-line">
            {property.rooms.map((room) => (
              <div
                key={room.label}
                className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-lg text-ink">{room.label}</p>
                  {room.note && <p className="mt-0.5 text-sm text-muted">{room.note}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
                      statusStyles[room.status]
                    )}
                  >
                    {statusLabels[room.status]}
                  </span>
                  <span className="font-display text-xl text-ink">
                    {room.weeklyRate > 0 ? `$${room.weeklyRate}/wk` : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
