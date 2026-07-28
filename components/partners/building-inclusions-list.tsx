import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

// Fixed for now — same for every builder/tier (see Property Inclusions List
// PDF). Condensed for investors from the full builder spec sheet; the one
// carve-out investors need to know up front is loose furniture, which comes
// from the furnishing providers instead, not the build price.
const INCLUSION_GROUPS: { heading: string; items: string[] }[] = [
  {
    heading: "Approvals & site works",
    items: [
      "Council and authority approvals, drafting, structural/civil engineering",
      "7-star energy rating, temporary and silt fencing, termite treatment",
    ],
  },
  {
    heading: "Structure & external",
    items: [
      "Concrete slab, engineered prefabricated frame and roof trusses",
      "Clay brick/render finish, double-glazed windows and sliding doors",
      "Colorbond roof, gutters and fascia, panel-lift garage door, digital entry locks",
    ],
  },
  {
    heading: "Electrical & solar",
    items: [
      "LED downlights and double power points throughout",
      "TV and data points, smoke detectors, safety switch",
      "10kW solar PV system",
    ],
  },
  {
    heading: "Plumbing, hot water & climate",
    items: [
      "Stormwater/sewer connection, three-phase power",
      "Heat pump hot water system",
      "Reverse-cycle split system air conditioning to every bedroom and communal area",
    ],
  },
  {
    heading: "Kitchen",
    items: ["Oven, induction cooktop, rangehood and dishwasher", "Stone benchtops and modular cabinetry"],
  },
  {
    heading: "Bathrooms & laundry",
    items: ["Tiled showers, chrome tapware, toilet suites", "Laundry trough and tiling to all wet areas"],
  },
  {
    heading: "Internal finishes & flooring",
    items: [
      "Plastered walls and ceilings, three-coat paint finish throughout",
      "Built-in robes with sliding mirror doors, Holland blinds",
      "Timber-look flooring to bedrooms, tiles to common areas",
    ],
  },
  {
    heading: "Turnkey & landscaping",
    items: [
      "Boundary fencing, low-maintenance front and rear landscaping",
      "Letterbox, coloured concrete driveway and front path, NBN connection",
    ],
  },
];

export function BuildingInclusionsList() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>What&apos;s included</CardTitle>
        <p className="text-sm text-muted">
          Fully turnkey — site works, the full build, and landscaping are all included in every
          price above.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {INCLUSION_GROUPS.map((group) => (
          <div key={group.heading}>
            <p className="text-sm font-medium text-ink">{group.heading}</p>
            <ul className="mt-1 space-y-1">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-body">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="rounded-btn border border-line bg-offwhite p-3 text-sm text-muted">
          Not included: loose furniture — that&apos;s supplied separately through our furnishing
          providers once your build is complete.
        </p>
      </CardContent>
    </Card>
  );
}
