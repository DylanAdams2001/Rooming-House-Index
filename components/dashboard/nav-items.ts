import {
  Compass,
  Bookmark,
  LineChart,
  List,
  MapPin,
  MessageCircle,
  ShieldCheck,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { serviceCategories } from "@/lib/service-categories";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
  children?: { label: string; href?: string; comingSoon?: boolean }[];
  // Shown as a step in the first-login product tour when it highlights this
  // item in the sidebar — single source of truth so the tour can never drift
  // out of sync with what's actually in the nav.
  tourDescription: string;
};

const BASE_NAV_ITEMS: NavItem[] = [
  {
    href: "/listings",
    label: "Listings",
    icon: List,
    external: true,
    tourDescription: "Browse every live room listing on the platform — the same page members browse, handy for checking what's actually on the market.",
  },
  {
    href: "/dashboard/suburbs",
    label: "Suburb Explorer",
    icon: Compass,
    tourDescription:
      "Search and filter every tracked suburb on a map — by yield, demand, or room rate. Click into any suburb for its full stats, or save it for quick comparison later.",
  },
  {
    href: "/dashboard/saved",
    label: "Saved Suburbs",
    icon: Bookmark,
    tourDescription:
      "Suburbs you've bookmarked while exploring — click the save icon on any suburb card to add one.",
  },
  {
    href: "/dashboard/market",
    label: "Market Overview",
    icon: LineChart,
    tourDescription:
      "Compare every tracked suburb side by side on room rate, demand, and supply. Sort by any column to spot where yields are strongest right now.",
  },
  {
    href: "https://parcel-scout.onrender.com/app.html",
    label: "Land Finder",
    icon: MapPin,
    external: true,
    tourDescription: "A separate tool for finding development-ready land — opens in a new tab.",
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    icon: MessageCircle,
    tourDescription: "Every conversation with a service provider lives here, including quote requests.",
  },
  {
    href: "/dashboard/services",
    label: "Services",
    icon: Wrench,
    children: serviceCategories.map((c) => ({
      label: c.label,
      href: c.comingSoon ? undefined : `/dashboard/services/${c.slug}`,
      comingSoon: c.comingSoon,
    })),
    tourDescription:
      "Vetted insurance, legal, maintenance, and other providers for running a rooming house. Most categories let you message a provider directly — Insurance and Property Management submit once and we bring back multiple quotes instead.",
  },
  {
    href: "/dashboard/settings",
    label: "Profile",
    icon: User,
    tourDescription: "Update your contact details and account settings here.",
  },
];

// Admin's home base is the investor dashboard, same as everyone else — this
// is a plain link straight into the Partner Portal, not a dropdown. The
// portal itself has its own nav (Business Partners, All Conversations,
// Partner Signup Links) once you're in there.
const PARTNER_PORTAL_NAV_ITEM: NavItem = {
  href: "/partners",
  label: "Partner Portal",
  icon: ShieldCheck,
  tourDescription: "Manage every business partner, listing, and quote from here — this is admin-only.",
};

export function getDashboardNavItems(role: string | null | undefined): NavItem[] {
  return role === "admin" ? [...BASE_NAV_ITEMS, PARTNER_PORTAL_NAV_ITEM] : BASE_NAV_ITEMS;
}
