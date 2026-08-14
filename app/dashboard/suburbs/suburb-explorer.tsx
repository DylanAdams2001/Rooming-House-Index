"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { suburbs, type DemandLevel } from "@/lib/mock-data";
import type { FocusSuburbTrigger } from "@/components/map/suburb-map";
import { SuburbCard } from "@/components/suburb-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, LayoutGrid, MapIcon } from "lucide-react";
import { useSavedSuburbs } from "@/lib/use-saved-suburbs";
import { ProductTour } from "@/components/tour/product-tour";
import { cn } from "@/lib/utils";

const SuburbMap = dynamic(
  () => import("@/components/map/suburb-map").then((mod) => mod.SuburbMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[560px] items-center justify-center rounded-card border border-line bg-white text-sm text-muted">
        Loading map…
      </div>
    ),
  }
);

const DEMAND_OPTIONS: (DemandLevel | "All")[] = ["All", "High", "Medium", "Low"];

export function SuburbExplorer() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [state, setState] = useState("VIC");
  const [demand, setDemand] = useState<DemandLevel | "All">("All");
  const [rateRange, setRateRange] = useState<[number, number]>([150, 450]);
  const [view, setView] = useState<"grid" | "map">("map");
  const [focusSuburb, setFocusSuburb] = useState<FocusSuburbTrigger | null>(null);
  const { isSaved, toggleSaved, loaded } = useSavedSuburbs();

  const results = useMemo(() => {
    return suburbs.filter((s) => {
      const matchesQuery =
        query.trim() === "" ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.postcode.includes(query.trim());
      const matchesState = s.state === state;
      const matchesDemand = demand === "All" || s.demandLevel === demand;
      const matchesRate = s.avgRoomRate >= rateRange[0] && s.avgRoomRate <= rateRange[1];
      return matchesQuery && matchesState && matchesDemand && matchesRate;
    });
  }, [query, state, demand, rateRange]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return results.slice(0, 6);
  }, [query, results]);

  return (
    <div>
      <ProductTour
        tourKey="dashboard-suburbs-page"
        intro={{
          title: "Suburb Explorer",
          description: "Here's how to narrow down 211 suburbs to the ones actually worth a closer look.",
        }}
        steps={[
          {
            selector: '[data-tour="suburbs-search"]',
            title: "Search",
            description: "Jump straight to a suburb by name or postcode.",
          },
          {
            selector: '[data-tour="suburbs-demand"]',
            title: "Demand Level",
            description: "Filter to only High-demand suburbs to see where competition for rooms is strongest.",
          },
          {
            selector: '[data-tour="suburbs-rate"]',
            title: "Average Room Rate",
            description: "Drag either end to narrow results to your target weekly rate.",
          },
          {
            selector: '[data-tour="suburbs-view-toggle"]',
            title: "Grid or Map",
            description: "Switch between a card grid and an interactive map of every matching suburb.",
          },
        ]}
      />

      <h1 className="font-display text-3xl text-ink">Suburb Explorer</h1>
      <p className="mt-2 text-body">
        Search and filter suburbs by demand, rate, and location.
      </p>

      <div className="mt-8 rounded-card border border-line bg-white p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="relative md:col-span-2" data-tour="suburbs-search">
            <Label htmlFor="search" className="mb-2 block text-xs uppercase tracking-wide text-muted">
              Search
            </Label>
            <Input
              id="search"
              autoComplete="off"
              placeholder="Search suburb or postcode"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-btn border border-line bg-white shadow-lg">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={() => {
                      if (view === "map") {
                        setFocusSuburb({ id: s.id, nonce: Date.now() });
                        setShowSuggestions(false);
                      } else {
                        router.push(`/dashboard/suburbs/${s.id}`);
                      }
                    }}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm text-body hover:bg-linen hover:text-ink"
                  >
                    <span>{s.name}</span>
                    <span className="text-xs text-muted">{s.postcode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-xs uppercase tracking-wide text-muted">
              State
            </Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIC">Victoria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div data-tour="suburbs-demand">
            <Label className="mb-2 block text-xs uppercase tracking-wide text-muted">
              Demand Level
            </Label>
            <Select value={demand} onValueChange={(v) => setDemand(v as DemandLevel | "All")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEMAND_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === "All" ? "All levels" : d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6" data-tour="suburbs-rate">
          <Label className="mb-3 block text-xs uppercase tracking-wide text-muted">
            Average Room Rate: ${rateRange[0]} – ${rateRange[1]} / week
          </Label>
          <Slider
            min={150}
            max={450}
            step={5}
            value={rateRange}
            onValueChange={(v) => setRateRange(v as [number, number])}
            className="max-w-md"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {results.length} suburb{results.length === 1 ? "" : "s"} found
        </p>

        <div className="flex items-center rounded-btn border border-line bg-white p-1" data-tour="suburbs-view-toggle">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={cn(
              "flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors",
              view === "grid" ? "bg-ink text-white" : "text-body hover:text-ink"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={cn(
              "flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors",
              view === "map" ? "bg-ink text-white" : "text-body hover:text-ink"
            )}
          >
            <MapIcon className="h-4 w-4" />
            Map
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((suburb) => (
            <SuburbCard
              key={suburb.id}
              suburb={suburb}
              footerAction={
                loaded && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSaved(suburb.id)}
                    aria-label={isSaved(suburb.id) ? "Remove from saved" : "Save suburb"}
                  >
                    {isSaved(suburb.id) ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                )
              }
            />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <SuburbMap suburbs={results} focusSuburb={focusSuburb} />
        </div>
      )}
    </div>
  );
}
