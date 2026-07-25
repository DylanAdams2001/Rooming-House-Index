import { cn } from "@/lib/utils";

// Muted, on-brand tones (no vivid colour) — a deterministic pick per user so the
// same person always gets the same colour rather than it changing on every render.
const TONES = ["#D9C8B4", "#C9D2C1", "#C7CEDB", "#E0C9C2", "#D6D0C4", "#C4CFC9"];

function toneFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

export function Avatar({
  seed,
  name,
  photoUrl,
  className,
}: {
  seed: string;
  name?: string | null;
  photoUrl?: string | null;
  className?: string;
}) {
  if (photoUrl) {
    return (
      <div className={cn("overflow-hidden rounded-full", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={name ?? "Profile"} className="h-full w-full object-cover" />
      </div>
    );
  }

  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={cn("flex items-center justify-center rounded-full font-display text-ink", className)}
      style={{ backgroundColor: toneFor(seed) }}
    >
      {initial}
    </div>
  );
}
