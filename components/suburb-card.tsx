import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemandBadge } from "@/components/demand-badge";
import { formatAvgRoomRate, type Suburb } from "@/lib/mock-data";

export function SuburbCard({
  suburb,
  footerAction,
}: {
  suburb: Suburb;
  footerAction?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-xl text-ink">{suburb.name}</h3>
            <p className="text-sm text-muted">
              {suburb.postcode} · {suburb.state}
            </p>
          </div>
          <DemandBadge level={suburb.demandLevel} />
        </div>
        <p className="text-sm text-body">{suburb.council}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-6 pt-0">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted">Avg. room rate</dt>
            <dd
              className={
                suburb.avgRoomRateVerified
                  ? "font-display text-lg text-ink"
                  : "font-sans text-sm text-muted"
              }
            >
              {formatAvgRoomRate(suburb)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Rooming houses</dt>
            <dd className="font-display text-lg text-ink">{suburb.numRoomingHouses}</dd>
          </div>
        </dl>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/dashboard/suburbs/${suburb.id}`}>View Details</Link>
          </Button>
          {footerAction}
        </div>
      </CardContent>
    </Card>
  );
}
