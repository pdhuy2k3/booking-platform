"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { MediaSelector } from "@/components/ui/media-selector"
import type { MediaResponse } from "@/types/api"

interface HotelFormData {
  name: string
  description: string
  address: string
  city: string
  country: string
  starRating: number
  latitude?: number
  longitude?: number
  media?: MediaResponse[]
}

interface HotelFormDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  hotel: HotelFormData
  onHotelChange: (hotel: HotelFormData) => void
  media?: MediaResponse[]
  onMediaChange?: (media: MediaResponse[]) => void
  primaryImage?: string | null
  onPrimaryImageChange?: (primaryImage: string | null) => void
  onSubmit: () => void
  submitLabel: string
}

export function HotelFormDialog({
  isOpen,
  onClose,
  title,
  description,
  hotel,
  onHotelChange,
  media = [],
  onMediaChange,
  primaryImage,
  onPrimaryImageChange,
  onSubmit,
  submitLabel
}: HotelFormDialogProps) {
  // Extract image URLs from media for MediaSelector
  const imageUrls = media?.map(m => m.url) || []
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="hotelName">Tên khách sạn</Label>
            <Input
              id="hotelName"
              placeholder="Lotte Hotel Hanoi"
              value={hotel.name}
              onChange={(e) => onHotelChange({...hotel, name: e.target.value})}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Khách sạn 5 sao sang trọng..."
              value={hotel.description}
              onChange={(e) => onHotelChange({...hotel, description: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Thành phố</Label>
            <Input
              id="city"
              placeholder="Hà Nội"
              value={hotel.city}
              onChange={(e) => onHotelChange({...hotel, city: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Quốc gia</Label>
            <Input
              id="country"
              placeholder="Việt Nam"
              value={hotel.country}
              onChange={(e) => onHotelChange({...hotel, country: e.target.value})}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              placeholder="54 Liễu Giai, Ba Đình"
              value={hotel.address}
              onChange={(e) => onHotelChange({...hotel, address: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Đánh giá</Label>
            <Select
              value={hotel.starRating.toString()}
              onValueChange={(value) => onHotelChange({...hotel, starRating: parseInt(value)})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn số sao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 sao</SelectItem>
                <SelectItem value="2">2 sao</SelectItem>
                <SelectItem value="3">3 sao</SelectItem>
                <SelectItem value="4">4 sao</SelectItem>
                <SelectItem value="5">5 sao</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Vĩ độ (Latitude)</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                placeholder="21.028511"
                value={hotel.latitude || ""}
                onChange={(e) => onHotelChange({...hotel, latitude: e.target.value ? parseFloat(e.target.value) : undefined})}
              />
              <p className="text-xs text-gray-500">Phạm vi: -90 đến 90</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Kinh độ (Longitude)</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                placeholder="105.804817"
                value={hotel.longitude || ""}
                onChange={(e) => onHotelChange({...hotel, longitude: e.target.value ? parseFloat(e.target.value) : undefined})}
              />
              <p className="text-xs text-gray-500">Phạm vi: -180 đến 180</p>
            </div>
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Hình ảnh khách sạn</Label>
            <MediaSelector
              value={media}
              onMediaChange={onMediaChange}
              onPrimaryChange={onPrimaryImageChange}
              primaryImage={primaryImage}
              folder="hotels"
              maxSelection={5}
              allowUpload={true}
              mode="publicIds"
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={onSubmit}>{submitLabel}</Button>
          </div>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  )
}
