export function RouteSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-1/3 rounded-btn bg-linen" />
      <div className="h-4 w-2/3 rounded-btn bg-linen" />
      <div className="space-y-3">
        <div className="h-24 rounded-card bg-linen" />
        <div className="h-24 rounded-card bg-linen" />
        <div className="h-24 rounded-card bg-linen" />
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex h-[calc(100vh-8rem)] animate-pulse flex-col gap-4">
      <div className="h-4 w-24 rounded-btn bg-linen" />
      <div className="h-20 rounded-card bg-linen" />
      <div className="flex-1 space-y-3 rounded-card border border-line bg-white p-4">
        <div className="h-10 w-2/3 rounded-btn bg-linen" />
        <div className="ml-auto h-10 w-1/2 rounded-btn bg-linen" />
        <div className="h-10 w-3/5 rounded-btn bg-linen" />
      </div>
    </div>
  );
}
