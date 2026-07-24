import { Compass, Bookmark, LineChart, Settings, Wrench, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: { label: string; comingSoon?: boolean }[];
};

export const navItems: NavItem[] = [
  { href: "/dashboard/suburbs", label: "Suburb Explorer", icon: Compass },
  { href: "/dashboard/saved", label: "Saved Suburbs", icon: Bookmark },
  { href: "/dashboard/market", label: "Market Overview", icon: LineChart },
  {
    href: "/dashboard/services",
    label: "Services",
    icon: Wrench,
    children: [
      { label: "Building", comingSoon: true },
      { label: "Maintenance", comingSoon: true },
      { label: "Conveyancing / Legal", comingSoon: true },
      { label: "Property Management", comingSoon: true },
      { label: "Inspectors", comingSoon: true },
      { label: "Furnishing", comingSoon: true },
    ],
  },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
