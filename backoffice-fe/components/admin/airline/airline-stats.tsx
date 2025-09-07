"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building } from "lucide-react"
import type { Airline, PaginatedResponse } from "@/types/api"

interface AirlineStatsProps {
  airlines: PaginatedResponse<Airline> | null
}

export function AirlineStats({ airlines }: AirlineStatsProps) {
  const totalAirlines = airlines?.totalElements || 0
  const activeAirlines = airlines?.content.filter(a => a.isActive).length || 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng hãng hàng không</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAirlines}</div>
          <p className="text-xs text-muted-foreground">Tất cả hãng hàng không</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeAirlines}</div>
          <p className="text-xs text-muted-foreground">Hãng đang hoạt động</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tạm ngừng</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAirlines - activeAirlines}</div>
          <p className="text-xs text-muted-foreground">Hãng tạm ngừng</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tỷ lệ hoạt động</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalAirlines ? Math.round((activeAirlines / totalAirlines) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">Hãng đang hoạt động</p>
        </CardContent>
      </Card>
    </div>
  )
}
