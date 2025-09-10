"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star, Settings } from "lucide-react"
import type { Hotel, MediaResponse } from "@/types/api"
import { mediaService } from "@/services/media-service"

interface HotelViewDialogProps {
  isOpen: boolean
  onClose: () => void
  hotel: Hotel | null
  onNavigateToDetails: (hotelId: number) => void
  formatPrice: (price: number) => string
}

export function HotelViewDialog({
  isOpen,
  onClose,
  hotel,
  onNavigateToDetails,
  formatPrice
}: HotelViewDialogProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const renderHotelImages = (medias: MediaResponse[] | undefined) => {
    if (!medias || medias.length === 0) {
      return (
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
          <span className="text-gray-500">Không có hình ảnh</span>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {medias.slice(0, 4).map((media, index) => {
          // Use the media service to generate an optimized Cloudinary URL
          // The mediaService expects the full path format /api/media/{publicId}
          const imageUrl = media.secureUrl

          return (
            <img
              key={index}
              src={imageUrl}
              alt={`Hotel image ${index + 1}`}
              className="w-full h-32 object-cover rounded-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23e5e7eb'/%3E%3C/svg%3E"
              }}
            />
          )
        })}
        {medias.length > 4 && (
          <div className="relative">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32 flex items-center justify-center">
              <span className="text-gray-500">+{medias.length - 4} ảnh nữa</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!hotel) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết khách sạn</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về khách sạn
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              {renderHotelImages(hotel.media)}
            </div>
            <div>
              <Label className="text-sm text-gray-500">Tên khách sạn</Label>
              <p className="font-medium">{hotel.name}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Đánh giá</Label>
              <div className="flex items-center space-x-1">
                {renderStars(hotel.starRating || 0)}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Thành phố</Label>
              <p className="font-medium">{hotel.city}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Quốc gia</Label>
              <p className="font-medium">{hotel.country}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-sm text-gray-500">Địa chỉ</Label>
              <p className="font-medium">{hotel.address}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-sm text-gray-500">Mô tả</Label>
              <p className="font-medium">{hotel.description || "Chưa có mô tả"}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Số phòng có sẵn</Label>
              <p className="font-medium">{hotel.availableRooms || 0} phòng</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Giá thấp nhất</Label>
              <p className="font-medium">
                {hotel.minPrice ? formatPrice(hotel.minPrice) : "Chưa có"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={() => {
            onClose()
            onNavigateToDetails(hotel.id)
          }}>
            <Settings className="w-4 h-4 mr-2" />
            Quản lý phòng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}