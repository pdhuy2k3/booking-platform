"use client"

import { useBooking } from "@/lib/booking-context"
import { HotelSearchResult, RoomInfo } from "@/types/booking"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star, MapPin, Wifi, Car, Utensils, Waves } from "lucide-react"

interface HotelCardProps {
  hotel: HotelSearchResult
  isSelected: boolean
  selectedRoom?: RoomInfo
}

const amenityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Pool': Waves,
  'Restaurant': Utensils,
  'Parking': Car,
  'Spa': Star,
  'Gym': Star,
  'Bar': Utensils
}

export function HotelCard({ hotel, isSelected, selectedRoom }: HotelCardProps) {
  const { state, dispatch } = useBooking()

  const handleSelectHotel = () => {
    dispatch({ type: 'SET_SELECTED_HOTEL', payload: hotel })
  }

  const handleSelectRoom = (room: RoomInfo) => {
    // First select the hotel if not already selected
    if (!isSelected) {
      dispatch({ type: 'SET_SELECTED_HOTEL', payload: hotel })
    }
    dispatch({ type: 'SET_SELECTED_ROOM', payload: room })
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD'
    }).format(price)
  }

  const calculateNights = () => {
    if (!state.hotelSearch) return 1
    const checkIn = new Date(state.hotelSearch.checkInDate)
    const checkOut = new Date(state.hotelSearch.checkOutDate)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  return (
    <Card className={`
      transition-all duration-200
      ${isSelected 
        ? 'border-blue-500 shadow-md' 
        : 'border-gray-200 hover:shadow-sm'
      }
    `}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
              <div className="flex items-center">
                {[...Array(hotel.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{hotel.address}, {hotel.city}</span>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.slice(0, 4).map((amenity) => {
                const Icon = amenityIcons[amenity] || Star
                return (
                  <Badge key={amenity} variant="secondary" className="text-xs">
                    <Icon className="w-3 h-3 mr-1" />
                    {amenity}
                  </Badge>
                )
              })}
              {hotel.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{hotel.amenities.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          <div className="text-right ml-4">
            <div className="text-lg font-bold text-blue-600">
              From {formatPrice(hotel.pricePerNight, hotel.currency)}
            </div>
            <div className="text-sm text-gray-500">per night</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Available Rooms */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Available Rooms</h4>
          
          {hotel.availableRooms.map((room) => {
            const isRoomSelected = selectedRoom?.roomId === room.roomId
            const totalPrice = room.pricePerNight * nights * (state.hotelSearch?.rooms || 1)
            
            return (
              <div
                key={room.roomId}
                className={`
                  border rounded-lg p-4 transition-all duration-200
                  ${isRoomSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium text-gray-900">{room.roomType}</h5>
                      <Badge variant="outline" className="text-xs">
                        Up to {room.capacity} guests
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {room.amenities.map((amenity) => (
                        <span key={amenity} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="font-semibold text-gray-900">
                      {formatPrice(totalPrice, hotel.currency)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {nights} {nights === 1 ? 'night' : 'nights'} × {state.hotelSearch?.rooms || 1} {(state.hotelSearch?.rooms || 1) === 1 ? 'room' : 'rooms'}
                    </div>
                    
                    <Button
                      onClick={() => handleSelectRoom(room)}
                      variant={isRoomSelected ? "default" : "outline"}
                      size="sm"
                      className="mt-2"
                    >
                      {isRoomSelected ? "Selected" : "Select Room"}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
