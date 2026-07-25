import { Bookmark, MessageCircle, FileText, User, Search, type LucideIcon } from "lucide-react";

export type AccountNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const accountNavItems: AccountNavItem[] = [
  { href: "/listings", label: "Browse Rooms", icon: Search },
  { href: "/account/messages", label: "Messages", icon: MessageCircle },
  { href: "/account/saved-listings", label: "Saved Listings", icon: Bookmark },
  { href: "/account/enquiries", label: "Enquiries", icon: FileText },
  { href: "/account/settings", label: "Profile", icon: User },
];
