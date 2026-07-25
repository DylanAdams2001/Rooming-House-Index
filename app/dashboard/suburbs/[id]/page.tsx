import Link from "next/link";
import { notFound } from "next/navigation";
import { getSuburbById, suburbs, formatAvgRoomRate } from "@/lib/mock-data";
import { DemandBadge } from "@/components/demand-badge";
import { SaveSuburbButton } from "@/components/save-suburb-button";
import { RentalTrendChart } from "@/components/charts/rental-trend-chart";
import { SupplyGrowthChart } from "@/components/charts/supply-growth-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function generateStaticParams() {
  return suburbs.map((s) => ({ id: s.id }));
}

export default function SuburbDetailPage({ params }: { params: { id: string } }) {
  const suburb = getSuburbById(params.id);

  if (!suburb) {
    notFound();
  }

  return (
    <div>
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

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Avg. room rate"
          value={formatAvgRoomRate(suburb)}
          muted={!suburb.avgRoomRateVerified}
        />
        <StatTile label="Rooming houses" value={String(suburb.numRoomingHouses)} />
        <StatTile
          label="Demand level"
          value={
            <div className="flex items-center gap-2">
              <DemandBadge level={suburb.demandLevel} />
              {!suburb.demandVerified && (
                <span className="font-sans text-xs font-normal text-muted">est.</span>
              )}
            </div>
          }
        />
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
    </div>
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
