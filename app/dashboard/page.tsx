import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStats } from "@/lib/mock-data";
import { Building2, TrendingUp, Flame, CalendarClock } from "lucide-react";

export default async function DashboardHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">
        Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
      </h1>
      <p className="mt-2 text-body">
        Here&apos;s the current state of the rooming house market across Victoria.
      </p>

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
    </div>
  );
}
