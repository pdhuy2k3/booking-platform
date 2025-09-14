export function HotelCardSkeleton() {
  return (
    <div className="rounded-lg border border-border overflow-hidden animate-pulse">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 h-48 bg-muted/20" />
        <div className="md:w-2/3 p-6 space-y-3">
          <div className="h-5 w-56 bg-muted/20 rounded" />
          <div className="h-4 w-40 bg-muted/20 rounded" />
          <div className="h-4 w-24 bg-muted/20 rounded" />
          <div className="h-10 w-full bg-muted/20 rounded" />
        </div>
      </div>
    </div>
  )
}

