import Link from "next/link";
import { FunnelHeader } from "@/components/funnel-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { getFeaturedListings, mockListings } from "@/lib/mock-listings";
import { Search, MessageCircle, CalendarClock } from "lucide-react";

export default function FindARoomPage() {
  const featuredListings = getFeaturedListings(3);

  return (
    <div className="flex min-h-screen flex-col">
      <FunnelHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-offwhite">
          <div className="container-page flex flex-col items-center py-20 text-center md:py-28">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Rooms across Victoria
            </p>
            <h1 className="max-w-2xl font-display text-4xl leading-tight text-ink md:text-5xl">
              Find a Room, Not Just a Listing.
            </h1>
            <p className="mt-6 max-w-xl text-base text-body md:text-lg">
              Real photos, real pricing, real inspection times. Browse {mockListings.length} rooms
              right now — no account needed to look around.
            </p>
            <Button asChild size="lg" className="mt-10">
              <Link href="/listings">
                <Search className="mr-2 h-4 w-4" />
                Browse Rooms
              </Link>
            </Button>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-line bg-white py-14">
          <div className="container-page grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-linen text-ink">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg text-ink">Browse freely</h3>
              <p className="mt-2 text-sm text-body">
                See photos, pricing, and inspection times before creating an account.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-linen text-ink">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg text-ink">Message the property team</h3>
              <p className="mt-2 text-sm text-body">
                Enquire directly and confirm inspection times, all in one thread.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-linen text-ink">
                <CalendarClock className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg text-ink">One application, every room</h3>
              <p className="mt-2 text-sm text-body">
                Fill in your details once — reuse the same application for every room you enquire on.
              </p>
            </div>
          </div>
        </section>

        {/* Featured listings */}
        <section className="container-page py-20">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl text-ink md:text-4xl">Available right now</h2>
            <p className="mt-2 text-body">A few of the rooms you can enquire on today.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/listings">See all {mockListings.length} rooms</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
