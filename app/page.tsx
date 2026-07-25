import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingCard } from "@/components/listing-card";
import { getFeaturedListings } from "@/lib/mock-listings";
import { ArrowRight, Search, TrendingUp } from "lucide-react";

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
              Rooms across Victoria
            </p>
            <h1 className="max-w-3xl font-display text-4xl leading-tight text-ink md:text-6xl">
              Find a Room, Not Just a Listing.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-body md:text-lg">
              Browse real rooming house rooms with photos, pricing, and inspection times —
              enquire in a couple of clicks, no account needed to look around.
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

        {/* Investor pitch (secondary) */}
        <section className="border-t border-line bg-linen">
          <div className="container-page flex flex-col items-center py-16 text-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              For property investors
            </p>
            <h2 className="max-w-xl font-display text-2xl text-ink md:text-3xl">
              Unlock suburb-level market data — on the same account
            </h2>
            <p className="mt-4 max-w-lg text-body">
              Demand data, registered supply, average room rates, and direct access to service
              providers — free during early access.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/investors">Become an Investor</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
