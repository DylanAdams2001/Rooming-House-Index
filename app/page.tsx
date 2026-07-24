import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BarChart3, Building2, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-offwhite">
          <div className="container-page flex flex-col items-center py-24 text-center md:py-32">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Trusted by rooming house investors across Victoria
            </p>
            <h1 className="max-w-3xl font-display text-4xl leading-tight text-ink md:text-6xl">
              Rooming House Intelligence. Built for Serious Investors.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-body md:text-lg">
              Suburb-level data on demand, registered supply, and rental rates across Victoria —
              so you build in the right place, every time.
            </p>
            <div className="mt-10">
              <Button asChild size="lg">
                <a href="#access">Request Early Access</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container-page py-24">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              Data that de-risks every acquisition
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body">
              Every metric sourced and modelled specifically for the rooming house
              asset class — not generic residential data.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Building2 className="h-6 w-6" />}
              title="Suburb Demand Data"
              description="Understand where renter demand for shared and rooming accommodation is strongest, suburb by suburb."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Average Room Rental Rates"
              description="Track weekly room rates over time to benchmark acquisitions and forecast gross yield with confidence."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Registered Supply Data"
              description="See exactly how many registered rooming houses operate in a suburb, sourced from the Consumer Affairs Victoria register, to avoid oversaturated markets before you buy."
            />
          </div>
        </section>

        {/* CTA / Early access */}
        <section id="access" className="border-t border-line bg-linen">
          <div className="container-page flex flex-col items-center py-20 text-center">
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              Request Early Access
            </h2>
            <p className="mt-4 max-w-lg text-body">
              Join the investors already on our waitlist. We&apos;re onboarding a limited
              number of accounts ahead of full launch.
            </p>
            <form className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <Input type="email" placeholder="you@example.com" className="bg-white" />
              <Button type="submit" className="shrink-0">
                Request Early Access
              </Button>
            </form>
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
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-linen text-ink">
        {icon}
      </div>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="mt-2 text-sm text-body">{description}</p>
    </div>
  );
}
