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
import type { Flight } from "@/types/api"
import { Badge } from "@/components/ui/badge"
import { getFlightDurationRangeDisplay } from "@/lib/duration-utils"

interface FlightViewDialogProps {
  isOpen: boolean
  onClose: () => void
  flight: Flight | null
  getStatusBadge: (status: string) => React.JSX.Element
}

export function FlightViewDialog({
  isOpen,
  onClose,
  flight,
  getStatusBadge
}: FlightViewDialogProps) {
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
            <div className="text-sm">{flight.airlineName || 'N/A'}</div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Sân bay đi</Label>
            <div className="text-sm">
              {flight.departureAirportIataCode} - {flight.departureAirportName || 'N/A'}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Sân bay đến</Label>
            <div className="text-sm">
              {flight.arrivalAirportIataCode} - {flight.arrivalAirportName || 'N/A'}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Thời gian bay</Label>
            <div className="text-sm">
              {getFlightDurationRangeDisplay(flight)}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Loại máy bay</Label>
            <div className="text-sm">{flight.aircraftType || 'N/A'}</div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Trạng thái hoạt động</Label>
            <div>{flight.isActive ? getStatusBadge('ACTIVE') : getStatusBadge('CANCELLED')}</div>
          </div>
          <div className="space-y-2 col-span-2">
            <Label className="font-semibold">Trạng thái chuyến bay</Label>
            <div>{getStatusBadge(flight.status || 'UNKNOWN')}</div>
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