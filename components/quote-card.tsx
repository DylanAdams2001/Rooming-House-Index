"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type QuoteCardData = {
  id: string;
  providerName: string;
  monthlyFeePct: number | null;
  flatFee: string | null;
  notes: string | null;
  documentUrl: string | null;
};

export function QuoteCard({ quote, requestId }: { quote: QuoteCardData; requestId?: string }) {
  const [open, setOpen] = useState(false);
  const fee = quote.monthlyFeePct ? `${quote.monthlyFeePct}% of rent` : quote.flatFee ?? "Quote provided";

  function handleOpen() {
    setOpen(true);
    if (requestId) {
      const supabase = createClient();
      supabase
        .from("service_quote_requests")
        .update({ quotes_viewed_at: new Date().toISOString() })
        .eq("id", requestId)
        .then(() => {});
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full flex-col gap-1 rounded-btn border border-line p-4 text-left transition-colors hover:border-ink hover:bg-linen sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="font-display text-base text-ink">{quote.providerName}</p>
          {quote.notes && <p className="mt-0.5 line-clamp-1 text-sm text-body">{quote.notes}</p>}
        </div>
        <p className="font-display text-lg text-ink">{fee}</p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-card border border-line bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-display text-xl text-ink">{quote.providerName}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 font-display text-2xl text-ink">{fee}</p>

            {quote.notes && <p className="mt-4 text-sm text-body">{quote.notes}</p>}

            {quote.documentUrl && (
              <a
                href={quote.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center gap-2 rounded-btn border border-line px-4 py-2.5 text-sm text-ink transition-colors hover:bg-linen"
              >
                <FileText className="h-4 w-4" />
                View quote document
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
