import { Archive, FileText, Home, ListChecks, MessageCircle, Package, Plus, ShieldCheck, User, type LucideIcon } from "lucide-react";

export type PartnerNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  // Shown as a step in the first-login product tour when it highlights this
  // item in the sidebar — set inline per item below (rather than a separate
  // lookup table) since this nav is already built dynamically per role.
  tourDescription: string;
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
      {
        href: "/partners",
        label: "Business Partners",
        icon: ShieldCheck,
        tourDescription:
          "Every business partner across every category lives here. Click into one to see their listings and who's enquired with them.",
      },
      {
        href: "/partners/admin/listings",
        label: "All Listings",
        icon: Home,
        tourDescription: "Every room listed across every property manager, in one place.",
      },
      {
        href: "/partners/admin/listings/new",
        label: "Add Listing",
        icon: Plus,
        tourDescription:
          "Upload a room directly, without needing to sign into a property manager's account.",
      },
      {
        href: "/partners/admin/quotes",
        label: "All Quotes",
        icon: FileText,
        tourDescription:
          "Every quote request across every category, and every quote submitted against it. Click any submitted quote to jump straight into that conversation.",
      },
      {
        href: "/partners/archive",
        label: "Archived Listings",
        icon: Archive,
        tourDescription:
          "Every room that's actually been rented, platform-wide, with the real closed rate — not just the advertised asking price.",
      },
      {
        href: "/partners/admin/conversations",
        label: "All Conversations",
        icon: ShieldCheck,
        tourDescription:
          "Every conversation on the platform — marketplace messages, quote requests, and room enquiries — merged into one list. Click into any of them to reply as that business, useful for suppliers without a claimed account yet.",
      },
      {
        href: "/partners/admin/partner-links",
        label: "Partner Signup Links",
        icon: ShieldCheck,
        tourDescription: "These are private — nothing here is public or self-serve.",
      },
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
      items.push({
        href: "/partners/quotes",
        label: "Quote Requests",
        icon: MessageCircle,
        tourDescription:
          "Every investor in your category who's requesting quotes shows up here — a red dot means you haven't opened it yet. Click into one to submit your price and start a conversation about it.",
      });
    }
    // One shared inbox regardless of category — it merges regular marketplace
    // conversations with quote-request conversations itself, so quote-based
    // providers don't need a separate "Quote Messages" tab.
    items.push({
      href: "/partners/messages",
      label: "Messages",
      icon: MessageCircle,
      tourDescription:
        "Every conversation with a member lives here — direct messages, quote requests, and (for property managers) tenant room enquiries, all merged into one inbox.",
    });
    items.push({
      href: "/partners/profile",
      label: "Business Details",
      icon: User,
      tourDescription: "This is your public profile — investors see exactly what you fill in here before they message you.",
    });

    // Furnishing is the one category where investors compare priced options
    // before ever messaging — everyone else is a case-by-case conversation
    // where a fixed price list wouldn't mean much.
    if (category === "furnishing") {
      items.push({
        href: "/partners/packages",
        label: "Packages",
        icon: Package,
        tourDescription:
          "Add a few named, priced packages — they show on your public profile so investors can compare before ever messaging.",
      });
    }
  }

  if (role === "property_manager") {
    items.push({
      href: "/partners/listings",
      label: "Rooms",
      icon: ListChecks,
      tourDescription: "Every room you've listed, with its status — pending, approved, or rejected.",
    });
    items.push({
      href: "/partners/listings/new",
      label: "Add Room",
      icon: Plus,
      tourDescription: "Create a new room listing — it publishes immediately once submitted.",
    });
    items.push({
      href: "/partners/archive",
      label: "Archived Listings",
      icon: Archive,
      tourDescription:
        "Every room that's actually been rented, platform-wide, with the real closed rate — not just the advertised asking price.",
    });
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
