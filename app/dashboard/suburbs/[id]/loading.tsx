export default function Loading() {
  return (
    <div>
      <div className="h-10 w-72 animate-pulse rounded bg-line/40" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-card border border-line bg-line/40" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-card border border-line bg-line/40" />
        <div className="h-80 animate-pulse rounded-card border border-line bg-line/40" />
      </div>
    </div>
  );
}
