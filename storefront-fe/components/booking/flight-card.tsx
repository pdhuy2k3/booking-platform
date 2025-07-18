"use client"

import { useBooking } from "@/lib/booking-context"
import { FlightSearchResult } from "@/types/booking"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Clock, Users } from "lucide-react"

interface FlightCardProps {
  flight: FlightSearchResult
  isSelected: boolean
}

export function FlightCard({ flight, isSelected }: FlightCardProps) {
  const { dispatch } = useBooking()

  const handleSelect = () => {
    dispatch({ type: 'SET_SELECTED_FLIGHT', payload: flight })
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD'
    }).format(price)
  }

  return (
    <div className={`
      border rounded-lg p-6 transition-all duration-200 cursor-pointer
      ${isSelected 
        ? 'border-blue-500 bg-blue-50 shadow-md' 
        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }
    `}>
      <div className="flex items-center justify-between">
        {/* Flight Info */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-lg">{flight.airline}</span>
              <Badge variant="outline">{flight.flightNumber}</Badge>
            </div>
            <Badge variant={flight.seatClass === 'ECONOMY' ? 'secondary' : 'default'}>
              {flight.seatClass.replace('_', ' ')}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Departure */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{flight.departureTime}</div>
              <div className="text-sm text-gray-600">{flight.origin}</div>
            </div>

            {/* Duration */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-px bg-gray-300 flex-1"></div>
                <Clock className="w-4 h-4 text-gray-400" />
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              <div className="text-sm text-gray-600">{flight.duration}</div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{flight.arrivalTime}</div>
              <div className="text-sm text-gray-600">{flight.destination}</div>
            </div>
          </div>

          {/* Available Seats */}
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{flight.availableSeats} seats available</span>
          </div>
        </div>

        {/* Price and Select */}
        <div className="text-right ml-6">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {formatPrice(flight.price, flight.currency)}
          </div>
          <div className="text-sm text-gray-500 mb-4">per person</div>
          
          <Button 
            onClick={handleSelect}
            variant={isSelected ? "default" : "outline"}
            className="w-full"
          >
            {isSelected ? "Selected" : "Select Flight"}
          </Button>
        </div>
      </div>
    </div>
  )
}
