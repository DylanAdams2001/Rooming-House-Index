"use client";

import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedSuburbs } from "@/lib/use-saved-suburbs";

export function SaveSuburbButton({ suburbId }: { suburbId: string }) {
  const { isSaved, toggleSaved, loaded } = useSavedSuburbs();

  if (!loaded) return null;

  const saved = isSaved(suburbId);

  return (
    <Button variant={saved ? "default" : "outline"} onClick={() => toggleSaved(suburbId)}>
      {saved ? (
        <BookmarkCheck className="mr-2 h-4 w-4" />
      ) : (
        <Bookmark className="mr-2 h-4 w-4" />
      )}
      {saved ? "Saved" : "Save suburb"}
    </Button>
  );
}
