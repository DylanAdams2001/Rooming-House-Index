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

export const navItems: NavItem[] = [
  { href: "/listings", label: "Listings", icon: List },
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
