"use client";

import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedListings } from "@/lib/use-saved-listings";

export function SaveListingButton({ listingId }: { listingId: string }) {
  const { isSaved, toggleSaved, loaded } = useSavedListings();

  if (!loaded) return null;

  const saved = isSaved(listingId);

  return (
    <Button variant={saved ? "default" : "outline"} className="w-full" onClick={() => toggleSaved(listingId)}>
      {saved ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
      {saved ? "Saved" : "Save listing"}
    </Button>
  );
}
