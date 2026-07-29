import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingPhoto } from "@/components/listing-photo";
import { CalendarClock } from "lucide-react";
import { getListingTitle, type RoomListing } from "@/lib/mock-listings";

export function ListingCard({ listing }: { listing: RoomListing }) {
  return (
    // The whole card is the link target (not just the CTA at the bottom), so
    // the "See Listing" pill below is a plain span, not a nested <Button> —
    // an interactive element inside this <a> would be invalid HTML and
    // would fight the card's own click target for hover/focus state.
    <Link href={`/listings/${listing.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        {listing.photos?.[0] ? (
          <div className="relative h-40 w-full overflow-hidden">
            <Image
              src={listing.photos[0]}
              alt={`${listing.roomType} room in ${listing.suburbName}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="h-40 w-full overflow-hidden">
            <ListingPhoto
              seed={listing.id}
              className="h-40 w-full transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-xl text-ink transition-colors group-hover:text-body">
                {getListingTitle(listing)}
              </h3>
              <p className="text-sm text-muted">{listing.roomType} room · {listing.suburbName}</p>
            </div>
            <Badge variant="outline">{listing.availableFrom}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-6 pt-0">
          <div>
            <p className="font-display text-2xl text-ink">${listing.weeklyRate}/wk</p>
            <p className="mt-2 line-clamp-3 text-sm text-body">{listing.description}</p>
            {listing.inspectionTime && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                <CalendarClock className="h-3.5 w-3.5" />
                Inspection: {listing.inspectionTime}
              </p>
            )}
          </div>
          <span className="inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-btn bg-ink px-6 py-2 text-sm font-medium tracking-wide text-white transition-colors group-hover:bg-ink/90">
            See Listing
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
