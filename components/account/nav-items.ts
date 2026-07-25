import { MessageCircle, FileText, Settings, type LucideIcon } from "lucide-react";

export type AccountNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const accountNavItems: AccountNavItem[] = [
  { href: "/account/messages", label: "Messages", icon: MessageCircle },
  { href: "/account/application", label: "My Application", icon: FileText },
  { href: "/account/settings", label: "Settings", icon: Settings },
];
