import { Bookmark, MessageCircle, FileText, ShieldCheck, User, Search, type LucideIcon } from "lucide-react";

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

// Admin has no restrictions on any portal — quick links to jump straight into
// the other two account experiences and the admin tools from here.
const ADMIN_ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  { href: "/dashboard/admin", label: "Business Partners", icon: ShieldCheck },
  { href: "/dashboard", label: "Investor Dashboard", icon: ShieldCheck },
  { href: "/partners", label: "Partners Portal", icon: ShieldCheck },
  { href: "/dashboard/admin/conversations", label: "All Conversations", icon: ShieldCheck },
  { href: "/dashboard/admin/partner-links", label: "Partner Signup Links", icon: ShieldCheck },
];

export function getAccountNavItems(role: string | null | undefined): AccountNavItem[] {
  return role === "admin" ? [...BASE_ACCOUNT_NAV_ITEMS, ...ADMIN_ACCOUNT_NAV_ITEMS] : BASE_ACCOUNT_NAV_ITEMS;
}
