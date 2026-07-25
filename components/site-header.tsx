import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tight text-ink">
          Rooming House Index
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-body md:flex">
          <Link href="/listings" className="hover:text-ink">
            Browse Rooms
          </Link>
          <Link href="/login" className="hover:text-ink">
            Log in
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/investors">Become an Investor</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/listings">Browse Rooms</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
