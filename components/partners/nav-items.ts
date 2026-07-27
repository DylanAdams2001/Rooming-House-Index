import { ListChecks, MessageCircle, Plus, User, type LucideIcon } from "lucide-react";

export type PartnerNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Categories run as "submit once, we bring back multiple quotes" (see
// lib/service-categories.ts quoteBased) never have a self-serve directory a
// member messages directly — they only ever get quote requests, so those
// providers see "Quote Requests" instead of "Messages".
const QUOTE_BASED_CATEGORIES = ["insurance", "property_management"];

// Unlike every other nav-items.ts in this codebase (static arrays), this one is a
// function of role — /partners is a single shared portal whose sections show or
// hide depending on whether the signed-in account is a service provider, a
// property manager, or an admin (who sees everything).
export function getPartnerNavItems(
  role: string | null | undefined,
  category?: string | null
): PartnerNavItem[] {
  const items: PartnerNavItem[] = [];
  const isQuoteBased = !!category && QUOTE_BASED_CATEGORIES.includes(category);
  // A property manager is always in the (inherently quote-based)
  // property_management category — no need to check their actual category
  // value the way a regular provider's is checked.
  const hasServiceProviderRow = role === "provider" || role === "property_manager" || role === "admin";

  if (hasServiceProviderRow) {
    if (isQuoteBased || role === "property_manager" || role === "admin") {
      items.push({ href: "/partners/quotes", label: "Quote Requests", icon: MessageCircle });
    }
    // One shared inbox regardless of category — it merges regular marketplace
    // conversations with quote-request conversations itself, so quote-based
    // providers don't need a separate "Quote Messages" tab.
    items.push({ href: "/partners/messages", label: "Messages", icon: MessageCircle });
    items.push({ href: "/partners/profile", label: "Business Details", icon: User });
  }

  if (role === "property_manager" || role === "admin") {
    items.push({ href: "/partners/listings", label: "Rooms", icon: ListChecks });
    items.push({ href: "/partners/listings/new", label: "Add Room", icon: Plus });
    items.push({ href: "/partners/enquiries", label: "Enquiries", icon: MessageCircle });
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
