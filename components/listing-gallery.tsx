"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = ["", "Shared kitchen"];

export function ListingGallery({
  photos,
  altBase,
}: {
  photos: string[];
  altBase: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [closingGallery, setClosingGallery] = useState(false);

  function closeGallery() {
    setClosingGallery(true);
    setTimeout(() => {
      setOpenIndex(null);
      setClosingGallery(false);
    }, 150);
  }

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft")
        setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, photos.length]);

  return (
    <>
      <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-card sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group relative h-72 cursor-zoom-in sm:col-span-2 sm:h-[420px]"
        >
          <Image
            src={photos[0]}
            alt={`${altBase} — room`}
            fill
            className="object-cover transition-opacity group-hover:opacity-90"
            priority
          />
        </button>
        {photos[1] && (
          <button
            type="button"
            onClick={() => setOpenIndex(1)}
            className="group relative h-72 cursor-zoom-in sm:h-[420px]"
          >
            <Image
              src={photos[1]}
              alt={`${altBase} — ${LABELS[1]}`}
              fill
              className="object-cover transition-opacity group-hover:opacity-90"
            />
            <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs text-ink">
              {LABELS[1]}
            </span>
          </button>
        )}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
                }}
                aria-label="Previous photo"
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
                }}
                aria-label="Next photo"
                className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[openIndex]}
              alt={`${altBase} — enlarged photo ${openIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {LABELS[openIndex] && (
            <span className="absolute bottom-6 rounded-full bg-white/90 px-3 py-1 text-sm text-ink">
              {LABELS[openIndex]}
            </span>
          )}
        </div>
      )}
    </>
  );
}
