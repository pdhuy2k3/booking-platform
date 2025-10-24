"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane } from "lucide-react"
import type { Flight, PaginatedResponse } from "@/types/api"

interface FlightStatsProps {
  flights: PaginatedResponse<Flight> | null
  statistics: any | null
  loadingStatistics: boolean
}

export function FlightStats({ flights, statistics, loadingStatistics }: FlightStatsProps) {
  // Use statistics data if available, otherwise fall back to paginated data
  const totalFlights = statistics?.totalFlights ?? flights?.totalElements ?? 0
  const activeFlights = statistics?.activeFlights ?? 0
  const cancelledFlights = statistics?.cancelledFlights ?? 0

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng chuyến bay</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFlights.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {loadingStatistics ? "Đang tải..." : "Tất cả chuyến bay"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chuyến bay hoạt động</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeFlights.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {loadingStatistics ? "Đang tải..." : "Đang hoạt động"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chuyến bay hủy</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cancelledFlights.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {loadingStatistics ? "Đang tải..." : "Đã hủy"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tỷ lệ hoạt động</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalFlights > 0 ? Math.round((activeFlights / totalFlights) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            {loadingStatistics ? "Đang tải..." : "Chuyến bay hoạt động"}
          </p>
        </CardContent>
      </Card>
    </>
  )
}