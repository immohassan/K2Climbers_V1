export function ExpeditionsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filter bar skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-24 bg-muted animate-pulse" />
        <div className="ml-auto h-4 w-20 bg-muted animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-background">
            {/* Image */}
            <div className="bg-muted animate-pulse" style={{ aspectRatio: "3/2" }} />
            {/* Content */}
            <div className="p-4 sm:p-5 border-b border-border space-y-3">
              <div className="h-5 w-3/4 bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-full bg-muted animate-pulse" />
                <div className="h-3.5 w-2/3 bg-muted animate-pulse" />
              </div>
              <div className="flex gap-4">
                <div className="h-3 w-16 bg-muted animate-pulse" />
                <div className="h-3 w-14 bg-muted animate-pulse" />
                <div className="h-3 w-20 bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
