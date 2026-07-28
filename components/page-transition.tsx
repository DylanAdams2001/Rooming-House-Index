"use client";

import { usePathname } from "next/navigation";

// Routes with their own persistent sidebar/topbar layout (app/dashboard,
// app/account, app/partners) apply this same transition themselves, scoped
// to just their <main> — so the root-level instance (skipShellRoutes) must
// leave those alone entirely. Keying the *whole* subtree by pathname at the
// root would remount their sidebar on every in-app navigation, since a
// changed key forces React to unmount+remount everything under it,
// overriding Next's usual layout-preservation across sibling routes.
const SHELL_PREFIXES = ["/dashboard", "/account", "/partners"];

export function PageTransition({
  children,
  skipShellRoutes = false,
}: {
  children: React.ReactNode;
  skipShellRoutes?: boolean;
}) {
  const pathname = usePathname();

  if (skipShellRoutes && SHELL_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return <>{children}</>;
  }

  return (
    <div key={pathname} className="animate-in fade-in duration-300">
      {children}
    </div>
  );
}
