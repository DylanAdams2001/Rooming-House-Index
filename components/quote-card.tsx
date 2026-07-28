"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type QuoteCardData = {
  id: string;
  providerName: string;
  monthlyFeePct: number | null;
  flatFee: string | null;
  notes: string | null;
  documentUrl: string | null;
  accepted?: boolean;
};

export function QuoteCard({
  quote,
  requestId,
  // Whether any quote on this request has already been accepted — hides
  // the Accept button on every other (non-accepted) card once one is
  // chosen, since only one provider can be accepted per request.
  anyAccepted = false,
  // Optional extra content shown inside the popup, below the quote details
  // — e.g. the Building inclusions list, attached per-quote rather than
  // sitting separately on the page.
  inclusions,
}: {
  quote: QuoteCardData;
  requestId?: string;
  anyAccepted?: boolean;
  inclusions?: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const fee = quote.monthlyFeePct ? `${quote.monthlyFeePct}% of rent per year` : quote.flatFee ?? "Quote provided";

  function handleOpen() {
    setOpen(true);
    if (requestId) {
      supabase
        .from("service_quote_requests")
        .update({ quotes_viewed_at: new Date().toISOString() })
        .eq("id", requestId)
        .then(({ error }) => {
          // The dot itself is computed server-side off quotes_viewed_at, so the
          // parent route needs to re-fetch for it to actually disappear — without
          // this it stays lit until the next full page load.
          if (!error) router.refresh();
        });
    }
  }

  async function handleAccept() {
    if (!confirm(`Accept ${quote.providerName}'s quote? This closes the request to other providers.`)) return;
    setAccepting(true);
    const { error } = await supabase.rpc("accept_quote", { p_quote_id: quote.id });
    setAccepting(false);
    if (!error) router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex w-full flex-col gap-1 rounded-btn border p-4 text-left transition-colors hover:border-ink hover:bg-linen sm:flex-row sm:items-center sm:justify-between",
          quote.accepted ? "border-green-600 bg-green-50" : "border-line"
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-base text-ink">{quote.providerName}</p>
            {quote.accepted && (
              <Badge className="border-green-600 bg-green-600 text-white">Accepted</Badge>
            )}
          </div>
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
            className={cn(
              "w-full max-h-[85vh] overflow-y-auto rounded-card border border-line bg-white p-6",
              inclusions ? "max-w-lg" : "max-w-md"
            )}
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

            {inclusions && <div className="mt-5 border-t border-line pt-5">{inclusions}</div>}

            {requestId && (
              <>
                {quote.accepted ? (
                  <div className="mt-5 rounded-btn border border-green-600 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <p className="flex items-center gap-2 font-medium">
                      <Check className="h-4 w-4" />
                      You&apos;ve accepted this quote
                    </p>
                    <p className="mt-1 text-green-700/90">
                      The Rooming House Standard team will be in touch shortly to help finalise the details.
                    </p>
                  </div>
                ) : (
                  !anyAccepted && (
                    <Button className="mt-5 w-full" onClick={handleAccept} disabled={accepting}>
                      {accepting ? "Accepting…" : "Accept this quote"}
                    </Button>
                  )
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
