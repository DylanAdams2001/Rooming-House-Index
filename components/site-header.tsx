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
          <a href="#features" className="hover:text-ink">
            Platform
          </a>
          <Link href="/listings" className="hover:text-ink">
            Room Listings
          </Link>
          <a href="#access" className="hover:text-ink">
            Early Access
          </a>
          <Link href="/login" className="hover:text-ink">
            Log in
          </Link>
        </nav>
        <Button asChild size="sm">
          <a href="#access">Request Early Access</a>
        </Button>
      </div>
    </header>
  );
}
