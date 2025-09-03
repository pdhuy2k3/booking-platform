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
import type { Hotel } from "@/types/api"

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
