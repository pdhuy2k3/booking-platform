export function FlightCardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-6 animate-pulse">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-8 h-8 rounded bg-muted/20" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-muted/20 rounded" />
            <div className="h-3 w-24 bg-muted/20 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-12">
          <div className="space-y-2 text-center">
            <div className="h-4 w-14 bg-muted/20 rounded" />
            <div className="h-3 w-10 bg-muted/20 rounded" />
          </div>
          <div className="space-y-2 text-center">
            <div className="h-4 w-16 bg-muted/20 rounded" />
            <div className="h-3 w-10 bg-muted/20 rounded" />
          </div>
        </div>
        <div className="w-28 h-8 bg-muted/20 rounded" />
      </div>
    </div>
  )
}

