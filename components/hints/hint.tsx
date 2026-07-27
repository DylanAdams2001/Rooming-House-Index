"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHints } from "./hint-provider";

// Drop one of these at the top of any page — shows a centered, dismissible
// modal exactly once per account (tracked in user_seen_hints), the first
// time that page is visited. Renders nothing at all once seen.
export function Hint({
  hintKey,
  title,
  children,
}: {
  hintKey: string;
  title: string;
  children: React.ReactNode;
}) {
  const { hasSeen, markSeen } = useHints();
  const [dismissed, setDismissed] = useState(false);

  if (hasSeen(hintKey) || dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    markSeen(hintKey);
  }

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-ink/40 p-4"
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-md rounded-card border border-line bg-white p-6"
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

        <div className="mt-3 space-y-2 text-sm text-body">{children}</div>

        <Button className="mt-6 w-full" onClick={handleDismiss}>
          Got it
        </Button>
      </div>
    </div>
  );
}
