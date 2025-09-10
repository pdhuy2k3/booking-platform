import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function FlightFaresLoading() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[500px] mt-2" />
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-[50px]" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            {/* Filters Skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[200px]" />
              </div>
              <Skeleton className="h-10 w-[120px]" />
            </div>

            {/* Table Skeleton */}
            <div className="rounded-md border">
              <div className="p-4">
                {/* Table Header */}
                <div className="flex space-x-4 mb-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-[100px]" />
                  ))}
                </div>

                {/* Table Rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex space-x-4 mb-3">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <Skeleton key={j} className="h-8 w-[100px]" />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between space-x-2 py-4">
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[60px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
