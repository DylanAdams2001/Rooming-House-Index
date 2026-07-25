import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingCard } from "@/components/listing-card";
import { getFeaturedListings } from "@/lib/mock-listings";
import { ArrowRight, CalendarClock, MessageCircle, Search } from "lucide-react";

export default function LandingPage() {
  const featuredListings = getFeaturedListings(6);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-offwhite">
          <div className="container-page flex flex-col items-center py-20 text-center md:py-28">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Self-contained studios across Victoria
            </p>
            <h1 className="max-w-3xl font-display text-4xl leading-tight text-ink md:text-6xl">
              Find a Room, Not Just a Listing.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-body md:text-lg">
              Browse self-contained studios and rooms with photos, pricing, and inspection
              times — enquire in a couple of clicks, no account needed to look around.
            </p>
            <div className="mt-10">
              <Button asChild size="lg">
                <Link href="/listings">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Rooms
                </Link>
              </Button>
            </div>
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
        <section className="container-page py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-ink md:text-3xl">Featured Rooms</h2>
              <p className="mt-1 text-sm text-body">A few of the rooms available right now.</p>
            </div>
            <Link
              href="/listings"
              className="flex items-center gap-1 text-sm font-medium text-ink hover:underline"
            >
              See all listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
