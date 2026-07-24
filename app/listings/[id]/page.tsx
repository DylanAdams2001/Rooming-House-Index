import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getListingById, mockListings } from "@/lib/mock-listings";
import { getSuburbById } from "@/lib/mock-data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingPhoto } from "@/components/listing-photo";
import { EnquireButton } from "@/components/enquire-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return mockListings.map((l) => ({ id: l.id }));
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = getListingById(params.id);

  if (!listing) {
    notFound();
  }

  const suburb = getSuburbById(listing.suburbId);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-offwhite">
        <div className="container-page py-10">
          <Link
            href={`/listings?suburb=${listing.suburbId}`}
            className="mb-6 flex items-center gap-2 text-sm text-body hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {listing.suburbName} listings
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {listing.photos && listing.photos.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-card sm:grid-cols-3">
                  <div className="relative h-72 sm:col-span-2 sm:h-[420px]">
                    <Image
                      src={listing.photos[0]}
                      alt={`${listing.roomType} room in ${listing.suburbName}`}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  {listing.photos[1] && (
                    <div className="relative h-72 sm:h-[420px]">
                      <Image
                        src={listing.photos[1]}
                        alt={`Shared kitchen at this ${listing.suburbName} rooming house`}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs text-ink">
                        Shared kitchen
                      </span>
                    </div>
                  )}
                </div>
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
                      {listing.address ?? listing.suburbName}
                      {suburb ? ` · ${suburb.postcode}, ${suburb.state}` : ""}
                    </p>
                    <h1 className="mt-1 font-display text-3xl text-ink">
                      {listing.roomType} room in {listing.suburbName}
                    </h1>
                  </div>
                  <Badge variant="outline">{listing.availableFrom}</Badge>
                </div>

                <p className="mt-4 font-display text-2xl text-ink">${listing.weeklyRate}/wk</p>

                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h2 className="font-display text-lg text-ink">Description</h2>
                    <p className="mt-2 text-body">{listing.description}</p>
                  </CardContent>
                </Card>
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
                  {listing.address && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">Address</p>
                      <p className="text-ink">{listing.address}</p>
                    </div>
                  )}
                  <EnquireButton listingId={listing.id} />
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
