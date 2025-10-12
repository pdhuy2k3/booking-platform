"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { X, Plane, Clock, Star, Wifi, Coffee, Tv, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { flightService } from "../service"
import type { FlightDetails } from "../type"
import { formatPrice } from "@/lib/currency"
import { formatBookingDateTime } from "@/lib/date-format"
import { useDateFormatter } from "@/hooks/use-date-formatter"

const seatClassLabels: Record<string, string> = {
  ECONOMY: "Phổ thông",
  PREMIUM_ECONOMY: "Phổ thông cao cấp",
  BUSINESS: "Thương gia",
  FIRST: "Hạng nhất",
}

const formatSeatClass = (seatClass?: string) => {
  if (!seatClass) return "Phổ thông"
  const key = seatClass.toUpperCase()
  return seatClassLabels[key] || key
}

const formatTimeLabel = (value?: string) => {
  if (!value) return "Chưa có"
  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  }
  return value
}

interface FlightDetailsModalProps {
  flightId: string | null
  seatClass: string | null
  departureDateTime: string | null
  scheduleId?: string | null
  fareId?: string | null
  isOpen: boolean
  onClose: () => void
  onBookFlight?: (flight: FlightDetails) => void
  canBook?: boolean
  onPromptSearch?: () => void
}

export default function FlightDetailsModal({
  flightId,
  seatClass,
  departureDateTime,
  scheduleId,
  fareId,
  isOpen,
  onClose,
  onBookFlight,
  canBook = true,
  onPromptSearch,
}: FlightDetailsModalProps) {
  const [flight, setFlight] = useState<FlightDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { timezone, language } = useDateFormatter()

  // Fetch flight details when modal opens and flightId is provided
  useEffect(() => {
    if (!isOpen || !flightId) {
      setFlight(null)
      return
    }

    const fetchDetails = async () => {
      setLoading(true)
      setError(null)

      const params: {
        seatClass?: string
        departureDateTime?: string
        scheduleId?: string
        fareId?: string
      } = {}

      if (fareId) params.fareId = fareId
      if (scheduleId) params.scheduleId = scheduleId
      if (seatClass) params.seatClass = seatClass
      if (departureDateTime) params.departureDateTime = departureDateTime

      try {
        if (params.fareId || params.scheduleId || params.seatClass || params.departureDateTime) {
          const flightData = await flightService.getFareDetails(flightId, params)
          setFlight(flightData)
        } else {
          const flightData = await flightService.get(flightId)
          setFlight(flightData)
        }
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin chuyến bay')
      } finally {
        setLoading(false)
      }
    }

    void fetchDetails()
  }, [isOpen, flightId, seatClass, departureDateTime, scheduleId, fareId])

  if (!isOpen || !flightId) return null

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-[90%] h-[90%] bg-background rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải thông tin chuyến bay...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !flight) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-[90%] h-[90%] bg-background rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || "Không tìm thấy chuyến bay"}</p>
              <Button onClick={onClose}>Đóng</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const departureDateValue = flight.departureDateTime || flight.departureTime
  const arrivalDateValue = flight.arrivalDateTime || flight.arrivalTime

  const amenities = [
    { icon: Wifi, label: "Wi-Fi" },
    { icon: Coffee, label: "Đồ uống" },
    { icon: Tv, label: "Giải trí" },
    { icon: Utensils, label: "Dịch vụ ăn uống" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[90%] h-[90%] bg-background rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-4">
              <div className="relative w-10 h-10">
                <Image 
                  src={flight.airlineLogo || "/airplane-generic.png"} 
                  alt={flight.airline} 
                  fill 
                  className="object-contain" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/airplane-generic.png";
                  }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{flight.airline}</h2>
                <p className="text-muted-foreground">Hạng {formatSeatClass(flight.seatClass)}</p>
              </div>
            </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(100%-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Flight Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Chi tiết chuyến bay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">{formatTimeLabel(departureDateValue)}</div>
                      <div className="text-lg font-medium text-muted-foreground">{flight.origin}</div>
                      <div className="text-sm text-muted-foreground">{formatBookingDateTime(departureDateValue, { locale: language, timeZone: timezone })}</div>
                    </div>

                    <div className="flex flex-col items-center px-8">
                      <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">{flight.duration}</span>
                      </div>
                      <div className="w-32 h-px bg-border relative">
                        <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary bg-background" />
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">Bay thẳng</div>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">{formatTimeLabel(arrivalDateValue)}</div>
                      <div className="text-lg font-medium text-muted-foreground">{flight.destination}</div>
                      <div className="text-sm text-muted-foreground">{formatBookingDateTime(arrivalDateValue, { locale: language, timeZone: timezone })}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Số hiệu chuyến bay:</span>
                      <span className="ml-2 font-medium">{flight.flightNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Loại máy bay:</span>
                      <span className="ml-2 font-medium">Boeing 777-300ER</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ghế còn trống:</span>
                      <span className="ml-2 font-medium">{flight.availableSeats}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tiền tệ:</span>
                      <span className="ml-2 font-medium">{flight.currency}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Tiện nghi & Dịch vụ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                        <amenity.icon className="h-8 w-8 text-primary mb-2" />
                        <span className="text-sm font-medium">{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fare Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>Quy định & Chính sách</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Chính sách hủy vé</h4>
                    <p className="text-sm text-muted-foreground">
                      Hủy miễn phí trước 24 giờ khởi hành. Phí hủy có thể áp dụng sau thời gian này.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Chính sách đổi vé</h4>
                    <p className="text-sm text-muted-foreground">
                      Đổi vé được phép với phí 200$ cộng chênh lệch giá vé. Đổi vé trong ngày có sẵn với phí 75$.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Chính sách hành lý</h4>
                    <p className="text-sm text-muted-foreground">
                      Bao gồm 1 túi xách tay và 1 vật dụng cá nhân. Hành lý ký gửi đầu tiên được bao gồm cho giá vé này.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-0">
                <CardHeader>
                  <CardTitle>Tóm tắt đặt vé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{formatPrice(Number(flight.price ?? 0))}</div>
                    <div className="text-sm text-muted-foreground">mỗi người</div>
                  </div>

                  <div className="border-t border-border pt-2 flex justify-between font-medium text-sm">
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(Number(flight.price ?? 0))}</span>
                  </div>

                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-full justify-center">
                      Hạng {formatSeatClass(flight.seatClass)}
                    </Badge>
                    <Badge variant="outline" className="w-full justify-center">
                      Có thể hoàn tiền
                    </Badge>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!canBook}
                    onClick={() => {
                      if (!canBook) {
                        onPromptSearch?.()
                        return
                      }
                      onBookFlight?.(flight)
                    }}
                  >
                    Đặt ngay
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    Giá có thể thay đổi dựa trên tình trạng còn chỗ
                  </div>
                  {!canBook && (
                    <div className="text-xs text-destructive text-center">
                      Vui lòng hoàn tất tìm kiếm để tiếp tục đặt chỗ
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
