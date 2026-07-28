import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingTitle } from "@/lib/mock-listings";
import { getApprovedListingById } from "@/lib/listings";
import { getSuburbById } from "@/lib/mock-data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingPhoto } from "@/components/listing-photo";
import { ListingGallery } from "@/components/listing-gallery";
import { ListingBackLink } from "@/components/listing-back-link";
import { ListingMapDynamic as ListingMap } from "@/components/map/listing-map-dynamic";
import { EnquireButton } from "@/components/enquire-button";
import { SaveListingButton } from "@/components/save-listing-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

// A live, admin-moderated table can't be enumerated at build time — dynamic
// rendering instead of generateStaticParams/ISR keeps a newly-approved
// listing visible immediately, with no staleness window to reason about.
export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getApprovedListingById(params.id);

  if (!listing) {
    notFound();
  }

  const suburb = getSuburbById(listing.suburbId);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-offwhite">
        <div className="container-page py-10">
          <ListingBackLink />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {listing.photos && listing.photos.length > 0 ? (
                <ListingGallery photos={listing.photos} altBase={getListingTitle(listing)} />
              ) : (
                <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-card sm:grid-cols-4">
                  <ListingPhoto seed={listing.id} className="col-span-2 row-span-2 h-64 sm:h-full" />
                  <ListingPhoto seed={listing.id + "2"} className="h-32" />
                  <ListingPhoto seed={listing.id + "3"} className="h-32" />
                  <ListingPhoto seed={listing.id + "4"} className="hidden h-32 sm:flex" />
                  <ListingPhoto seed={listing.id + "5"} className="hidden h-32 sm:flex" />
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted">
                      {listing.roomType} room · {listing.suburbName}
                      {suburb ? ` ${suburb.postcode}, ${suburb.state}` : ""}
                    </p>
                    <h1 className="mt-1 font-display text-3xl text-ink">{getListingTitle(listing)}</h1>
                  </div>
                  <Badge variant="outline">{listing.availableFrom}</Badge>
                </div>

                <p className="mt-4 font-display text-2xl text-ink">${listing.weeklyRate}/wk</p>

                {listing.inspectionTime && (
                  <div className="mt-4 flex items-center gap-2 rounded-card border border-line bg-white px-4 py-3 text-sm text-ink">
                    <CalendarClock className="h-4 w-4 text-muted" />
                    <span>
                      <span className="text-muted">Inspection:</span> {listing.inspectionTime}
                    </span>
                  </div>
                )}

                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h2 className="font-display text-lg text-ink">Description</h2>
                    <p className="mt-2 text-body">{listing.description}</p>
                  </CardContent>
                </Card>

                {(listing.lat != null && listing.lng != null ? true : !!suburb) && (
                  <div className="mt-6">
                    <h2 className="mb-3 font-display text-lg text-ink">Location</h2>
                    <ListingMap
                      lat={listing.lat ?? suburb!.lat}
                      lng={listing.lng ?? suburb!.lng}
                      title={getListingTitle(listing)}
                      suburbName={listing.suburbName}
                      approximate={!(listing.lat != null && listing.lng != null)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Card>
                <CardContent className="space-y-4 p-6">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Weekly rate</p>
                    <p className="font-display text-2xl text-ink">${listing.weeklyRate}/wk</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Room type</p>
                    <p className="text-ink">{listing.roomType}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Available</p>
                    <p className="text-ink">{listing.availableFrom}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Suburb</p>
                    <p className="text-ink">{listing.suburbName}</p>
                  </div>
                  {listing.inspectionTime && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">Inspection</p>
                      <p className="text-ink">{listing.inspectionTime}</p>
                    </div>
                  )}
                  <EnquireButton
                    listingId={listing.id}
                    listingTitle={getListingTitle(listing)}
                    inspectionTime={listing.inspectionTime}
                  />
                  <SaveListingButton listingId={listing.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
