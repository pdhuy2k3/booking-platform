"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { X, MapPin, Star, Wifi, Car, Coffee, Dumbbell, Building2, Calendar, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { hotelService } from "../service"
import type { HotelDetails } from "../type"
import { formatPrice } from "@/lib/currency"

interface HotelDetailsModalProps {
  hotelId: string | null
  isOpen: boolean
  onClose: () => void
  onBookRoom?: (payload: { hotel: HotelDetails; room: any; checkInDate?: string; checkOutDate?: string }) => void
  canBook?: boolean
  onPromptSearch?: () => void
  checkInDate?: string
  checkOutDate?: string
  guestCount?: number
  roomCount?: number
}

export default function HotelDetailsModal({
  hotelId,
  isOpen,
  onClose,
  onBookRoom,
  canBook = true,
  onPromptSearch,
  checkInDate,
  checkOutDate,
  guestCount,
  roomCount,
}: HotelDetailsModalProps) {
  const [selectedRoom, setSelectedRoom] = useState("standard")
  const [hotel, setHotel] = useState<HotelDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch hotel details when modal opens and hotelId is provided
  useEffect(() => {
    if (isOpen && hotelId) {
      setLoading(true)
      setError(null)
      hotelService.get(hotelId, checkInDate, checkOutDate)
        .then((hotelData) => {
          setHotel(hotelData)
        })
        .catch((err) => {
          setError(err.message || "Failed to load hotel details")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setHotel(null)
    }
  }, [isOpen, hotelId, checkInDate, checkOutDate])

  useEffect(() => {
    if (hotel?.roomTypes && hotel.roomTypes.length > 0) {
      setSelectedRoom(hotel.roomTypes[0].id)
    } else {
      setSelectedRoom("standard")
    }
  }, [hotel])

  if (!isOpen || !hotelId) return null

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-[90%] h-[90%] bg-background rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading hotel details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-[90%] h-[90%] bg-background rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || "Hotel not found"}</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Use real room types from API response, fallback to mock data if not available
  const roomTypes = hotel.roomTypes && hotel.roomTypes.length > 0 
    ? hotel.roomTypes.map((roomType: any) => ({
        id: roomType.id,
        name: roomType.name,
        price: roomType.basePrice,
        originalPrice: Math.round(roomType.basePrice * 1.2),
        features: roomType.features || ["Queen bed", "City view", "25 sqm", "Free WiFi"],
        image: roomType.image || hotel.images?.[0] || "/placeholder.svg?height=200&width=300",
      }))
    : [
        {
          id: "standard",
          name: "Standard Room",
          price: hotel.pricePerNight,
          originalPrice: Math.round(hotel.pricePerNight * 1.2),
          features: ["Queen bed", "City view", "25 sqm", "Free WiFi"],
          image: hotel.images?.[0] || "/placeholder.svg?height=200&width=300",
        },
        {
          id: "deluxe",
          name: "Deluxe Room",
          price: hotel.pricePerNight + 500000,
          originalPrice: Math.round((hotel.pricePerNight + 500000) * 1.2),
          features: ["King bed", "Balcony", "35 sqm", "Mini bar", "Free WiFi"],
          image: hotel.images?.[1] || hotel.images?.[0] || "/placeholder.svg?height=200&width=300",
        },
        {
          id: "suite",
          name: "Executive Suite",
          price: hotel.pricePerNight + 1200000,
          originalPrice: Math.round((hotel.pricePerNight + 1200000) * 1.2),
          features: ["King bed", "Separate living area", "50 sqm", "City view", "Mini bar", "Free WiFi"],
          image: hotel.images?.[2] || hotel.images?.[0] || "/placeholder.svg?height=200&width=300",
        },
      ]

  const amenityIcons: { [key: string]: any } = {
    "Free WiFi": Wifi,
    Parking: Car,
    Restaurant: Coffee,
    "Fitness Center": Dumbbell,
    Pool: Building2,
    Spa: Building2,
  }

  const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom) || roomTypes[0]

  const parsedCheckIn = checkInDate ? new Date(checkInDate) : null
  const parsedCheckOut = checkOutDate ? new Date(checkOutDate) : null
  const nights = parsedCheckIn && parsedCheckOut && !Number.isNaN(parsedCheckIn.valueOf()) && !Number.isNaN(parsedCheckOut.valueOf()) && parsedCheckOut > parsedCheckIn
    ? Math.max(1, Math.round((parsedCheckOut.getTime() - parsedCheckIn.getTime()) / (1000 * 60 * 60 * 24)))
    : 1
  const formattedCheckIn = parsedCheckIn ? parsedCheckIn.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Chưa chọn'
  const formattedCheckOut = parsedCheckOut ? parsedCheckOut.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Chưa chọn'
  const effectiveGuestCount = guestCount && guestCount > 0 ? guestCount : 2
  const effectiveRoomCount = roomCount && roomCount > 0 ? roomCount : 1
  const totalPrice = Number(selectedRoomData.price ?? 0) * nights * effectiveRoomCount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[90%] h-[90%] bg-background rounded-lg shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable Content */}
        <div className="h-full overflow-y-auto">
          {/* Header Image */}
          <div className="relative h-64 md:h-80">
            <Image
              src={hotel.primaryImage || hotel.images?.[0] || "/placeholder.svg"}
              alt={hotel.name}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{hotel.name}</h1>
              <div className="flex items-center space-x-2 text-white/90">
                <MapPin className="h-4 w-4" />
                <span>{hotel.city}, {hotel.country}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Rating and Reviews */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(hotel.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold">{hotel.rating}</span>
                    <span className="text-muted-foreground">(0 reviews)</span>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Tuyệt vời
                  </Badge>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Giới thiệu khách sạn</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {hotel.description}. Tận hưởng sự tiện nghi và đẳng cấp ngay trung tâm thành phố với hệ thống tiện
                    ích đầy đủ, dịch vụ chu đáo và tầm nhìn ấn tượng. Khách sạn mang đến sự kết hợp hài hòa giữa phong
                    cách hiện đại và nét tinh tế, phù hợp cho cả khách đi công tác lẫn du lịch nghỉ dưỡng.
                  </p>
                </div>

                {/* Amenities */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Tiện nghi nổi bật</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities.map((amenity) => {
                      const IconComponent = amenityIcons[amenity] || Building2
                      return (
                        <div key={amenity} className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-primary" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Room Selection */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Chọn hạng phòng</h2>
                  <div className="space-y-4">
                    {roomTypes.map((room) => (
                      <Card
                        key={room.id}
                        className={`cursor-pointer transition-all ${selectedRoom === room.id ? "ring-2 ring-primary" : ""}`}
                        onClick={() => setSelectedRoom(room.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-32 h-24 relative">
                              <Image
                                src={room.image || "/placeholder.svg"}
                                alt={room.name}
                                fill
                                className="object-cover rounded"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold">{room.name}</h3>
                                <div className="text-right">
                                <div className="text-sm text-muted-foreground line-through">
                                  {formatPrice(Number(room.originalPrice ?? room.price ?? 0))}
                                </div>
                                <div className="text-lg font-bold text-primary">{formatPrice(Number(room.price ?? 0))}</div>
                                <div className="text-xs text-muted-foreground">mỗi đêm</div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {room.features.map((feature: string) => (
                                  <Badge key={feature} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Policies */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Chính sách khách sạn</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Giờ nhận / trả phòng</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Nhận phòng: 15:00</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Trả phòng: 11:00</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Chính sách hủy</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Hủy miễn phí trước 24 giờ so với thời gian nhận phòng</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Loại phòng:</span>
                        <span className="text-sm font-medium">{selectedRoomData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Nhận phòng:</span>
                        <span className="text-sm">{formattedCheckIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Trả phòng:</span>
                        <span className="text-sm">{formattedCheckOut}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Khách / Phòng:</span>
                        <span className="text-sm">{effectiveGuestCount} khách · {effectiveRoomCount} phòng</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Số đêm:</span>
                        <span className="text-sm">{nights}</span>
                      </div>
                    </div>

                    <Separator />

                    <Separator />

                    <div className="flex justify-between font-semibold">
                      <span>Tổng cộng</span>
                      <span className="text-lg text-primary">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!canBook || !selectedRoomData}
                      onClick={() => {
                        if (!canBook) {
                          onPromptSearch?.()
                          return
                        }
                        if (selectedRoomData) {
                          onBookRoom?.({ hotel, room: selectedRoomData, checkInDate, checkOutDate })
                        }
                      }}
                    >
                      Đặt ngay
                    </Button>

                    <div className="text-xs text-muted-foreground text-center">
                      Hủy miễn phí đến 24 giờ trước thời gian nhận phòng
                    </div>
                    {!canBook && (
                      <div className="text-xs text-destructive text-center">
                        Vui lòng nhập thông tin tìm kiếm để tiếp tục đặt phòng
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
