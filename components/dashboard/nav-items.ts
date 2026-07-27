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

// Admin's home base is the investor dashboard, same as everyone else — the
// Partner Portal (Business Partners directory, every conversation, partner
// signup links) is just one collapsible menu group inside it, not a
// separate landing experience.
const PARTNER_PORTAL_NAV_ITEM: NavItem = {
  href: "/partners",
  label: "Partner Portal",
  icon: ShieldCheck,
  children: [
    { label: "Business Partners", href: "/partners" },
    { label: "All Conversations", href: "/partners/admin/conversations" },
    { label: "Partner Signup Links", href: "/partners/admin/partner-links" },
  ],
};

export function getDashboardNavItems(role: string | null | undefined): NavItem[] {
  return role === "admin" ? [...BASE_NAV_ITEMS, PARTNER_PORTAL_NAV_ITEM] : BASE_NAV_ITEMS;
}
