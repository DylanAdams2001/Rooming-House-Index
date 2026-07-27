import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SuburbCard } from "@/components/suburb-card";
import { ReferralCard } from "@/components/referral-card";
import { dashboardStats, suburbs } from "@/lib/mock-data";
import {
  Building2,
  TrendingUp,
  Flame,
  CalendarClock,
  ArrowRight,
  Compass,
  LineChart,
  MapPin,
  Wrench,
} from "lucide-react";

const TOOLS = [
  {
    href: "/dashboard/suburbs",
    label: "Suburb Explorer",
    description: "Search and filter every tracked suburb on a map.",
    icon: Compass,
  },
  {
    href: "/dashboard/market",
    label: "Market Overview",
    description: "Compare suburbs side by side on rate, demand, and supply.",
    icon: LineChart,
  },
  {
    href: "https://parcel-scout.onrender.com/app.html",
    label: "Land Finder",
    description: "Search available parcels for your next build.",
    icon: MapPin,
    external: true,
  },
  {
    href: "/dashboard/services",
    label: "Provider Marketplace",
    description: "Vetted insurance, legal, and maintenance providers.",
    icon: Wrench,
  },
];

export default async function DashboardHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let referralCode: string | null = null;
  let referralCount = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("referral_code")
      .eq("id", user.id)
      .maybeSingle();
    referralCode = profile?.referral_code ?? null;

    const { data: count } = await supabase.rpc("count_successful_referrals", { p_user_id: user.id });
    referralCount = count ?? 0;
  }

  const stats = [
    {
      label: "Total Suburbs Tracked",
      value: dashboardStats.totalSuburbsTracked,
      icon: Building2,
    },
    {
      label: "Average Gross Yield",
      value: dashboardStats.avgGrossYield,
      icon: TrendingUp,
    },
    {
      label: "Suburbs with High Demand",
      value: dashboardStats.highDemandSuburbs,
      icon: Flame,
    },
    {
      label: "New Data Updated",
      value: dashboardStats.dataUpdated,
      icon: CalendarClock,
    },
  ];

  // "Trending" = highest room rate among the currently high-demand suburbs —
  // demand levels are estimates pending a verified source (flagged on the
  // suburb pages themselves), so this is framed as a starting point, not a fact.
  const trendingSuburbs = suburbs
    .filter((s) => s.demandLevel === "High")
    .sort((a, b) => b.avgRoomRate - a.avgRoomRate)
    .slice(0, 3);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">
        Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
      </h1>
      <p className="mt-2 text-body">
        Here&apos;s the current state of the rooming house market across Victoria.
      </p>

      {referralCode && <ReferralCard referralCode={referralCode} referralCount={referralCount} />}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-ink" />
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl text-ink">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trending suburbs */}
      <div className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-ink">Trending Suburbs</h2>
            <p className="mt-1 text-sm text-body">
              Highest room rates among suburbs currently showing high demand (est.).
            </p>
          </div>
          <Link
            href="/dashboard/suburbs"
            className="flex items-center gap-1 text-sm font-medium text-ink hover:underline"
          >
            See all suburbs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {trendingSuburbs.map((suburb) => (
            <SuburbCard key={suburb.id} suburb={suburb} />
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="mt-12">
        <h2 className="font-display text-2xl text-ink">Your Tools</h2>
        <p className="mt-1 text-sm text-body">Everything you need to research your next investment.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              target={tool.external ? "_blank" : undefined}
              rel={tool.external ? "noopener noreferrer" : undefined}
              className="group rounded-card border border-line bg-white p-5 transition-colors hover:border-ink"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-linen text-ink">
                <tool.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base text-ink">{tool.label}</h3>
              <p className="mt-1 text-sm text-body">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
