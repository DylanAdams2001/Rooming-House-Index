export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-offwhite">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-10 text-sm text-muted md:flex-row">
        <p className="font-display text-base text-ink">Rooming House Index</p>
        <p>&copy; {new Date().getFullYear()} Rooming House Index. Data for Victoria, Australia.</p>
      </div>
    </footer>
  );
}
