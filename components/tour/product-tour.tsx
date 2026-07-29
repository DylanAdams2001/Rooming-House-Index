"use client";

import { useEffect } from "react";
import { useHints } from "@/components/hints/hint-provider";

export type TourStep = {
  selector: string;
  title: string;
  description: string;
};

// Full replacement for the old per-tab Hint popups: one spotlight-and-tooltip
// walkthrough per portal that highlights each real sidebar item in turn,
// instead of a separate centered modal shown the first time you open each
// tab. Runs once per account (same user_seen_hints tracking the old Hints
// used, via useHints/tourKey) the first time the portal's sidebar mounts.
export function ProductTour({
  tourKey,
  intro,
  steps,
}: {
  tourKey: string;
  // Optional centered opening step (no highlighted element) before the tour
  // starts pointing at sidebar items.
  intro?: { title: string; description: string };
  steps: TourStep[];
}) {
  const { hasSeen, markSeen } = useHints();

  useEffect(() => {
    if (hasSeen(tourKey) || steps.length === 0) return;
    // The sidebar these steps target is hidden below the md breakpoint
    // (see DashboardSidebar/PartnersSidebar/AccountSidebar) — nothing to
    // highlight on a phone, so skip rather than run a broken-looking tour.
    if (typeof window === "undefined" || window.matchMedia("(max-width: 767px)").matches) return;

    let cancelled = false;

    import("driver.js").then(({ driver }) => {
      if (cancelled) return;

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
        onDestroyed: () => markSeen(tourKey),
        steps: driveSteps,
      });

      tour.drive();
    });

    return () => {
      cancelled = true;
    };
    // Runs once on mount only — hasSeen/markSeen are stable callbacks and
    // re-running this on every render would re-launch the tour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourKey]);

  return null;
}
