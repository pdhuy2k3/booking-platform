"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InfiniteScrollSelect,
  InfiniteScrollSelectContent,
  InfiniteScrollSelectItem,
  InfiniteScrollSelectTrigger,
  InfiniteScrollSelectValue,
} from "@/components/ui/infinite-scroll-select"
import type { Airline, Airport } from "@/types/api"

interface FlightFormData {
  flightNumber: string
  airlineId: string
  departureAirportId: string
  arrivalAirportId: string
  aircraftType: string
  basePrice: string
  baseDurationMinutes: string
  status: string
  isActive: boolean
}

interface FlightFormDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  form: FlightFormData
  onFormChange: (form: FlightFormData) => void
  airlines: Airline[]
  airports: Airport[]
  loadingFormData: boolean
  submitting: boolean
  onSubmit: () => void
  submitLabel: string
  // Infinite scroll handlers
  onAirlineSearch: (term: string) => void
  onAirportSearch: (term: string) => void
  onLoadMoreAirlines: () => void
  onLoadMoreAirports: () => void
  hasMoreAirlines: boolean
  hasMoreAirports: boolean
  loadingMoreAirlines: boolean
  loadingMoreAirports: boolean
  airlineSearchTerm: string
  airportSearchTerm: string
}

export function FlightFormDialog({
  isOpen,
  onClose,
  title,
  description,
  form,
  onFormChange,
  airlines,
  airports,
  loadingFormData,
  submitting,
  onSubmit,
  submitLabel,
  onAirlineSearch,
  onAirportSearch,
  onLoadMoreAirlines,
  onLoadMoreAirports,
  hasMoreAirlines,
  hasMoreAirports,
  loadingMoreAirlines,
  loadingMoreAirports,
  airlineSearchTerm,
  airportSearchTerm
}: FlightFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {loadingFormData ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flightNumber">Mã chuyến bay *</Label>
              <Input
                id="flightNumber"
                placeholder="VN001"
                value={form.flightNumber}
                onChange={(e) => onFormChange({...form, flightNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aircraftType">Loại máy bay</Label>
              <Input
                id="aircraftType"
                placeholder="Boeing 777"
                value={form.aircraftType}
                onChange={(e) => onFormChange({...form, aircraftType: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airline">Hãng hàng không *</Label>
              <InfiniteScrollSelect value={form.airlineId} onValueChange={(value) => onFormChange({...form, airlineId: value})}>
                <InfiniteScrollSelectTrigger>
                  <InfiniteScrollSelectValue placeholder="Chọn hãng hàng không" />
                </InfiniteScrollSelectTrigger>
                <InfiniteScrollSelectContent
                  searchPlaceholder="Tìm hãng hàng không..."
                  onSearchChange={onAirlineSearch}
                  onLoadMore={onLoadMoreAirlines}
                  hasMore={hasMoreAirlines}
                  loading={loadingMoreAirlines}
                  searchValue={airlineSearchTerm}
                >
                  {airlines.map((airline) => (
                    <InfiniteScrollSelectItem key={airline.id} value={airline.id.toString()}>
                      {airline.name} ({airline.code})
                    </InfiniteScrollSelectItem>
                  ))}
                </InfiniteScrollSelectContent>
              </InfiniteScrollSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrice">Giá cơ bản (VND)</Label>
              <Input
                id="basePrice"
                type="number"
                placeholder="2500000"
                value={form.basePrice}
                onChange={(e) => onFormChange({...form, basePrice: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureAirport">Sân bay đi *</Label>
              <InfiniteScrollSelect value={form.departureAirportId} onValueChange={(value) => onFormChange({...form, departureAirportId: value})}>
                <InfiniteScrollSelectTrigger>
                  <InfiniteScrollSelectValue placeholder="Chọn sân bay đi" />
                </InfiniteScrollSelectTrigger>
                <InfiniteScrollSelectContent
                  searchPlaceholder="Tìm sân bay đi..."
                  onSearchChange={onAirportSearch}
                  onLoadMore={onLoadMoreAirports}
                  hasMore={hasMoreAirports}
                  loading={loadingMoreAirports}
                  searchValue={airportSearchTerm}
                >
                  {airports.map((airport) => (
                    <InfiniteScrollSelectItem key={airport.id} value={airport.id.toString()}>
                      {airport.code} - {airport.name}
                    </InfiniteScrollSelectItem>
                  ))}
                </InfiniteScrollSelectContent>
              </InfiniteScrollSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalAirport">Sân bay đến *</Label>
              <InfiniteScrollSelect value={form.arrivalAirportId} onValueChange={(value) => onFormChange({...form, arrivalAirportId: value})}>
                <InfiniteScrollSelectTrigger>
                  <InfiniteScrollSelectValue placeholder="Chọn sân bay đến" />
                </InfiniteScrollSelectTrigger>
                <InfiniteScrollSelectContent
                  searchPlaceholder="Tìm sân bay đến..."
                  onSearchChange={onAirportSearch}
                  onLoadMore={onLoadMoreAirports}
                  hasMore={hasMoreAirports}
                  loading={loadingMoreAirports}
                  searchValue={airportSearchTerm}
                >
                  {airports.map((airport) => (
                    <InfiniteScrollSelectItem key={airport.id} value={airport.id.toString()}>
                      {airport.code} - {airport.name}
                    </InfiniteScrollSelectItem>
                  ))}
                </InfiniteScrollSelectContent>
              </InfiniteScrollSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseDuration">Thời gian bay (phút)</Label>
              <Input
                id="baseDuration"
                type="number"
                placeholder="120"
                value={form.baseDurationMinutes}
                onChange={(e) => onFormChange({...form, baseDurationMinutes: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái chuyến bay</Label>
              <Select value={form.status} onValueChange={(value) => onFormChange({...form, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="ON_TIME">Đúng giờ</SelectItem>
                  <SelectItem value="DELAYED">Tạm hoãn</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={submitting || loadingFormData}
            onClick={onSubmit}
          >
            {submitting ? "Đang xử lý..." : submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
