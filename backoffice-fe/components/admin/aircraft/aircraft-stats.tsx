"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane } from "lucide-react"
import type { Aircraft, PaginatedResponse } from "@/types/api"

interface AircraftStatsProps {
  data: PaginatedResponse<Aircraft> | null
}

export function AircraftStats({ data }: AircraftStatsProps) {
  const totalAircraft = data?.totalElements || 0
  const activeAircraft = data?.content?.filter(a => a.isActive).length || 0
  const inactiveAircraft = totalAircraft - activeAircraft

  // Get most common model
  const modelCounts = data?.content?.reduce((acc, aircraft) => {
    const model = aircraft.model || 'Unknown'
    acc[model] = (acc[model] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}
  
  const mostCommonModel = Object.entries(modelCounts).reduce((a, b) => 
    modelCounts[a[0]] > modelCounts[b[0]] ? a : b, ['Boeing 737', 0]
  )[0]

  const stats = [
    {
      title: "Tổng máy bay",
      value: totalAircraft,
      description: "Tất cả máy bay",
      icon: <Plane className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Máy bay hoạt động",
      value: activeAircraft,
      description: "Đang hoạt động",
      icon: <Plane className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Máy bay không hoạt động",
      value: inactiveAircraft,
      description: "Không hoạt động",
      icon: <Plane className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Model phổ biến",
      value: mostCommonModel,
      description: "Model phổ biến nhất",
      icon: <Plane className="h-4 w-4 text-muted-foreground" />
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
