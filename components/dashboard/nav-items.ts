import {
  Compass,
  Bookmark,
  LineChart,
  List,
  MapPin,
  MessageCircle,
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

// Admin's home base is the Partners portal (Business Partners directory,
// every conversation, partner signup links) — nothing admin-specific belongs
// in the investor dashboard nav anymore.
export function getDashboardNavItems(_role: string | null | undefined): NavItem[] {
  return BASE_NAV_ITEMS;
}
