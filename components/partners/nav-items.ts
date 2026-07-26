import { ListChecks, MessageCircle, Plus, User, type LucideIcon } from "lucide-react";

export type PartnerNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Unlike every other nav-items.ts in this codebase (static arrays), this one is a
// function of role — /partners is a single shared portal whose sections show or
// hide depending on whether the signed-in account is a service provider, a
// property manager, or an admin (who sees everything).
export function getPartnerNavItems(role: string | null | undefined): PartnerNavItem[] {
  const items: PartnerNavItem[] = [];

  if (role === "provider" || role === "admin") {
    items.push({ href: "/partners/messages", label: "Messages", icon: MessageCircle });
    items.push({ href: "/partners/profile", label: "Listing", icon: User });
  }

  if (role === "property_manager" || role === "admin") {
    items.push({ href: "/partners/listings", label: "Rooms", icon: ListChecks });
    items.push({ href: "/partners/listings/new", label: "Add Room", icon: Plus });
  }

  return items;
}

// /partners/listings and /partners/listings/new both start with the "Rooms"
// item's href — highlight whichever nav item's href is the longest (most
// specific) match instead of lighting up both at once.
export function isPartnerNavItemActive(
  items: PartnerNavItem[],
  pathname: string,
  href: string
): boolean {
  const matches = items.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  if (matches.length === 0) return false;
  const longest = matches.reduce((a, b) => (b.href.length > a.href.length ? b : a));
  return longest.href === href;
}
