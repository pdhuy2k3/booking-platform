"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building } from "lucide-react"
import type { Airline, PaginatedResponse } from "@/types/api"

interface AirlineStatsProps {
  data: PaginatedResponse<Airline> | null
}

export function AirlineStats({ data }: AirlineStatsProps) {
  const totalAirlines = data?.totalElements || 0
  const activeAirlines = data?.content?.filter(a => a.isActive).length || 0
  const inactiveAirlines = totalAirlines - activeAirlines

  const stats = [
    {
      title: "Tổng hãng hàng không",
      value: totalAirlines,
      description: "Tất cả hãng hàng không",
      icon: <Building className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Đang hoạt động",
      value: activeAirlines,
      description: "Hãng đang hoạt động",
      icon: <Building className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Tạm ngừng",
      value: inactiveAirlines,
      description: "Hãng tạm ngừng",
      icon: <Building className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Tỷ lệ hoạt động",
      value: totalAirlines > 0 ? `${Math.round((activeAirlines / totalAirlines) * 100)}%` : "0%",
      description: "Phần trăm hãng hoạt động",
      icon: <Building className="h-4 w-4 text-muted-foreground" />
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