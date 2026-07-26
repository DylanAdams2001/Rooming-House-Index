import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export type QuoteRequestSummaryData = {
  propertyAddress: string;
  numberOfRooms: number | null;
  currentArrangement: string | null;
  notes: string | null;
  investorName: string | null;
  investorEmail: string | null;
};

export function QuoteRequestSummary({ request }: { request: QuoteRequestSummaryData }) {
  const r = request;
  return (
    <Card className="mb-4">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-ink" />
          <p className="font-display text-base text-ink">{r.propertyAddress}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Investor</dt>
            <dd className="text-ink">{r.investorName ?? r.investorEmail ?? "Not provided"}</dd>
          </div>
          {r.investorEmail && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Email</dt>
              <dd className="text-ink">{r.investorEmail}</dd>
            </div>
          )}
          {r.numberOfRooms && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Rooms</dt>
              <dd className="text-ink">{r.numberOfRooms}</dd>
            </div>
          )}
          {r.currentArrangement && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Current arrangement</dt>
              <dd className="text-ink">{r.currentArrangement}</dd>
            </div>
          )}
        </dl>
        {r.notes && (
          <p className="mt-3 text-sm text-body">
            <span className="text-xs uppercase tracking-wide text-muted">Notes: </span>
            {r.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
