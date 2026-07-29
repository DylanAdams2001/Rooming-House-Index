import { Bookmark, MessageCircle, FileText, User, Search, type LucideIcon } from "lucide-react";

export type AccountNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  // Shown as a step in the first-login product tour when it highlights this
  // item in the sidebar.
  tourDescription: string;
};

const BASE_ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  {
    href: "/listings",
    label: "Browse Rooms",
    icon: Search,
    tourDescription: "Search every live room listing — filter by suburb, price, or room type.",
  },
  {
    href: "/account/messages",
    label: "Messages",
    icon: MessageCircle,
    tourDescription:
      "Every conversation with a property team lives here, once you've enquired on a room. Reply here to ask questions, confirm an inspection, or reschedule.",
  },
  {
    href: "/account/saved-listings",
    label: "Saved Listings",
    icon: Bookmark,
    tourDescription: "Rooms you've bookmarked while browsing — tap the heart/save icon on any listing to add one.",
  },
  {
    href: "/account/enquiries",
    label: "Enquiries",
    icon: FileText,
    tourDescription: "Every room you've enquired on, at a glance — your application is also linked below.",
  },
  {
    href: "/account/settings",
    label: "Profile",
    icon: User,
    tourDescription: "Update your contact details, application info, and account settings here.",
  },
];

// Admin's home base is the Partners portal — nothing admin-specific belongs
// in the tenant account nav.
export function getAccountNavItems(_role: string | null | undefined): AccountNavItem[] {
  return BASE_ACCOUNT_NAV_ITEMS;
}
