"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BedDouble, 
  Calendar,
  Star,
  Activity
} from "lucide-react"
import type { Hotel, Room } from "@/types/api"

interface HotelStatisticsProps {
  hotel: Hotel
  rooms: Room[]
}

export function HotelStatistics({ hotel, rooms }: HotelStatisticsProps) {
  // Calculate statistics
  const totalRooms = rooms.length
  const availableRooms = rooms.filter(r => r.isAvailable).length
  const occupancyRate = totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms) * 100 : 0
  const averagePrice = rooms.length > 0 
    ? rooms.reduce((acc, room) => acc + room.price, 0) / rooms.length
    : 0
  const minPrice = rooms.length > 0 
    ? Math.min(...rooms.map(r => r.price))
    : 0
  const maxPrice = rooms.length > 0
    ? Math.max(...rooms.map(r => r.price))
    : 0
  const totalCapacity = rooms.reduce((acc, room) => acc + room.maxOccupancy, 0)
  
  // Room type distribution
  const roomTypes = rooms.reduce((acc, room) => {
    const type = room.bedType || "Không xác định"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số phòng</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              {availableRooms} phòng có sẵn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(occupancyRate)}</div>
            <Progress value={occupancyRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giá trung bình</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averagePrice)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sức chứa tối đa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số khách
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Room Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Phân bố loại phòng</CardTitle>
            <CardDescription>Thống kê theo loại giường</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(roomTypes).map(([type, count]) => {
                const percentage = (count / totalRooms) * 100
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{count} phòng</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatPercentage(percentage)}
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê giá phòng</CardTitle>
            <CardDescription>Phân tích khoảng giá</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Giá thấp nhất</p>
                  <p className="text-xl font-semibold text-green-600">
                    {formatCurrency(minPrice)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Giá cao nhất</p>
                  <p className="text-xl font-semibold text-red-600">
                    {formatCurrency(maxPrice)}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Giá trung bình</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(averagePrice)}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">Phân bố giá</p>
                <div className="space-y-2">
                  {[
                    { label: "Dưới 1tr", min: 0, max: 1000000 },
                    { label: "1tr - 2tr", min: 1000000, max: 2000000 },
                    { label: "2tr - 5tr", min: 2000000, max: 5000000 },
                    { label: "Trên 5tr", min: 5000000, max: Infinity },
                  ].map(range => {
                    const count = rooms.filter(r => r.price >= range.min && r.price < range.max).length
                    const percentage = totalRooms > 0 ? (count / totalRooms) * 100 : 0
                    return (
                      <div key={range.label} className="flex items-center justify-between">
                        <span className="text-sm">{range.label}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-24 h-2" />
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hotel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất khách sạn</CardTitle>
          <CardDescription>Các chỉ số hoạt động chính</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Đánh giá</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-bold">{hotel.starRating || 0}/5</span>
                </div>
              </div>
              <Progress value={(hotel.starRating || 0) * 20} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Phòng trống</span>
                <span className="font-bold">{availableRooms}/{totalRooms}</span>
              </div>
              <Progress 
                value={totalRooms > 0 ? (availableRooms / totalRooms) * 100 : 0} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tiện nghi</span>
                <span className="font-bold">{hotel.amenities?.length || 0}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {hotel.amenities?.slice(0, 5).map(amenity => (
                  <Badge key={amenity.id} variant="outline" className="text-xs">
                    {amenity.name}
                  </Badge>
                ))}
                {hotel.amenities && hotel.amenities.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{hotel.amenities.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
