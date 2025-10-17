"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Star, Bed } from "lucide-react"
import type { Hotel, PaginatedResponse } from "@/types/api"

interface HotelStatsProps {
  hotels: PaginatedResponse<Hotel> | null
  formatPrice: (price: number) => string
}

export function HotelStats({ hotels, formatPrice }: HotelStatsProps) {
  const content = hotels?.content || []

  const totalHotels = hotels?.totalElements || 0
  const activeHotels = content.filter((h) => h.status !== "INACTIVE").length
  const totalRooms = content.reduce((sum, hotel) => sum + (hotel.availableRooms || 0), 0)
  const avgRating = content.length
    ? (content.reduce((sum, hotel) => sum + (hotel.starRating || 0), 0) / content.length).toFixed(1)
    : "0.0"

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng khách sạn</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHotels}</div>
          <p className="text-xs text-muted-foreground">Đã đăng ký</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeHotels}</div>
          <p className="text-xs text-muted-foreground">
            {totalHotels ? Math.round((activeHotels / totalHotels) * 100) : 0}% tổng số
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng phòng</CardTitle>
          <Bed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRooms}</div>
          <p className="text-xs text-muted-foreground">Trên tất cả khách sạn</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đánh giá TB</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgRating}</div>
          <p className="text-xs text-muted-foreground">Trung bình</p>
        </CardContent>
      </Card>
    </div>
  )
}
