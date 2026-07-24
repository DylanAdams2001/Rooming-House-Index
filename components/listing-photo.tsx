import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

// No real photos exist for these sample listings, so this renders an honest,
// on-brand placeholder (never a fake/stock photo standing in for a real property)
// — a deterministic muted tone per listing so a grid of cards still reads as
// visually distinct rather than one flat repeated block.
const tones = ["bg-linen", "bg-offwhite", "bg-line/40"];

function toneFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return tones[hash % tones.length];
}

export function ListingPhoto({ seed, className }: { seed: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        toneFor(seed),
        className
      )}
    >
      <Home className="h-8 w-8 text-muted" strokeWidth={1.5} />
      <span className="text-xs text-muted">Photo placeholder</span>
    </div>
  );
}
