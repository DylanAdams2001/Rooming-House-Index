"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, FileText, X } from "lucide-react";
import { toast } from "sonner";
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
  // Who the reassurance note says will follow up — "our team" (the
  // default) everywhere except where nextStepsMessage below overrides the
  // whole sentence instead.
  nextStepsContact = "our team",
  // Full override for the pre-accept reassurance text, for categories
  // (e.g. Building) where the templated "so {nextStepsContact} can reach
  // out..." sentence doesn't fit and a fixed sentence reads better.
  nextStepsMessage,
  // Override for the line shown below the price in the popup — for
  // Building, every tier should read identically ("this builder's price for
  // your project") rather than each tier's own distinct blurb, which read
  // like 3 different product tiers rather than 3 prices for the same job.
  // Falls back to quote.notes everywhere else.
  priceCaption,
}: {
  quote: QuoteCardData;
  requestId?: string;
  anyAccepted?: boolean;
  inclusions?: React.ReactNode;
  nextStepsContact?: string;
  nextStepsMessage?: string;
  priceCaption?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
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

  function closeModal() {
    setClosingModal(true);
    setTimeout(() => {
      setOpen(false);
      setClosingModal(false);
    }, 150);
  }

  async function handleAccept() {
    if (!confirm(`Accept ${quote.providerName}'s quote? This closes the request to other providers.`)) return;
    setAccepting(true);
    const { error } = await supabase.rpc("accept_quote", { p_quote_id: quote.id });
    setAccepting(false);
    if (error) {
      toast.error("Couldn't accept this quote", { description: error.message });
      return;
    }
    toast.success(`Accepted ${quote.providerName}'s quote`);
    router.refresh();
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
            {quote.documentUrl && (
              <span className="flex items-center gap-1 rounded-full bg-linen px-2 py-0.5 text-[11px] font-medium text-ink">
                <FileText className="h-3 w-3" />
                PDF attached
              </span>
            )}
          </div>
          {quote.notes && <p className="mt-0.5 line-clamp-1 text-sm text-body">{quote.notes}</p>}
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-ink">
          View quote
          <ChevronRight className="h-4 w-4" />
        </span>
      </button>

      {(open || closingModal) && (
        <div
          className={cn(
            "fixed inset-0 z-[2000] flex items-center justify-center bg-ink/40 p-4 duration-150",
            closingModal ? "animate-out fade-out" : "animate-in fade-in"
          )}
          onClick={closeModal}
        >
          <div
            className={cn(
              "w-full max-h-[85vh] overflow-y-auto rounded-card border border-line bg-white p-6 duration-150",
              closingModal ? "animate-out fade-out zoom-out-95" : "animate-in fade-in zoom-in-95",
              inclusions ? "max-w-lg" : "max-w-md"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-display text-xl text-ink">{quote.providerName}</p>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 font-display text-2xl text-ink">{fee}</p>

            {(priceCaption ?? quote.notes) && (
              <p className="mt-4 text-sm text-body">{priceCaption ?? quote.notes}</p>
            )}

            {quote.documentUrl && (
              <a
                href={quote.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center gap-3 rounded-btn border-2 border-ink bg-linen px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
              >
                <FileText className="h-5 w-5 shrink-0" />
                Download the full quote (PDF)
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
                    <div className="mt-5 space-y-2">
                      <p className="rounded-btn border border-line bg-offwhite p-3 text-xs text-muted">
                        {nextStepsMessage ?? (
                          <>
                            No commitment yet — accepting just lets us know this is the one
                            you&apos;d like to go with, so {nextStepsContact} can reach out and walk
                            through next steps together.
                          </>
                        )}
                      </p>
                      <Button className="w-full" onClick={handleAccept} disabled={accepting}>
                        {accepting ? "Accepting…" : "Accept this quote"}
                      </Button>
                    </div>
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
