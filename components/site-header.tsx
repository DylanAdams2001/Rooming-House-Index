import Link from "next/link";
import { HeaderAuthButton } from "@/components/header-auth-button";
import { BecomeInvestorButton } from "@/components/become-investor-button";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/" className="font-display text-base tracking-tight text-ink sm:text-xl">
          Rooming House Standard
        </Link>
        <nav className="flex items-center gap-4 text-sm text-body sm:gap-8">
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
