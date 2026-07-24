"use client";

import { suburbs } from "@/lib/mock-data";
import { SuburbCard } from "@/components/suburb-card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useSavedSuburbs } from "@/lib/use-saved-suburbs";
import Link from "next/link";

export function SavedSuburbs() {
  const { savedIds, loaded, removeSaved } = useSavedSuburbs();
  const saved = suburbs.filter((s) => savedIds.includes(s.id));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Saved Suburbs</h1>
      <p className="mt-2 text-body">Suburbs you&apos;ve bookmarked for further review.</p>

      {loaded && saved.length === 0 && (
        <div className="mt-10 rounded-card border border-dashed border-line bg-white p-12 text-center">
          <p className="text-body">You haven&apos;t saved any suburbs yet.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/suburbs">Browse Suburb Explorer</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {saved.map((suburb) => (
          <SuburbCard
            key={suburb.id}
            suburb={suburb}
            footerAction={
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeSaved(suburb.id)}
                aria-label="Remove from saved"
              >
                <X className="h-4 w-4" />
              </Button>
            }
          />
        ))}
      </div>
    </div>
  );
}
