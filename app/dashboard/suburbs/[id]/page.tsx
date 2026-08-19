import Link from "next/link";
import { notFound } from "next/navigation";
import { getSuburbById, suburbs, formatAvgRoomRate } from "@/lib/mock-data";
import {
  getPropertyRentalsForSuburb,
  getPropertyRateSummary,
  getPropertyConfirmationStatus,
  type PropertyRental,
} from "@/lib/property-rentals";
import { listingsToPropertyRentals } from "@/lib/listing-property-adapter";
import { loadSuburbAddresses } from "@/lib/load-suburb-addresses";
import { createClient } from "@/lib/supabase/server";
import { SaveSuburbButton } from "@/components/save-suburb-button";
import { RentalTrendChart } from "@/components/charts/rental-trend-chart";
import { SupplyGrowthChart } from "@/components/charts/supply-growth-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/back-link";
import { cn } from "@/lib/utils";
import { ExternalLink, ChevronRight } from "lucide-react";

export function generateStaticParams() {
  return suburbs.map((s) => ({ id: s.id }));
}

export default async function SuburbDetailPage({ params }: { params: { id: string } }) {
  const suburb = getSuburbById(params.id);

  if (!suburb) {
    notFound();
  }

  const supabase = createClient();
  const [addresses, { data: listingRows }] = await Promise.all([
    loadSuburbAddresses(suburb.id, suburb.postcode),
    supabase
      .from("listings")
      .select("id, address, suburb_id, lat, lng, room_type, weekly_rate, rented_weekly_rate, status, created_at, rented_at")
      .eq("suburb_id", suburb.id)
      .in("status", ["approved", "rented"]),
  ]);
  const properties = [
    ...getPropertyRentalsForSuburb(suburb.id),
    ...listingsToPropertyRentals(listingRows ?? []),
  ];
  // Verified properties are often also in the plain CAV address list (same address) —
  // skip them there so each address only appears once, in its more useful form.
  const propertyCoordKeys = new Set(
    properties.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`)
  );
  const plainAddresses = addresses.filter(
    (a) => !propertyCoordKeys.has(`${a.lat.toFixed(5)},${a.lng.toFixed(5)}`)
  );

  // Highest to lowest within each group — known rooms only, since averaging in
  // unpriced ("unknown") rooms would understate a property's real rate.
  function sortRate(property: PropertyRental) {
    if (property.avgWeeklyRate !== undefined) return property.avgWeeklyRate;
    const known = property.rooms.filter((r) => r.status !== "unknown" && r.weeklyRate > 0);
    if (known.length === 0) return 0;
    return known.reduce((sum, r) => sum + r.weeklyRate, 0) / known.length;
  }
  const leasedProperties = properties
    .filter((p) => getPropertyConfirmationStatus(p) === "tenanted")
    .sort((a, b) => sortRate(b) - sortRate(a));
  const advertisedProperties = properties
    .filter((p) => getPropertyConfirmationStatus(p) === "advertised")
    .sort((a, b) => sortRate(b) - sortRate(a));

  return (
    <div>
      <BackLink href="/dashboard/suburbs" label="Suburb Explorer" />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm text-muted">
            {suburb.council} · {suburb.postcode}, {suburb.state}
          </p>
          <h1 className="mt-1 font-display text-4xl text-ink">{suburb.name}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/listings?suburb=${suburb.id}`} target="_blank">
              Explore current listings
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <SaveSuburbButton suburbId={suburb.id} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile
          label="Avg. room rate"
          value={formatAvgRoomRate(suburb)}
          muted={!suburb.avgRoomRateVerified}
        />
        <StatTile label="Rooming houses" value={String(suburb.numRoomingHouses)} />
      </div>

      {suburb.rentalInsights && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Rental Market Insights — 1 Bed Units</CardTitle>
            <p className="text-sm text-muted">
              Real figures from{" "}
              <a
                href={suburb.rentalInsights.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-ink"
              >
                realestate.com.au
              </a>
              , manually looked up.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <InsightTile label="Price growth" value={suburb.rentalInsights.priceGrowthYoY} />
              <InsightTile
                label="Available (30d)"
                value={String(suburb.rentalInsights.unitsAvailableLastMonth)}
              />
              <InsightTile
                label="Leased (12mo)"
                value={String(suburb.rentalInsights.unitsLeasedPast12Months)}
              />
              <InsightTile
                label="Median days on market"
                value={String(suburb.rentalInsights.medianDaysOnMarket)}
              />
              <InsightTile
                label="Renters interested"
                value={String(suburb.rentalInsights.rentersInterested)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rental Rate Trend (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <RentalTrendChart data={suburb.rentalTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supply Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <SupplyGrowthChart data={suburb.supplyGrowth} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Market Commentary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body">{suburb.commentary}</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Registered Addresses</CardTitle>
          <p className="text-sm text-muted">
            {addresses.length > 0
              ? `${addresses.length} registered rooming house${
                  addresses.length === 1 ? "" : "s"
                } on the Consumer Affairs Victoria register.`
              : "Address-level data isn't available for this suburb yet."}
          </p>
        </CardHeader>
        {(addresses.length > 0 || properties.length > 0) && (
          <CardContent>
            {properties.length > 0 && (
              <div className="mb-5 space-y-5">
                {leasedProperties.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-green-600" />
                      Leased ({leasedProperties.length})
                    </p>
                    <div className="space-y-2">
                      {leasedProperties.map((property) => (
                        <PropertyRow key={property.id} suburbId={suburb.id} property={property} status="tenanted" />
                      ))}
                    </div>
                  </div>
                )}
                {advertisedProperties.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      Advertised ({advertisedProperties.length})
                    </p>
                    <div className="space-y-2">
                      {advertisedProperties.map((property) => (
                        <PropertyRow key={property.id} suburbId={suburb.id} property={property} status="advertised" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {plainAddresses.length > 0 && (
              <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-body sm:grid-cols-2 lg:grid-cols-3">
                {plainAddresses.map((a, i) => (
                  <p key={i}>{a.street}</p>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function PropertyRow({
  suburbId,
  property,
  status,
}: {
  suburbId: string;
  property: PropertyRental;
  status: "tenanted" | "advertised";
}) {
  return (
    <Link
      href={`/dashboard/suburbs/${suburbId}/property/${property.id}`}
      className={cn(
        "flex items-center justify-between gap-3 rounded-btn border-2 px-4 py-3 text-sm transition-colors",
        status === "tenanted"
          ? "border-green-600 bg-green-50 hover:bg-green-100"
          : "border-blue-600 bg-blue-50 hover:bg-blue-100"
      )}
    >
      <div>
        <p className="font-medium text-ink">{property.address}</p>
        <p className="text-xs text-muted">
          {property.rooms.length} rooms &middot; {getPropertyRateSummary(property)}{" "}
          &middot; {status === "tenanted" ? "confirmed tenanted rate" : "advertised, not yet tenanted"}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink" />
    </Link>
  );
}

function InsightTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-xl text-ink">{value}</p>
    </div>
  );
}

function StatTile({
  label,
  value,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="rounded-card border border-line bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <div className={muted ? "mt-2 text-lg text-muted" : "mt-2 font-display text-2xl text-ink"}>
        {value}
      </div>
    </div>
  );
}
