import { notFound } from "next/navigation";
import { getSuburbById, suburbs } from "@/lib/mock-data";
import { DemandBadge } from "@/components/demand-badge";
import { SaveSuburbButton } from "@/components/save-suburb-button";
import { RentalTrendChart } from "@/components/charts/rental-trend-chart";
import { SupplyGrowthChart } from "@/components/charts/supply-growth-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <SaveSuburbButton suburbId={suburb.id} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Avg. room rate"
          value={
            <>
              ${suburb.avgRoomRate}/wk
              {!suburb.avgRoomRateVerified && (
                <span className="ml-1 font-sans text-xs font-normal text-muted">est.</span>
              )}
            </>
          }
        />
        <StatTile label="Rooming houses" value={String(suburb.numRoomingHouses)} />
        <StatTile
          label="Demand level"
          value={<DemandBadge level={suburb.demandLevel} />}
        />
      </div>

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

function StatTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-2 font-display text-2xl text-ink">{value}</div>
    </div>
  );
}
