import { ListChecks, MessageCircle, User, type LucideIcon } from "lucide-react";

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
    items.push({ href: "/partners/profile", label: "My Listing", icon: User });
  }

  if (role === "property_manager" || role === "admin") {
    items.push({ href: "/partners/listings", label: "My Rooms", icon: ListChecks });
  }

  return items;
}
