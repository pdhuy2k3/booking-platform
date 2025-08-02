import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

// Predefined skeleton components for common use cases
export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export function SkeletonFlightCard() {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-6 w-[150px]" />
        </div>
        <Skeleton className="h-8 w-[80px]" />
      </div>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-3 w-[60px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
        <Skeleton className="h-6 w-[40px]" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-[60px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
    </div>
  );
}

export function SkeletonSearchResults() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-8 w-[120px]" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonFlightCard key={i} />
      ))}
    </div>
  );
}
