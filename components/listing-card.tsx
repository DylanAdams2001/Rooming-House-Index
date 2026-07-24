import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RoomListing } from "@/lib/mock-listings";

export function ListingCard({ listing }: { listing: RoomListing }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-xl text-ink">{listing.suburbName}</h3>
            <p className="text-sm text-muted">{listing.roomType} room</p>
          </div>
          <Badge variant="outline">{listing.availableFrom}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-6 pt-0">
        <div>
          <p className="font-display text-2xl text-ink">${listing.weeklyRate}/wk</p>
          <p className="mt-2 text-sm text-body">{listing.description}</p>
        </div>
        <Button className="w-full">Enquire</Button>
      </CardContent>
    </Card>
  );
}
