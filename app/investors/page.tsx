import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InvestorCtaButton } from "@/components/investor-cta-button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Building2,
  Check,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Suburb Demand Data",
    description:
      "Understand where renter demand for shared and rooming accommodation is strongest, suburb by suburb.",
  },
  {
    icon: Building2,
    title: "Registered Supply Data",
    description:
      "See exactly how many registered rooming houses operate in a suburb, sourced from the Consumer Affairs Victoria register, so you avoid oversaturated markets before you buy.",
  },
  {
    icon: BarChart3,
    title: "Average Room Rental Rates",
    description:
      "Track weekly room rates to benchmark acquisitions and forecast gross yield with confidence.",
  },
  {
    icon: MessageCircle,
    title: "Direct Access to Services",
    description:
      "Message insurance, conveyancing, inspection, and maintenance providers straight from your dashboard — no cold calling around.",
  },
  {
    icon: ShieldCheck,
    title: "One Login, No Extra Setup",
    description:
      "Investor access sits on top of the account you already use to browse listings — nothing new to create or remember.",
  },
];

export default function InvestorsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-offwhite">
          <div className="container-page flex flex-col items-center py-20 text-center md:py-28">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              For property investors
            </p>
            <h1 className="max-w-2xl font-display text-4xl leading-tight text-ink md:text-5xl">
              Rooming House Intelligence. Built for Serious Investors.
            </h1>
            <p className="mt-6 max-w-xl text-base text-body md:text-lg">
              Suburb-level data on demand, registered supply, and rental rates across Victoria —
              plus a direct line to the service providers you need to run a compliant property.
            </p>
            <InvestorCtaButton className="mt-10">Become an Investor — Free</InvestorCtaButton>
          </div>
        </section>

        <section className="container-page py-20">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              Everything you need before you buy
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body">
              Every metric sourced and modelled specifically for the rooming house asset class —
              not generic residential data.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 rounded-card border border-line bg-white p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linen text-ink">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink">{title}</h3>
                  <p className="mt-1 text-sm text-body">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-line bg-linen">
          <div className="container-page flex flex-col items-center py-20 text-center">
            <h2 className="font-display text-3xl text-ink md:text-4xl">Free during early access</h2>
            <Card className="mt-8 w-full max-w-sm text-left">
              <CardContent className="p-6">
                <p className="font-display text-2xl text-ink">$0</p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Suburb demand & supply data",
                    "Average room rental rates",
                    "Saved suburbs",
                    "Provider marketplace + messaging",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-body">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                      {item}
                    </li>
                  ))}
                </ul>
                <InvestorCtaButton className="mt-8 w-full">Become an Investor</InvestorCtaButton>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
