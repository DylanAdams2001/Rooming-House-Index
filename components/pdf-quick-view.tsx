"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";

export function PdfQuickView({ label, fileUrl }: { label: string; fileUrl: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-btn border border-line bg-white px-4 py-3 text-left text-sm text-ink transition-colors hover:border-ink hover:bg-linen"
      >
        <FileText className="h-4 w-4 shrink-0 text-muted" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="font-display text-base text-ink">{label}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted transition-colors hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe src={fileUrl} title={label} className="flex-1" />
          </div>
        </div>
      )}
    </>
  );
}
