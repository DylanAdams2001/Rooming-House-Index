"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { mockListings } from "@/lib/mock-listings";
import { ListingCard } from "@/components/listing-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const suburbOptions = [
  { id: "all", name: "All suburbs" },
  ...Array.from(new Map(mockListings.map((l) => [l.suburbId, l.suburbName])).entries()).map(
    ([id, name]) => ({ id, name })
  ),
];

function ListingsContent() {
  const searchParams = useSearchParams();
  const [suburbId, setSuburbId] = useState(searchParams.get("suburb") ?? "all");

  const results = useMemo(
    () => (suburbId === "all" ? mockListings : mockListings.filter((l) => l.suburbId === suburbId)),
    [suburbId]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-offwhite">
          <div className="container-page py-16 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Sample listings
            </p>
            <h1 className="font-display text-4xl text-ink md:text-5xl">Find Your Next Room</h1>
            <p className="mx-auto mt-4 max-w-xl text-body">
              Browse available rooms in registered rooming houses across Victoria — no account
              needed.
            </p>
          </div>
        </section>

        <div className="container-page py-12">
          <div className="max-w-xs">
            <Label className="mb-2 block text-xs uppercase tracking-wide text-muted">
              Suburb
            </Label>
            <Select value={suburbId} onValueChange={setSuburbId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {suburbOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="mt-6 text-sm text-muted">
            {results.length} room{results.length === 1 ? "" : "s"} available
          </p>

          {results.length === 0 ? (
            <div className="mt-6 rounded-card border border-dashed border-line bg-white p-12 text-center">
              <p className="text-body">No listings in this suburb right now.</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <ListingsContent />
    </Suspense>
  );
}
