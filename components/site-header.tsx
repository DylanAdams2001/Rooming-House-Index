import Link from "next/link";
import { HeaderAuthButton } from "@/components/header-auth-button";
import { BecomeInvestorButton } from "@/components/become-investor-button";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tight text-ink">
          Rooming House Standard
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-body md:flex">
          <Link href="/listings" className="hover:text-ink">
            Browse Rooms
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <BecomeInvestorButton />
          <HeaderAuthButton />
        </div>
      </div>
    </header>
  );
}
