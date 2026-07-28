"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Real back-navigation instead of a hardcoded `/listings?suburb=X` link —
// that always dropped the visitor into a suburb-filtered view, even if they'd
// come from the unfiltered "all listings" page (or a different suburb
// filter). router.back() restores whatever view they actually came from.
// Falls back to the unfiltered listings page when there's no in-app history
// to go back to (e.g. the listing was opened directly in a new tab).
export function ListingBackLink() {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/listings");
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-6 flex items-center gap-2 text-sm text-body transition-colors hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to listings
    </button>
  );
}
