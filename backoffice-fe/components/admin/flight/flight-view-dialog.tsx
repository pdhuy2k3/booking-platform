"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Flight } from "@/types/api"

interface FlightViewDialogProps {
  isOpen: boolean
  onClose: () => void
  flight: Flight | null
  formatPrice: (price: number) => string
}

export function FlightViewDialog({
  isOpen,
  onClose,
  flight,
  formatPrice
}: FlightViewDialogProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      case "DELAYED":
        return <Badge className="bg-yellow-100 text-yellow-800">Tạm hoãn</Badge>
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      case "ON_TIME":
        return <Badge className="bg-blue-100 text-blue-800">Đúng giờ</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Không xác định</Badge>
    }
  }

  if (!flight) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết chuyến bay</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết của chuyến bay {flight.flightNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label className="font-semibold">Mã chuyến bay</Label>
            <div className="text-sm">{flight.flightNumber}</div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Hãng hàng không</Label>
            <div className="text-sm">{flight.airline?.name || 'N/A'}</div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Sân bay đi</Label>
            <div className="text-sm">
              {flight.departureAirport?.code} - {flight.departureAirport?.name}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Sân bay đến</Label>
            <div className="text-sm">
              {flight.arrivalAirport?.code} - {flight.arrivalAirport?.name}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Thời gian bay</Label>
            <div className="text-sm">
              {flight.baseDurationMinutes
                ? `${Math.floor(flight.baseDurationMinutes / 60)}h ${flight.baseDurationMinutes % 60}m`
                : 'N/A'}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Loại máy bay</Label>
            <div className="text-sm">{flight.aircraftType || 'N/A'}</div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Giá cơ bản</Label>
            <div className="text-sm font-medium">
              {flight.basePrice ? formatPrice(flight.basePrice) : 'N/A'}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Trạng thái hoạt động</Label>
            <div>{flight.isActive ? getStatusBadge('ACTIVE') : getStatusBadge('CANCELLED')}</div>
          </div>
          <div className="space-y-2 col-span-2">
            <Label className="font-semibold">Trạng thái chuyến bay</Label>
            <div>{getStatusBadge(flight.status)}</div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
