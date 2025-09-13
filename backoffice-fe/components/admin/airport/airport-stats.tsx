"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation, MapPin } from "lucide-react"
import type { Airport, PaginatedResponse } from "@/types/api"

interface AirportStatsProps {
  data: PaginatedResponse<Airport> | null
}

export function AirportStats({ data }: AirportStatsProps) {
  const totalAirports = data?.totalElements || 0
  const activeAirports = data?.content?.filter(a => a.isActive).length || 0
  const uniqueCities = new Set(data?.content?.map(a => a.city)).size || 0
  const uniqueCountries = new Set(data?.content?.map(a => a.country)).size || 0

  const stats = [
    {
      title: "Tổng sân bay",
      value: totalAirports,
      description: "Tất cả sân bay",
      icon: <Navigation className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Đang hoạt động",
      value: activeAirports,
      description: "Sân bay hoạt động",
      icon: <Navigation className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Thành phố",
      value: uniqueCities,
      description: "Số thành phố",
      icon: <MapPin className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Quốc gia",
      value: uniqueCountries,
      description: "Số quốc gia",
      icon: <MapPin className="h-4 w-4 text-muted-foreground" />
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
