"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, Plane, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"
import { useDateFormatter } from "@/hooks/use-date-formatter"

interface FlightCardProps {
  flight: {
    id: string
    airline: string
    flightNumber: string
    origin: string
    destination: string
    departureTime: string
    arrivalTime: string
    duration?: string
    stops?: string | number
    price: number
    currency?: string
    seatClass?: string
    logo?: string
    rating?: number
    scheduleId?: string
    fareId?: string
  }
  onViewDetails?: (flight: any) => void
  onBook?: (flight: any) => void
  showBookButton?: boolean
  compact?: boolean
  className?: string
}

export const FlightCard = ({
  flight,
  onViewDetails,
  onBook,
  showBookButton = true,
  compact = false,
  className = "",
}: FlightCardProps) => {
  const { formatTimeOnly } = useDateFormatter()
  const [imageError, setImageError] = useState(false)

  const getDisplayTime = (time: string) => {
    try {
      const date = new Date(time)
      if (!isNaN(date.getTime())) {
        return formatTimeOnly(date.toISOString())
      }
    } catch (e) {
      // Fallback to original format
    }
    return time
  }

  const departureTimeDisplay = getDisplayTime(flight.departureTime)
  const arrivalTimeDisplay = getDisplayTime(flight.arrivalTime)

  const stopsDisplay = typeof flight.stops === 'number' 
    ? flight.stops === 0 
      ? 'Bay thẳng' 
      : `${flight.stops} điểm dừng`
    : flight.stops || 'Bay thẳng'

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardContent className={`${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-start justify-between gap-4">
          {/* Flight Info */}
          <div className="flex-1 space-y-3">
            {/* Airline */}
            <div className="flex items-center gap-3">
              {flight.logo && (
                <div className="relative h-8 w-8 flex-shrink-0">
                  <Image
                    src={imageError ? "/airplane-generic.png" : flight.logo}
                    alt={flight.airline}
                    width={32}
                    height={32}
                    className="rounded object-contain"
                    onError={() => {
                      if (!imageError) {
                        setImageError(true)
                      }
                    }}
                    unoptimized
                  />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{flight.airline}</p>
                <p className="text-sm text-gray-500">{flight.flightNumber}</p>
              </div>
              {flight.seatClass && (
                <Badge variant="secondary" className="ml-2">
                  {flight.seatClass}
                </Badge>
              )}
            </div>

            {/* Route */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">{departureTimeDisplay}</p>
                <p className="text-sm text-gray-600">{flight.origin}</p>
              </div>

              <div className="flex flex-col items-center gap-1 px-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="h-px w-8 bg-gray-300" />
                  <Plane className="h-4 w-4" />
                  <div className="h-px w-8 bg-gray-300" />
                </div>
                {flight.duration && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{flight.duration}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500">{stopsDisplay}</p>
              </div>

              <div className="flex-1 text-right">
                <p className="text-2xl font-bold text-gray-900">{arrivalTimeDisplay}</p>
                <p className="text-sm text-gray-600">{flight.destination}</p>
              </div>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(flight.price, flight.currency || 'VND')}
              </p>
              <p className="text-sm text-gray-500">/ khách</p>
            </div>

            <div className="flex flex-col gap-2">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size={compact ? "sm" : "default"}
                  onClick={() => onViewDetails(flight)}
                >
                  Chi tiết
                </Button>
              )}
              {showBookButton && onBook && (
                <Button
                  size={compact ? "sm" : "default"}
                  onClick={() => onBook(flight)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Đặt ngay
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
