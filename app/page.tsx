import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BarChart3, Building2, Search, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-offwhite">
          <div className="container-page flex flex-col items-center py-24 text-center md:py-32">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Rooms across Victoria
            </p>
            <h1 className="max-w-3xl font-display text-4xl leading-tight text-ink md:text-6xl">
              Find a Room, Not Just a Listing.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-body md:text-lg">
              Browse real rooming house rooms with photos, pricing, and inspection times —
              enquire in a couple of clicks with one profile.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/listings">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Rooms
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Investor pitch (secondary) */}
        <section id="investors" className="border-t border-line bg-linen">
          <div className="container-page flex flex-col items-center py-20 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              For property investors
            </p>
            <h2 className="max-w-2xl font-display text-3xl text-ink md:text-4xl">
              Unlock suburb-level rooming house market data — on the same account
            </h2>
            <p className="mt-4 max-w-xl text-body">
              Sign up once, then add investor access from your account for $29/month: demand
              data, registered supply, and average room rates across Victoria.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
              <FeatureCard
                icon={<Building2 className="h-6 w-6" />}
                title="Suburb Demand Data"
                description="Understand where renter demand for shared and rooming accommodation is strongest, suburb by suburb."
              />
              <FeatureCard
                icon={<TrendingUp className="h-6 w-6" />}
                title="Average Room Rental Rates"
                description="Track weekly room rates to benchmark acquisitions and forecast gross yield with confidence."
              />
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6" />}
                title="Registered Supply Data"
                description="See exactly how many registered rooming houses operate in a suburb, sourced from the Consumer Affairs Victoria register."
              />
            </div>
            <Button asChild size="lg" className="mt-10">
              <Link href="/account/upgrade">Get Investor Access — $29/mo</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-card border border-line bg-white p-8">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink">
        {icon}
      </div>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="mt-2 text-sm text-body">{description}</p>
    </div>
  );
}
