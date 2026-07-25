import Link from "next/link";

// Deliberately minimal — ad landing pages convert best with one path forward,
// not a full nav inviting people to click away. No SiteHeader here on purpose.
export function FunnelHeader() {
  return (
    <header className="border-b border-line/50 bg-ink">
      <div className="container-page flex h-16 items-center justify-between">
        <span className="font-display text-lg tracking-tight text-white">Rooming House Index</span>
        <Link href="/login" className="text-sm text-white/60 hover:text-white">
          Log in
        </Link>
      </div>
    </header>
  );
}
