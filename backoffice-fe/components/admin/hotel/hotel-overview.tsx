"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, Building2, Users, Bed, Calendar } from "lucide-react"
import type { Hotel } from "@/types/api"

interface HotelOverviewProps {
  hotel: Hotel
  formatPrice: (price: number) => string
}

export function HotelOverview({ hotel, formatPrice }: HotelOverviewProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const getStatusBadge = (status?: string) => {
    if (!status || status === "ACTIVE") {
      return <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
    }
    if (status === "INACTIVE") {
      return <Badge className="bg-gray-100 text-gray-800">Tạm ngưng</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Thông tin cơ bản
          </CardTitle>
          <CardDescription>Thông tin chi tiết về khách sạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Tên khách sạn</label>
              <p className="text-base font-semibold">{hotel.name}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Đánh giá sao</label>
              <div className="flex items-center space-x-1">
                {renderStars(hotel.starRating || 0)}
                <span className="text-sm text-gray-600 ml-1">({hotel.starRating || 0} sao)</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Trạng thái</label>
              {getStatusBadge(hotel.status)}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Thành phố</label>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                <p className="text-base">{hotel.city}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Quốc gia</label>
              <p className="text-base">{hotel.country}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Số phòng có sẵn</label>
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4 text-gray-500" />
                <p className="text-base">{hotel.availableRooms || 0} phòng</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Địa chỉ đầy đủ</label>
            <p className="text-base">{hotel.address}</p>
          </div>
          
          {hotel.description && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                <p className="text-base text-gray-700 leading-relaxed">{hotel.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pricing Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin giá cả</CardTitle>
            <CardDescription>Giá phòng và đánh giá</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Giá thấp nhất:</span>
                <span className="font-semibold text-lg text-green-600">
                  {hotel.minPrice ? formatPrice(hotel.minPrice) : "Chưa có"}
                </span>
              </div>
              
              {hotel.maxPrice && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Giá cao nhất:</span>
                  <span className="font-semibold text-lg text-blue-600">
                    {formatPrice(hotel.maxPrice)}
                  </span>
                </div>
              )}
              
              {hotel.averageRating && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Điểm đánh giá TB:</span>
                  <span className="font-semibold">
                    {hotel.averageRating.toFixed(1)}/5.0
                  </span>
                </div>
              )}
              
              {hotel.totalReviews && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Số lượt đánh giá:</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{hotel.totalReviews}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin hệ thống</CardTitle>
            <CardDescription>Thông tin quản lý và theo dõi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">ID khách sạn:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {hotel.id}
                </span>
              </div>
              
              {hotel.createdAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Ngày tạo:</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {new Date(hotel.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              )}
              
              {hotel.updatedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Cập nhật cuối:</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {new Date(hotel.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              )}
              
              {hotel.latitude && hotel.longitude && (
                <div className="space-y-1">
                  <span className="text-sm text-gray-500">Tọa độ:</span>
                  <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                    <div>Lat: {hotel.latitude}</div>
                    <div>Lng: {hotel.longitude}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Amenities */}
      {hotel.amenities && hotel.amenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tiện nghi khách sạn</CardTitle>
            <CardDescription>Các tiện nghi hiện có tại khách sạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity) => (
                <Badge key={amenity.id} variant="outline" className="text-sm">
                  {amenity.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {hotel.images && hotel.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hình ảnh khách sạn</CardTitle>
            <CardDescription>Hình ảnh hiện tại của khách sạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {hotel.images.slice(0, 8).map((image, index) => (
                <div key={index} className="aspect-video bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Hình {index + 1}</span>
                </div>
              ))}
            </div>
            {hotel.images.length > 8 && (
              <p className="text-sm text-gray-500 mt-2">
                và {hotel.images.length - 8} hình ảnh khác...
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
