"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHints } from "./hint-provider";

export type HintSlide = {
  title: string;
  // Path under /public, e.g. "/hints/quotes-1.png".
  image: string;
  caption: React.ReactNode;
};

// Multi-step version of Hint, for sections complex enough to need a real
// walkthrough with screenshots rather than a single paragraph — same
// once-per-account tracking (user_seen_hints), just with Back/Next between
// a handful of slides instead of one static popup.
export function HintSlides({ hintKey, slides }: { hintKey: string; slides: HintSlide[] }) {
  const { hasSeen, markSeen } = useHints();
  const [dismissed, setDismissed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [index, setIndex] = useState(0);

  if (hasSeen(hintKey) || dismissed || slides.length === 0) return null;

  function handleDismiss() {
    setClosing(true);
    setTimeout(() => {
      setDismissed(true);
      markSeen(hintKey);
    }, 150);
  }

  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[3000] flex items-center justify-center bg-ink/40 p-4 duration-150",
        closing ? "animate-out fade-out" : "animate-in fade-in"
      )}
      onClick={handleDismiss}
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-card border border-line bg-white p-6 duration-150",
          closing ? "animate-out fade-out zoom-out-95" : "animate-in fade-in zoom-in-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div key={index} className="animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="flex items-start justify-between gap-4">
            <p className="font-display text-xl text-ink">{slide.title}</p>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close"
              className="shrink-0 text-muted hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-btn border border-line bg-offwhite">
            <Image src={slide.image} alt={slide.title} fill className="object-cover" unoptimized />
          </div>

          <div className="mt-4 text-sm text-body">{slide.caption}</div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-200",
                  i === index ? "w-4 bg-ink" : "bg-line"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {index > 0 && (
              <Button variant="outline" size="icon" onClick={() => setIndex((i) => i - 1)} aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {isLast ? (
              <Button onClick={handleDismiss}>Got it</Button>
            ) : (
              <Button onClick={() => setIndex((i) => i + 1)}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
