"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FunnelHeader } from "@/components/funnel-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { createClient } from "@/lib/supabase/client";
import { defaultDestination, getOnboardingPath } from "@/lib/onboarding";
import { dashboardStats } from "@/lib/mock-data";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

const TOUR = [
  {
    icon: MapPin,
    title: "Suburb Explorer",
    description:
      "Every tracked suburb on an interactive map — filterable by room rate and postcode, with registered supply one click away.",
    image: "/screenshots/dashboard-map.png",
  },
  {
    icon: BarChart3,
    title: "Market Overview",
    description:
      "Every suburb sortable by average room rate and registered rooming house count — the whole state at a glance.",
    image: "/screenshots/dashboard-market.png",
  },
  {
    icon: MessageCircle,
    title: "Provider marketplace",
    description:
      "Vetted insurance, legal, inspection, and maintenance providers for rooming houses — message them directly from your account.",
    image: "/screenshots/dashboard-services.png",
  },
];

const OBJECTIONS = [
  {
    question: "“Isn’t rooming house data just generic residential data?”",
    answer:
      "No — every metric here is modelled specifically for the rooming house asset class: registered supply from the Consumer Affairs Victoria register, room-level rental rates, not whole-house medians.",
  },
  {
    question: "“How do I know a suburb isn’t already oversaturated?”",
    answer:
      "You see the actual number of registered rooming houses per suburb before you commit — not a guess, not an agent's opinion.",
  },
  {
    question: "“Do I need to already own a rooming house to use this?”",
    answer:
      "No. Whether you're validating your first purchase, an SMSF-eligible build, or checking a negative-gearing structure against real numbers, the data works the same way.",
  },
];

