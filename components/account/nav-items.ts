import { Bookmark, MessageCircle, FileText, User, Search, type LucideIcon } from "lucide-react";

export type AccountNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const BASE_ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  { href: "/listings", label: "Browse Rooms", icon: Search },
  { href: "/account/messages", label: "Messages", icon: MessageCircle },
  { href: "/account/saved-listings", label: "Saved Listings", icon: Bookmark },
  { href: "/account/enquiries", label: "Enquiries", icon: FileText },
  { href: "/account/settings", label: "Profile", icon: User },
];

// Admin's home base is the Partners portal — nothing admin-specific belongs
// in the tenant account nav.
export function getAccountNavItems(_role: string | null | undefined): AccountNavItem[] {
  return BASE_ACCOUNT_NAV_ITEMS;
}
