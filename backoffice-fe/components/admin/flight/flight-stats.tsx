"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane } from "lucide-react"
import type { Flight } from "@/types/api"

interface FlightStatsProps {
  flights: Flight[]
}

export function FlightStats({ flights }: FlightStatsProps) {
  const totalFlights = flights?.length || 0
  const activeFlights = flights?.filter(f => f.status === 'ACTIVE').length || 0
  const cancelledFlights = flights?.filter(f => f.status === 'CANCELLED').length || 0

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng chuyến bay</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFlights}</div>
          <p className="text-xs text-muted-foreground">Tất cả chuyến bay</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chuyến bay hoạt động</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeFlights}</div>
          <p className="text-xs text-muted-foreground">Đang hoạt động</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chuyến bay hủy</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cancelledFlights}</div>
          <p className="text-xs text-muted-foreground">Đã hủy</p>
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
          <p className="text-xs text-muted-foreground">Chuyến bay hoạt động</p>
        </CardContent>
      </Card>
    </>
  )
}