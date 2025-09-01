"use client"

import { useState } from "react"
import { X, MapPin, Star, Wifi, Car, Coffee, Dumbbell, Building2, Calendar, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Hotel {
  id: number
  name: string
  image: string
  location: string
  rating: number
  reviews: number
  price: number
  originalPrice: number
  amenities: string[]
  description: string
}

interface HotelDetailsModalProps {
  hotel: Hotel | null
  isOpen: boolean
  onClose: () => void
}

export default function HotelDetailsModal({ hotel, isOpen, onClose }: HotelDetailsModalProps) {
  const [selectedRoom, setSelectedRoom] = useState("standard")

  if (!isOpen || !hotel) return null

  const roomTypes = [
    {
      id: "standard",
      name: "Standard Room",
      price: hotel.price,
      originalPrice: hotel.originalPrice,
      features: ["Queen bed", "City view", "25 sqm", "Free WiFi"],
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "deluxe",
      name: "Deluxe Room",
      price: hotel.price + 50,
      originalPrice: hotel.originalPrice + 70,
      features: ["King bed", "Balcony", "35 sqm", "Mini bar", "Free WiFi"],
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "suite",
      name: "Executive Suite",
      price: hotel.price + 120,
      originalPrice: hotel.originalPrice + 150,
      features: ["King bed", "Separate living area", "50 sqm", "City view", "Mini bar", "Free WiFi"],
      image: "/placeholder.svg?height=200&width=300",
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
            <img src={hotel.image || "/placeholder.svg"} alt={hotel.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{hotel.name}</h1>
              <div className="flex items-center space-x-2 text-white/90">
                <MapPin className="h-4 w-4" />
                <span>{hotel.location}</span>
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
                    <span className="text-muted-foreground">({hotel.reviews} reviews)</span>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Excellent
                  </Badge>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">About this hotel</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {hotel.description}. Experience luxury and comfort in the heart of the city with world-class
                    amenities, exceptional service, and stunning views. Our hotel offers the perfect blend of modern
                    sophistication and timeless elegance, making it an ideal choice for both business and leisure
                    travelers.
                  </p>
                </div>

                {/* Amenities */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Hotel Amenities</h2>
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
                  <h2 className="text-xl font-semibold mb-4">Choose Your Room</h2>
                  <div className="space-y-4">
                    {roomTypes.map((room) => (
                      <Card
                        key={room.id}
                        className={`cursor-pointer transition-all ${selectedRoom === room.id ? "ring-2 ring-primary" : ""}`}
                        onClick={() => setSelectedRoom(room.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row gap-4">
                            <img
                              src={room.image || "/placeholder.svg"}
                              alt={room.name}
                              className="w-full md:w-32 h-24 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold">{room.name}</h3>
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground line-through">
                                    ${room.originalPrice}
                                  </div>
                                  <div className="text-lg font-bold text-primary">${room.price}</div>
                                  <div className="text-xs text-muted-foreground">per night</div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {room.features.map((feature) => (
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
                  <h2 className="text-xl font-semibold mb-4">Hotel Policies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Check-in/Check-out</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Check-in: 3:00 PM</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Check-out: 11:00 AM</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Cancellation</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Free cancellation until 24 hours before check-in</span>
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
                        <span className="text-sm">Room Type:</span>
                        <span className="text-sm font-medium">{selectedRoomData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Check-in:</span>
                        <span className="text-sm">Dec 15, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Check-out:</span>
                        <span className="text-sm">Dec 18, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Guests:</span>
                        <span className="text-sm">2 Adults</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Nights:</span>
                        <span className="text-sm">3</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Room (3 nights)</span>
                        <span className="text-sm">${selectedRoomData.price * 3}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Taxes & fees</span>
                        <span className="text-sm">${Math.round(selectedRoomData.price * 3 * 0.12)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg text-primary">
                        ${selectedRoomData.price * 3 + Math.round(selectedRoomData.price * 3 * 0.12)}
                      </span>
                    </div>

                    <Button className="w-full" size="lg">
                      Book Now
                    </Button>

                    <div className="text-xs text-muted-foreground text-center">
                      Free cancellation until 24 hours before check-in
                    </div>
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
