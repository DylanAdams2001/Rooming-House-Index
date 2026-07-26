import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export type TenantApplication = {
  fullName: string | null;
  email: string;
  phone: string | null;
  employmentStatus: string | null;
  occupation: string | null;
  weeklyIncomeRange: string | null;
  numOccupants: number;
  hasPets: boolean;
  petDetails: string | null;
  isSmoker: boolean;
  preferredMoveInDate: string | null;
  referenceName: string | null;
  referencePhone: string | null;
  additionalNotes: string | null;
};

// The tenant already filled this in before they could enquire at all (see
// enquire-button.tsx) — this just surfaces it to the property manager whose
// room they enquired about, rather than asking for any of it again.
export function TenantApplicationSummary({ application }: { application: TenantApplication }) {
  const a = application;
  return (
    <Card className="mb-4">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-ink" />
          <p className="font-display text-base text-ink">{a.fullName ?? a.email}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Email</dt>
            <dd className="text-ink">{a.email}</dd>
          </div>
          {a.phone && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Phone</dt>
              <dd className="text-ink">{a.phone}</dd>
            </div>
          )}
          {a.employmentStatus && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Employment</dt>
              <dd className="text-ink">
                {a.employmentStatus}
                {a.occupation ? ` — ${a.occupation}` : ""}
              </dd>
            </div>
          )}
          {a.weeklyIncomeRange && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Income</dt>
              <dd className="text-ink">{a.weeklyIncomeRange}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Occupants</dt>
            <dd className="text-ink">{a.numOccupants}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Pets / Smoker</dt>
            <dd className="text-ink">
              {a.hasPets ? a.petDetails || "Yes" : "No"} · {a.isSmoker ? "Smoker" : "Non-smoker"}
            </dd>
          </div>
          {a.preferredMoveInDate && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Preferred move-in</dt>
              <dd className="text-ink">{a.preferredMoveInDate}</dd>
            </div>
          )}
          {a.referenceName && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Reference</dt>
              <dd className="text-ink">
                {a.referenceName}
                {a.referencePhone ? ` — ${a.referencePhone}` : ""}
              </dd>
            </div>
          )}
        </dl>
        {a.additionalNotes && (
          <p className="mt-3 text-sm text-body">
            <span className="text-xs uppercase tracking-wide text-muted">Notes: </span>
            {a.additionalNotes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
