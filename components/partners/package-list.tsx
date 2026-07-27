"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { PackageForm, type ExistingPackage } from "./package-form";
import { PackageDeleteButton } from "./package-delete-button";

export function PackageList({ providerId, packages }: { providerId: string; packages: ExistingPackage[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (packages.length === 0) {
    return <p className="text-sm text-muted">No packages yet — add your first one below.</p>;
  }

  return (
    <div className="space-y-3">
      {packages.map((pkg) =>
        editingId === pkg.id ? (
          <PackageForm key={pkg.id} providerId={providerId} existing={pkg} onDone={() => setEditingId(null)} />
        ) : (
          <div
            key={pkg.id}
            className="flex items-center justify-between gap-4 rounded-card border border-line bg-white p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-display text-base text-ink">{pkg.label}</p>
                <span className="text-sm text-muted">{pkg.price}</span>
              </div>
              {pkg.description && <p className="mt-1 text-sm text-body">{pkg.description}</p>}
              {pkg.documentUrl && (
                <a
                  href={pkg.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-ink underline underline-offset-4"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View brochure
                </a>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingId(pkg.id)}
                className="text-sm text-ink underline underline-offset-4"
              >
                Edit
              </button>
              <PackageDeleteButton packageId={pkg.id} />
            </div>
          </div>
        )
      )}
    </div>
  );
}
