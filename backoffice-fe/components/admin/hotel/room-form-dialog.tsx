"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Room, RoomType, Amenity } from "@/types/api"

interface RoomFormData {
  roomNumber: string
  description: string
  price: number
  maxOccupancy: number
  bedType: string
  roomSize: number
  isAvailable: boolean
  roomTypeId: number | null
  amenityIds: number[]
}

interface RoomFormDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  room: RoomFormData
  onRoomChange: (room: RoomFormData) => void
  roomTypes: RoomType[]
  amenities: Amenity[]
  onSubmit: () => void
  submitLabel: string
  formatPrice: (price: number) => string
}

export function RoomFormDialog({
  isOpen,
  onClose,
  title,
  description,
  room,
  onRoomChange,
  roomTypes,
  amenities,
  onSubmit,
  submitLabel,
  formatPrice
}: RoomFormDialogProps) {
  const isFormValid = room.roomNumber.trim() && room.roomTypeId && room.price && room.price > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="roomNumber">Số phòng *</Label>
            <Input
              id="roomNumber"
              placeholder="101"
              value={room.roomNumber}
              onChange={(e) => onRoomChange({...room, roomNumber: e.target.value})}
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="roomType">Loại phòng *</Label>
            <Select
              value={room.roomTypeId?.toString() || ""}
              onValueChange={(value) => onRoomChange({...room, roomTypeId: value ? Number(value) : null})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại phòng" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((roomType) => (
                  <SelectItem key={roomType.id} value={roomType.id.toString()}>
                    {roomType.name} {roomType.basePrice ? `(${formatPrice(roomType.basePrice)})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả phòng..."
              value={room.description}
              onChange={(e) => onRoomChange({...room, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Giá (VND) *</Label>
            <Input
              id="price"
              type="number"
              placeholder="1500000"
              value={room.price}
              onChange={(e) => onRoomChange({...room, price: Number(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxOccupancy">Số người tối đa</Label>
            <Input
              id="maxOccupancy"
              type="number"
              placeholder="2"
              value={room.maxOccupancy}
              onChange={(e) => onRoomChange({...room, maxOccupancy: Number(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedType">Loại giường</Label>
            <Input
              id="bedType"
              placeholder="Giường đôi"
              value={room.bedType}
              onChange={(e) => onRoomChange({...room, bedType: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomSize">Diện tích (m²)</Label>
            <Input
              id="roomSize"
              type="number"
              placeholder="25"
              value={room.roomSize}
              onChange={(e) => onRoomChange({...room, roomSize: Number(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isAvailable">Trạng thái</Label>
            <Select
              value={room.isAvailable ? "available" : "unavailable"}
              onValueChange={(value) => onRoomChange({...room, isAvailable: value === "available"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Có sẵn</SelectItem>
                <SelectItem value="unavailable">Không sẵn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Tiện nghi phòng</Label>
            <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity.id}`}
                      checked={room.amenityIds.includes(amenity.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onRoomChange({...room, amenityIds: [...room.amenityIds, amenity.id]})
                        } else {
                          onRoomChange({...room, amenityIds: room.amenityIds.filter(id => id !== amenity.id)})
                        }
                      }}
                    />
                    <Label
                      htmlFor={`amenity-${amenity.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {amenity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!isFormValid}
          >
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
