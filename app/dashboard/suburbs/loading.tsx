export default function Loading() {
  return (
    <div>
      <div className="h-9 w-64 animate-pulse rounded bg-line/40" />
      <div className="mt-8 h-40 animate-pulse rounded-card border border-line bg-line/20" />
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-card border border-line bg-line/40"
          />
        ))}
      </div>
    </div>
  );
}
