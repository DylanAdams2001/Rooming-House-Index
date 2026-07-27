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
};

const BASE_NAV_ITEMS: NavItem[] = [
  { href: "/listings", label: "Listings", icon: List, external: true },
  { href: "/dashboard/suburbs", label: "Suburb Explorer", icon: Compass },
  { href: "/dashboard/saved", label: "Saved Suburbs", icon: Bookmark },
  { href: "/dashboard/market", label: "Market Overview", icon: LineChart },
  {
    href: "https://parcel-scout.onrender.com/app.html",
    label: "Land Finder",
    icon: MapPin,
    external: true,
  },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  {
    href: "/dashboard/services",
    label: "Services",
    icon: Wrench,
    children: serviceCategories.map((c) => ({
      label: c.label,
      href: c.comingSoon ? undefined : `/dashboard/services/${c.slug}`,
      comingSoon: c.comingSoon,
    })),
  },
  { href: "/dashboard/settings", label: "Profile", icon: User },
];

// Unlike the rest of this static array, the Admin group only shows for
// role='admin' — these pages (compliance oversight, private partner signup
// links) were previously only reachable by typing the URL directly.
const ADMIN_NAV_ITEM: NavItem = {
  href: "/dashboard/admin",
  label: "Admin",
  icon: ShieldCheck,
  children: [
    { label: "Business Partners", href: "/dashboard/admin" },
    { label: "All Conversations", href: "/dashboard/admin/conversations" },
    { label: "Partner Signup Links", href: "/dashboard/admin/partner-links" },
    // Admin has no restrictions on any portal — quick links to jump straight
    // into the other two account experiences from wherever they're standing.
    { label: "Tenant Account", href: "/account" },
    { label: "Partners Portal", href: "/partners" },
  ],
};

export function getDashboardNavItems(role: string | null | undefined): NavItem[] {
  return role === "admin" ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS;
}
