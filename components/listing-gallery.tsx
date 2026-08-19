"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Minimum horizontal drag distance (px) before a touch gesture counts as a
// swipe rather than an incidental tap/scroll wobble.
const SWIPE_THRESHOLD = 50;

export function ListingGallery({
  photos,
  altBase,
}: {
  photos: string[];
  altBase: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [closingGallery, setClosingGallery] = useState(false);
  const touchStartX = useRef<number | null>(null);

  function closeGallery() {
    setClosingGallery(true);
    setTimeout(() => {
      setOpenIndex(null);
      setClosingGallery(false);
    }, 150);
  }

  function showNext() {
    setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
  }

  function showPrev() {
    setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) showNext();
    else showPrev();
  }

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, photos.length]);

  // Mimics a real-estate-style preview: one large hero plus up to 4 smaller
  // thumbnails, with a "+N photos" overlay on the last one if there are more
  // than that — all without leaving the page (full gallery opens on click).
  const extraPhotos = photos.slice(1, 5);
  const remainingCount = photos.length - 5;

  return (
    <>
      <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-card sm:grid-cols-3 sm:h-[420px]">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group relative h-72 cursor-zoom-in sm:col-span-2 sm:h-full"
        >
          <Image
            src={photos[0]}
            alt={`${altBase} — room`}
            fill
            className="object-cover transition-opacity group-hover:opacity-90"
            priority
          />
        </button>
        {extraPhotos.length > 0 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:h-full">
            {extraPhotos.map((url, i) => {
              const realIndex = i + 1;
              const showMoreOverlay = i === extraPhotos.length - 1 && remainingCount > 0;
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => setOpenIndex(realIndex)}
                  className="group relative h-36 cursor-zoom-in sm:h-full"
                >
                  <Image
                    src={url}
                    alt={`${altBase} — photo ${realIndex + 1}`}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-90"
                  />
                  {showMoreOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
                      <span className="font-display text-lg text-white">
                        +{remainingCount} photo{remainingCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {(openIndex !== null || closingGallery) && (
        <div
          className={cn(
            "fixed inset-0 z-[2000] flex items-center justify-center bg-ink/90 p-4 duration-150",
            closingGallery ? "animate-out fade-out" : "animate-in fade-in"
          )}
          onClick={closeGallery}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            onClick={closeGallery}
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
                  showPrev();
                }}
                aria-label="Previous photo"
                className="absolute left-4 hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Next photo"
                className="absolute right-4 hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {openIndex !== null && (
              <Image
                src={photos[openIndex]}
                alt={`${altBase} — enlarged photo ${openIndex + 1}`}
                fill
                className="object-contain"
              />
            )}
          </div>

          {photos.length > 1 && (
            <div className="absolute bottom-6 flex gap-1.5 sm:hidden">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={cn("h-1.5 w-1.5 rounded-full", i === openIndex ? "bg-white" : "bg-white/40")}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
