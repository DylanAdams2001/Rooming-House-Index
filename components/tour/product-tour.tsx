"use client";

import { useEffect } from "react";
import { useHints } from "@/components/hints/hint-provider";

export type TourStep = {
  selector: string;
  title: string;
  description: string;
};

// Module-level queue so two ProductTour instances that both want to fire at
// once (e.g. the sidebar tour + a page-specific tour, on someone's very
// first authenticated page load if it happens to land on a sub-page rather
// than the portal home) run one after another instead of stacking two
// driver.js overlays on top of each other.
let tourQueue: Promise<void> = Promise.resolve();

// Full replacement for the old per-tab Hint popups: a spotlight-and-tooltip
// walkthrough per page/portal that highlights real elements in turn, instead
// of a separate centered modal. Runs once per account (same user_seen_hints
// tracking the old Hints used, via useHints/tourKey) the first time this
// component mounts.
export function ProductTour({
  tourKey,
  intro,
  steps = [],
}: {
  tourKey: string;
  // Optional centered opening step (no highlighted element) before the tour
  // starts pointing at real elements. Also valid on its own with no steps —
  // e.g. a single info popup for a page with nothing stable to highlight.
  intro?: { title: string; description: string };
  steps?: TourStep[];
}) {
  const { hasSeen, markSeen } = useHints();

  useEffect(() => {
    if (hasSeen(tourKey) || (steps.length === 0 && !intro)) return;
    // Real steps target elements that are hidden below the md breakpoint on
    // most of these pages (sidebars in particular) — nothing to highlight on
    // a phone, so skip rather than run a broken-looking tour. An intro-only
    // popup has nothing to highlight, so it's fine on mobile.
    const isMobile = typeof window === "undefined" || window.matchMedia("(max-width: 767px)").matches;
    if (steps.length > 0 && isMobile) return;

    let cancelled = false;

    tourQueue = tourQueue.then(
      () =>
        new Promise<void>((resolveTurn) => {
          if (cancelled) {
            resolveTurn();
            return;
          }
          import("driver.js").then(({ driver }) => {
            if (cancelled) {
              resolveTurn();
              return;
            }

            const driveSteps = [
              ...(intro ? [{ popover: { title: intro.title, description: intro.description } }] : []),
              ...steps.map((step) => ({
                element: step.selector,
                popover: { title: step.title, description: step.description },
              })),
            ];

            const tour = driver({
              showProgress: true,
              allowClose: true,
              overlayColor: "#1a1a1a",
              overlayOpacity: 0.55,
              stagePadding: 6,
              stageRadius: 8,
              popoverClass: "rhi-tour-popover",
              progressText: "{{current}} of {{total}}",
              nextBtnText: "Next",
              prevBtnText: "Back",
              doneBtnText: "Got it",
              overlayClickBehavior: "close",
              onDestroyed: () => {
                markSeen(tourKey);
                resolveTurn();
              },
              steps: driveSteps,
            });

            tour.drive();
          });
        })
    );

    return () => {
      cancelled = true;
    };
    // Runs once on mount only — hasSeen/markSeen are stable callbacks and
    // re-running this on every render would re-launch the tour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourKey]);

  return null;
}
