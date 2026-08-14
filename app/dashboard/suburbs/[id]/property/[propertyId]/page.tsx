import { notFound } from "next/navigation";
import { getSuburbById } from "@/lib/mock-data";
import { getPropertyRentalById, propertyRentals } from "@/lib/property-rentals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackLink } from "@/components/back-link";
import { cn } from "@/lib/utils";
import type { PropertyRoomRental } from "@/lib/property-rentals";

export function generateStaticParams() {
  return propertyRentals.map((p) => ({ id: p.suburbId, propertyId: p.id }));
}

const statusStyles: Record<PropertyRoomRental["status"], string> = {
  tenanted: "border-line bg-white text-body",
  vacant: "border-green-600 bg-green-50 text-green-700",
  "under-application": "border-line bg-linen text-ink",
};

const statusLabels: Record<PropertyRoomRental["status"], string> = {
  tenanted: "Tenanted",
  vacant: "Vacant",
  "under-application": "Under application",
};

export default function PropertyRentalPage({
  params,
}: {
  params: { id: string; propertyId: string };
}) {
  const suburb = getSuburbById(params.id);
  const property = getPropertyRentalById(params.propertyId);

  if (!suburb || !property || property.suburbId !== suburb.id) {
    notFound();
  }

  return (
    <div>
      <BackLink href={`/dashboard/suburbs/${suburb.id}`} label={suburb.name} />

      <div>
        <p className="text-sm text-muted">{suburb.name} rooming house</p>
        <h1 className="mt-1 font-display text-4xl text-ink">{property.address}</h1>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Avg. room rate" value={`$${property.avgWeeklyRate}/wk`} />
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
