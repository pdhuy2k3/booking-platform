"use client"

import { useState } from "react"
import { FlightCard } from "@/components/cards/flight-card"
import { HotelCard } from "@/components/cards/hotel-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Sparkles } from "lucide-react"
import FlightDetailsModal from "@/modules/flight/component/FlightDetailsModal"
import HotelDetailsModal from "@/modules/hotel/component/HotelDetailsModal"
import type { ChatStructuredResult } from "@/modules/ai/types"

interface AiResponseRendererProps {
  message: string
  results?: ChatStructuredResult[]
  onFlightBook?: (flight: any) => void
  onHotelBook?: (hotel: any, room: any) => void
  canBook?: boolean
}

export const AiResponseRenderer = ({
  message,
  results = [],
  onFlightBook,
  onHotelBook,
  canBook = true,
}: AiResponseRendererProps) => {
  const [selectedFlightForModal, setSelectedFlightForModal] = useState<any | null>(null)
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false)
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null)
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false)

  // Group results by type
  const flightResults = results.filter((r) => r.type === "flight")
  const hotelResults = results.filter((r) => r.type === "hotel")
  const infoResults = results.filter((r) => r.type === "info" || r.type === "location" || r.type === "weather")

  // Handlers
  const handleFlightViewDetails = (flight: any) => {
    setSelectedFlightForModal(flight)
    setIsFlightModalOpen(true)
  }

  const handleFlightModalBook = (details: any) => {
    setIsFlightModalOpen(false)
    onFlightBook?.(details)
  }

  const handleHotelViewDetails = (hotel: any) => {
    setSelectedHotelId(hotel.id)
    setIsHotelModalOpen(true)
  }

  const handleHotelModalBook = ({ hotel, room }: { hotel: any; room: any }) => {
    setIsHotelModalOpen(false)
    onHotelBook?.(hotel, room)
  }

  return (
    <div className="space-y-4">
      {/* AI Message Text */}
      {message && message.trim() && (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {message}
          </div>
        </div>
      )}

      {/* Flight Results */}
      {flightResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span>Chuyến bay gợi ý ({flightResults.length})</span>
          </div>
          <div className="space-y-3">
            {flightResults.map((result, index) => {
              const flightData = {
                id: String(result.metadata?.flightId || result.metadata?.id || `flight-${index}`),
                airline: String(result.metadata?.airline || result.title || ""),
                flightNumber: String(result.metadata?.flightNumber || ""),
                origin: String(result.metadata?.origin || ""),
                destination: String(result.metadata?.destination || ""),
                departureTime: String(result.metadata?.departureTime || result.metadata?.departureDateTime || ""),
                arrivalTime: String(result.metadata?.arrivalTime || result.metadata?.arrivalDateTime || ""),
                duration: String(result.metadata?.duration || ""),
                stops: result.metadata?.stops as string | number | undefined,
                price: Number(result.metadata?.price || 0),
                currency: String(result.metadata?.currency || "VND"),
                seatClass: String(result.metadata?.seatClass || result.metadata?.class || "ECONOMY"),
                logo: result.imageUrl ? String(result.imageUrl) : result.metadata?.airlineLogo ? String(result.metadata?.airlineLogo) : result.metadata?.logo ? String(result.metadata?.logo) : undefined,
                scheduleId: result.metadata?.scheduleId ? String(result.metadata?.scheduleId) : undefined,
                fareId: result.metadata?.fareId ? String(result.metadata?.fareId) : undefined,
                rating: result.metadata?.rating ? Number(result.metadata?.rating) : undefined,
              }

              return (
                <FlightCard
                  key={flightData.id}
                  flight={flightData}
                  onViewDetails={handleFlightViewDetails}
                  onBook={onFlightBook}
                  showBookButton={canBook}
                  compact={false}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Hotel Results */}
      {hotelResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span>Khách sạn gợi ý ({hotelResults.length})</span>
          </div>
          <div className="space-y-3">
            {hotelResults.map((result, index) => {
              const hotelData = {
                id: String(result.metadata?.hotelId || result.metadata?.id || `hotel-${index}`),
                name: String(result.title || result.metadata?.name || ""),
                image: result.imageUrl ? String(result.imageUrl) : result.metadata?.primaryImage ? String(result.metadata?.primaryImage) : result.metadata?.image ? String(result.metadata?.image) : undefined,
                location: result.subtitle ? String(result.subtitle) : result.metadata?.location ? String(result.metadata?.location) : undefined,
                city: result.metadata?.city ? String(result.metadata?.city) : undefined,
                country: result.metadata?.country ? String(result.metadata?.country) : undefined,
                rating: result.metadata?.rating ? Number(result.metadata?.rating) : undefined,
                reviews: result.metadata?.reviews ? Number(result.metadata?.reviews) : undefined,
                price: Number(result.metadata?.price || result.metadata?.pricePerNight || 0),
                originalPrice: result.metadata?.originalPrice ? Number(result.metadata?.originalPrice) : undefined,
                currency: String(result.metadata?.currency || "VND"),
                amenities: Array.isArray(result.metadata?.amenities) ? result.metadata?.amenities as string[] : undefined,
                description: result.description ? String(result.description) : result.metadata?.description ? String(result.metadata?.description) : undefined,
                starRating: result.metadata?.starRating ? Number(result.metadata?.starRating) : undefined,
              }

              return (
                <HotelCard
                  key={hotelData.id}
                  hotel={hotelData}
                  onViewDetails={handleHotelViewDetails}
                  onBook={handleHotelViewDetails}
                  showBookButton={canBook}
                  compact={false}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Info Results (Location, Weather, etc.) */}
      {infoResults.length > 0 && (
        <div className="space-y-2">
          {infoResults.map((result, index) => (
            <Alert key={index} className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="ml-2">
                {result.title && (
                  <div className="font-semibold text-blue-900 mb-1">{result.title}</div>
                )}
                {result.subtitle && (
                  <div className="text-sm text-blue-800 mb-1">{result.subtitle}</div>
                )}
                {result.description && (
                  <div className="text-sm text-blue-700">{result.description}</div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Flight Details Modal */}
      <FlightDetailsModal
        flightId={selectedFlightForModal?.id || null}
        seatClass={selectedFlightForModal?.seatClass || null}
        departureDateTime={selectedFlightForModal?.departureTime || null}
        scheduleId={selectedFlightForModal?.scheduleId || null}
        fareId={selectedFlightForModal?.fareId || null}
        isOpen={isFlightModalOpen}
        onClose={() => setIsFlightModalOpen(false)}
        onBookFlight={handleFlightModalBook}
        canBook={canBook}
      />

      {/* Hotel Details Modal */}
      <HotelDetailsModal
        hotelId={selectedHotelId}
        isOpen={isHotelModalOpen}
        onClose={() => setIsHotelModalOpen(false)}
        onBookRoom={handleHotelModalBook}
        canBook={canBook}
        onPromptSearch={() => setIsHotelModalOpen(false)}
      />
    </div>
  )
}
