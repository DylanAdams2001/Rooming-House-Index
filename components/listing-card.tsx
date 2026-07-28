import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingPhoto } from "@/components/listing-photo";
import { CalendarClock } from "lucide-react";
import { getListingTitle, type RoomListing } from "@/lib/mock-listings";

export function ListingCard({ listing }: { listing: RoomListing }) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
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
        <Button asChild className="w-full">
          <Link href={`/listings/${listing.id}`}>See Listing</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