export default function InvestPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Same routing rule as the normal signup/login flow: resume onboarding if it
  // isn't finished, otherwise send investors to /dashboard, everyone else to /account.
  async function handleAuthenticated(userId: string) {
    setShowAuthModal(false);
    const { data: profile } = await supabase
      .from("users")
      .select("onboarding_step, investor_access")
      .eq("id", userId)
      .maybeSingle();
    const onboardingPath = getOnboardingPath(profile?.onboarding_step);
    router.push(onboardingPath ?? defaultDestination(profile?.investor_access));
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <FunnelHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-ink text-white">
          <div className="container-page flex flex-col items-center py-20 text-center md:py-28">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/60">
              For Victorian property investors
            </p>
            <h1 className="max-w-2xl font-display text-4xl leading-tight text-white md:text-5xl">
              Most investors guess which suburb to build in. See the numbers first.
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/80 md:text-lg">
              Suburb-level registered supply and room rental rates across Victoria —
              built specifically for the rooming house asset class, not generic property data.
            </p>
            <Button
              size="lg"
              className="mt-10 bg-white text-ink hover:bg-white/90"
              onClick={() => setShowAuthModal(true)}
            >
              See the Data — Free
            </Button>
            <p className="mt-3 text-xs text-white/50">No card required. Takes under a minute.</p>
          </div>
        </section>

        {/* Proof / stats */}
        <section className="border-b border-line bg-offwhite">
          <div className="container-page grid grid-cols-1 gap-8 py-14 text-center sm:grid-cols-3">
            <div>
              <p className="font-display text-4xl text-ink">{dashboardStats.totalSuburbsTracked}</p>
              <p className="mt-1 text-sm text-muted">Suburbs tracked across Victoria</p>
            </div>
            <div>
              <p className="font-display text-4xl text-ink">{dashboardStats.verifiedSuburbs}</p>
              <p className="mt-1 text-sm text-muted">Suburbs with real, verified rate data</p>
            </div>
            <div>
              <p className="font-display text-4xl text-ink">{dashboardStats.avgGrossYield}</p>
              <p className="mt-1 text-sm text-muted">Average gross yield across tracked suburbs</p>
            </div>
          </div>
        </section>

        {/* SMSF / neg gearing angle */}
        <section className="container-page py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Considering an SMSF purchase or a negative-gearing structure?
            </p>
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              Validate the numbers before you commit
            </h2>
            <p className="mt-4 text-body">
              Whichever structure your broker or accountant has you looking at, the deal still
              lives or dies on the suburb — supply, and what a room actually rents for.
              That's the part most investors are guessing at.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-card border border-line bg-white p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-linen text-ink">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg text-ink">What rooms actually rent for</h3>
              <p className="mt-2 text-sm text-body">
                Real closed rents from real listings on the platform, not just advertised
                asking prices.
              </p>
            </div>
            <div className="rounded-card border border-line bg-white p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-linen text-ink">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg text-ink">Registered supply</h3>
              <p className="mt-2 text-sm text-body">
                See exactly how many registered rooming houses already operate in a suburb,
                sourced from the CAV register.
              </p>
            </div>
            <div className="rounded-card border border-line bg-white p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-linen text-ink">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg text-ink">Real room rates</h3>
              <p className="mt-2 text-sm text-body">
                Benchmark acquisitions and forecast gross yield against actual room-level
                rental rates, not whole-house estimates.
              </p>
            </div>
          </div>
        </section>

        {/* Product tour */}
        <section className="border-t border-line bg-white py-20">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Inside the dashboard
              </p>
              <h2 className="font-display text-3xl text-ink md:text-4xl">
                See exactly what you're getting
              </h2>
            </div>

            <div className="mx-auto mt-14 max-w-4xl space-y-16">
              {TOUR.map(({ icon: Icon, title, description, image }, i) => (
                <div
                  key={title}
                  className={`grid grid-cols-1 items-center gap-8 md:grid-cols-5 ${
                    i % 2 === 1 ? "md:[direction:rtl]" : ""
                  }`}
                >
                  <div className="md:col-span-2 md:[direction:ltr]">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-linen text-ink">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-xl text-ink">{title}</h3>
                    <p className="mt-2 text-sm text-body">{description}</p>
                  </div>
                  <div className="overflow-hidden rounded-card border border-line shadow-sm md:col-span-3 md:[direction:ltr]">
                    <Image
                      src={image}
                      alt={title}
                      width={1280}
                      height={800}
                      loading="eager"
                      className="h-auto w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Objection handling */}
        <section className="border-t border-line bg-linen py-20">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl text-ink md:text-4xl">
                The questions we get asked most
              </h2>
            </div>
            <div className="mx-auto mt-10 max-w-2xl space-y-6">
              {OBJECTIONS.map((o) => (
                <div key={o.question} className="rounded-card border border-line bg-white p-6">
                  <p className="font-display text-lg italic text-ink">{o.question}</p>
                  <p className="mt-2 text-sm text-body">{o.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Urgency / early access */}
        <section className="container-page py-20">
          <div className="mx-auto flex max-w-xl flex-col items-center rounded-card border border-ink bg-ink px-8 py-12 text-center text-white">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
              Early access
            </p>
            <h2 className="mt-3 font-display text-2xl text-white md:text-3xl">
              Investor access is free while we're in early access
            </h2>
            <p className="mt-4 max-w-md text-sm text-white/70">
              Registered supply, room rental rates, saved suburbs, and the
              provider marketplace — no card, no ongoing charge for now.
            </p>
            <Button
              size="lg"
              className="mt-8 w-full bg-white text-ink hover:bg-white/90"
              onClick={() => setShowAuthModal(true)}
            >
              Get Investor Access — Free
            </Button>
            <ul className="mt-8 grid grid-cols-1 gap-2 self-start text-left text-sm text-white/80 sm:grid-cols-2">
              {[
                "Suburb supply data",
                "Average room rental rates",
                "Saved suburbs",
                "Provider marketplace + messaging",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-white/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 text-center text-xs text-muted">
            <AlertTriangle className="h-3.5 w-3.5" />
            Not financial advice — always confirm structure and finance details with your own
            broker or accountant.
          </p>
        </section>
      </main>

      <SiteFooter />

      {showAuthModal && (
        <AuthModal
          initialMode="signup"
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </div>
  );
}
