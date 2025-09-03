"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation, MapPin } from "lucide-react"
import type { Airport, PaginatedResponse } from "@/types/api"

interface AirportStatsProps {
  airports: PaginatedResponse<Airport> | null
}

export function AirportStats({ airports }: AirportStatsProps) {
  const totalAirports = airports?.totalElements || 0
  const activeAirports = airports?.content.filter(a => a.isActive).length || 0
  const uniqueCities = new Set(airports?.content.map(a => a.city).filter(Boolean)).size
  const uniqueCountries = new Set(airports?.content.map(a => a.country).filter(Boolean)).size

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng sân bay</CardTitle>
          <Navigation className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAirports}</div>
          <p className="text-xs text-muted-foreground">Tất cả sân bay</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
          <Navigation className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeAirports}</div>
          <p className="text-xs text-muted-foreground">Sân bay hoạt động</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Thành phố</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueCities}</div>
          <p className="text-xs text-muted-foreground">Số thành phố</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quốc gia</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueCountries}</div>
          <p className="text-xs text-muted-foreground">Số quốc gia</p>
        </CardContent>
      </Card>
    </div>
  )
}
