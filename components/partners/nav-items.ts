import { FileText, Home, ListChecks, MessageCircle, Package, Plus, ShieldCheck, User, type LucideIcon } from "lucide-react";

export type PartnerNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Categories run as "submit once, we bring back multiple quotes" (see
// lib/service-categories.ts quoteBased) never have a self-serve directory a
// member messages directly — they only ever get quote requests, so those
// providers see "Quote Requests" instead of "Messages".
const QUOTE_BASED_CATEGORIES = ["insurance", "property_management", "building"];

// Unlike every other nav-items.ts in this codebase (static arrays), this one is a
// function of role — /partners is a single shared portal whose sections show or
// hide depending on whether the signed-in account is a service provider, a
// property manager, or an admin (who sees everything).
export function getPartnerNavItems(
  role: string | null | undefined,
  category?: string | null
): PartnerNavItem[] {
  // Admin isn't a partner account with its own messages/listings — this
  // portal is where admin manages every partner brought on, so the nav is
  // just the tools for that. Getting back to the investor dashboard is the
  // logo/back-arrow in the header, not a nav item here.
  if (role === "admin") {
    return [
      { href: "/partners", label: "Business Partners", icon: ShieldCheck },
      { href: "/partners/admin/listings", label: "All Listings", icon: Home },
      { href: "/partners/admin/quotes", label: "All Quotes", icon: FileText },
      { href: "/partners/admin/conversations", label: "All Conversations", icon: ShieldCheck },
      { href: "/partners/admin/partner-links", label: "Partner Signup Links", icon: ShieldCheck },
    ];
  }

  const items: PartnerNavItem[] = [];
  const isQuoteBased = !!category && QUOTE_BASED_CATEGORIES.includes(category);
  // A property manager is always in the (inherently quote-based)
  // property_management category — no need to check their actual category
  // value the way a regular provider's is checked.
  const hasServiceProviderRow = role === "provider" || role === "property_manager";

  if (hasServiceProviderRow) {
    if (isQuoteBased || role === "property_manager") {
      items.push({ href: "/partners/quotes", label: "Quote Requests", icon: MessageCircle });
    }
    // One shared inbox regardless of category — it merges regular marketplace
    // conversations with quote-request conversations itself, so quote-based
    // providers don't need a separate "Quote Messages" tab.
    items.push({ href: "/partners/messages", label: "Messages", icon: MessageCircle });
    items.push({ href: "/partners/profile", label: "Business Details", icon: User });

    // Furnishing is the one category where investors compare priced options
    // before ever messaging — everyone else is a case-by-case conversation
    // where a fixed price list wouldn't mean much.
    if (category === "furnishing") {
      items.push({ href: "/partners/packages", label: "Packages", icon: Package });
    }
  }

  if (role === "property_manager") {
    items.push({ href: "/partners/listings", label: "Rooms", icon: ListChecks });
    items.push({ href: "/partners/listings/new", label: "Add Room", icon: Plus });
    // Room enquiries live in the unified Messages tab above now, not a
    // separate Enquiries tab.
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
  // The listing edit page is shared — a property manager editing their own
  // room, and admin editing any property manager's room from All Listings,
  // both land on /partners/listings/[id]/edit. That path shares no prefix
  // with admin's "All Listings" (/partners/admin/listings), so it would
  // otherwise only ever prefix-match the portal home ("/partners"),
  // highlighting Business Partners instead. Only remap when the admin nav
  // (the one with an All Listings item) is what's actually being rendered.
  const isAdminNav = items.some((item) => item.href === "/partners/admin/listings");
  const effectivePathname =
    isAdminNav && pathname.startsWith("/partners/listings/") ? "/partners/admin/listings" : pathname;

  const matches = items.filter(
    (item) => effectivePathname === item.href || effectivePathname.startsWith(`${item.href}/`)
  );
  if (matches.length === 0) return false;
  const longest = matches.reduce((a, b) => (b.href.length > a.href.length ? b : a));
  return longest.href === href;
}
