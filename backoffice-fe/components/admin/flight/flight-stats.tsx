"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane } from "lucide-react"
import type { Flight, PaginatedResponse } from "@/types/api"

interface FlightStatsProps {
  flights: PaginatedResponse<Flight> | null
  formatPrice: (price: number) => string
}

export function FlightStats({ flights, formatPrice }: FlightStatsProps) {
  const totalFlights = flights?.totalElements || 0
  const activeFlights = flights?.content.filter(f => f.status === 'ACTIVE').length || 0
  const cancelledFlights = flights?.content.filter(f => f.status === 'CANCELLED').length || 0
  const avgPrice = flights?.content.length ?
    flights.content.reduce((sum, f) => sum + (f.basePrice || 0), 0) / flights.content.length :
    0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng chuyến bay</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFlights}</div>
          <p className="text-xs text-muted-foreground">Đang hoạt động</p>
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
          <CardTitle className="text-sm font-medium">Giá trung bình</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {avgPrice > 0 ? formatPrice(avgPrice) : '0 ₫'}
          </div>
          <p className="text-xs text-muted-foreground">Giá vé trung bình</p>
        </CardContent>
      </Card>
    </div>
  )
}
