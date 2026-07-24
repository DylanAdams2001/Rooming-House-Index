"use client";

import { useMemo, useState } from "react";
import { suburbs, dashboardStats, type Suburb } from "@/lib/mock-data";
import { DemandBadge } from "@/components/demand-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";

const demandRank: Record<Suburb["demandLevel"], number> = { Low: 0, Medium: 1, High: 2 };

const SORT_OPTIONS = {
  avgRoomRate: { label: "Avg. Room Rate", get: (s: Suburb) => s.avgRoomRate },
  numRoomingHouses: { label: "Rooming Houses", get: (s: Suburb) => s.numRoomingHouses },
  name: { label: "Suburb Name", get: (s: Suburb) => s.name.toLowerCase() },
  demandLevel: { label: "Demand Level", get: (s: Suburb) => demandRank[s.demandLevel] },
} as const;

type SortKey = keyof typeof SORT_OPTIONS;

export default function MarketOverviewPage() {
  const [sortKey, setSortKey] = useState<SortKey>("avgRoomRate");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const { get } = SORT_OPTIONS[sortKey];
    return [...suburbs].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return direction === "asc" ? cmp : -cmp;
    });
  }, [sortKey, direction]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Market Overview</h1>
      <p className="mt-2 text-body">
        A snapshot of the Victorian rooming house market across all tracked suburbs.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted">Suburbs Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl text-ink">
              {dashboardStats.totalSuburbsTracked}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted">Average Gross Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl text-ink">{dashboardStats.avgGrossYield}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted">Data Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl text-ink">{dashboardStats.dataUpdated}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Suburbs by {SORT_OPTIONS[sortKey].label}</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_OPTIONS).map(([key, opt]) => (
                  <SelectItem key={key} value={key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              aria-label={direction === "asc" ? "Sort ascending" : "Sort descending"}
              onClick={() => setDirection((d) => (d === "asc" ? "desc" : "asc"))}
            >
              {direction === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <th className="px-6 py-3 font-medium">Suburb</th>
                  <th className="px-6 py-3 font-medium">Council</th>
                  <th className="px-6 py-3 font-medium">Demand</th>
                  <th className="px-6 py-3 font-medium">Avg. Rate</th>
                  <th className="px-6 py-3 font-medium">Rooming Houses</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="px-6 py-4 font-display text-base text-ink">
                      {s.name} <span className="text-muted">{s.postcode}</span>
                    </td>
                    <td className="px-6 py-4 text-body">{s.council}</td>
                    <td className="px-6 py-4">
                      <DemandBadge level={s.demandLevel} />
                    </td>
                    <td className="px-6 py-4 text-body">
                      ${s.avgRoomRate}/wk
                      {!s.avgRoomRateVerified && (
                        <span className="ml-1 text-xs text-muted">est.</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-body">{s.numRoomingHouses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
