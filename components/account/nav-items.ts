import { Bookmark, MessageCircle, FileText, User, TrendingUp, type LucideIcon } from "lucide-react";

export type AccountNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const accountNavItems: AccountNavItem[] = [
  { href: "/account/messages", label: "Messages", icon: MessageCircle },
  { href: "/account/saved-listings", label: "Saved Listings", icon: Bookmark },
  { href: "/account/application", label: "My Application", icon: FileText },
  { href: "/account/upgrade", label: "Investor Access", icon: TrendingUp },
  { href: "/account/settings", label: "Profile", icon: User },
];
