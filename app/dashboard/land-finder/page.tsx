import Link from "next/link";
import { ExternalLink } from "lucide-react";

const PARCEL_SCOUT_URL = "https://parcel-scout.onrender.com/app.html";

export default function LandFinderPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Land Finder</h1>
          <p className="mt-2 text-body">
            Search for undervalued land and property, scored against comparable sales and
            planning overlays.
          </p>
        </div>
        <Link
          href={PARCEL_SCOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm text-ink underline underline-offset-4 hover:no-underline"
        >
          Open in new tab
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="min-h-[75vh] flex-1 overflow-hidden rounded-card border border-line">
        <iframe
          src={PARCEL_SCOUT_URL}
          title="Land Finder"
          className="h-full min-h-[75vh] w-full"
        />
      </div>
    </div>
  );
}
