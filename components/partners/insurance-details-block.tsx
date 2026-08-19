import { formatInsuranceDetails, type InsuranceDetails } from "@/lib/insurance-quote";

export function InsuranceDetailsBlock({ details }: { details: InsuranceDetails }) {
  const rows = formatInsuranceDetails(details);
  if (rows.length === 0) return null;

  const sections = rows.reduce<Record<string, typeof rows>>((acc, row) => {
    (acc[row.section] ??= []).push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(sections).map(([section, sectionRows]) => (
        <div key={section}>
          <p className="mb-1.5 text-sm font-medium text-ink">{section}</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
            {sectionRows.map((row) => (
              <div key={row.label}>
                <dt className="text-xs text-muted">{row.label}</dt>
                <dd className="text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
