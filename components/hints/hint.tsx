"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHints } from "./hint-provider";

// Drop one of these at the top of any page — shows a centered, dismissible
// modal exactly once per account (tracked in user_seen_hints), the first
// time that page is visited. Renders nothing at all once seen.
export function Hint({
  hintKey,
  title,
  image,
  children,
}: {
  hintKey: string;
  title: string;
  // Path under /public, e.g. "/hints/dashboard-suburbs.jpg" — a real
  // screenshot of the page this hint is attached to, shown above the text.
  image?: string;
  children: React.ReactNode;
}) {
  const { hasSeen, markSeen } = useHints();
  const [dismissed, setDismissed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (hasSeen(hintKey) || dismissed) return null;

  function handleDismiss() {
    setClosing(true);
    setTimeout(() => {
      setDismissed(true);
      markSeen(hintKey);
    }, 150);
  }

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
          "w-full rounded-card border border-line bg-white p-6 duration-150",
          closing ? "animate-out fade-out zoom-out-95" : "animate-in fade-in zoom-in-95",
          image ? "max-w-lg" : "max-w-md"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="font-display text-xl text-ink">{title}</p>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close"
            className="shrink-0 text-muted hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {image && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="group relative mt-4 block aspect-[16/10] w-full overflow-hidden rounded-btn border border-line bg-offwhite"
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-200 group-hover:bg-ink/20 group-hover:opacity-100">
              <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-ink shadow-sm">
                <Maximize2 className="h-3.5 w-3.5" />
                Click to enlarge
              </span>
            </span>
          </button>
        )}

        <div className="mt-3 space-y-2 text-sm text-body">{children}</div>

        <Button className="mt-6 w-full" onClick={handleDismiss}>
          Got it
        </Button>
      </div>

      {image && expanded && (
        <div
          className="fixed inset-0 z-[3100] flex items-center justify-center bg-ink/80 p-6 animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(false);
          }}
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Close"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[85vh] w-full max-w-4xl animate-in zoom-in-95 duration-150">
            <Image src={image} alt={title} fill className="object-contain" unoptimized />
          </div>
        </div>
      )}
    </div>
  );
}
