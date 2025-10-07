"use client"

import { useState } from "react"
import { FlightCard } from "@/components/cards/flight-card"
import { HotelCard } from "@/components/cards/hotel-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Sparkles, MapPin } from "lucide-react"
import FlightDetailsModal from "@/modules/flight/component/FlightDetailsModal"
import HotelDetailsModal from "@/modules/hotel/component/HotelDetailsModal"
import type { ChatStructuredResult } from "@/modules/ai/types"
import { cn } from "@/lib/utils"

const optionalString = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

const optionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) return undefined
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined
  }
  const parsed = parseFloat(String(value).replace(/[^0-9.,-]/g, "").replace(/,/g, ""))
  return Number.isFinite(parsed) ? parsed : undefined
}

const parsePriceToNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const numeric = value.replace(/[^0-9.,-]/g, "").replace(/,/g, "")
    const parsed = parseFloat(numeric)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const extractCurrency = (priceValue: unknown, fallback: string = "VND"): string => {
  if (typeof priceValue === "string") {
    const explicit = priceValue.match(/([A-Z]{3})/)
    if (explicit && explicit[1]) {
      return explicit[1]
    }

    const lowered = priceValue.toLowerCase()
    if (lowered.includes("vnđ") || lowered.includes("đ")) return "VND"
    if (lowered.includes("usd")) return "USD"
    if (lowered.includes("eur")) return "EUR"
  }

  if (typeof priceValue === "object" && priceValue !== null) {
    const currency = (priceValue as Record<string, unknown>).currency
    if (typeof currency === "string" && currency.length <= 5) {
      return currency
    }
  }

  return fallback
}

const parseFlightSubtitle = (subtitle?: string) => {
  if (!subtitle) return {}

  const [routePart, timePart] = subtitle.split("•").map((part) => part.trim())
  const result: {
    origin?: string
    destination?: string
    departureTime?: string
    arrivalTime?: string
  } = {}

  if (routePart) {
    const routeTokens = routePart
      .split(/→|->|—|–|-/)
      .map((token) => token.trim())
      .filter(Boolean)

    if (routeTokens.length >= 2) {
      result.origin = routeTokens[0]
      result.destination = routeTokens[routeTokens.length - 1]
    }
  }

  if (timePart) {
    const timeTokens = timePart
      .split(/-|–|—|→/)
      .map((token) => token.trim())
      .filter(Boolean)

    if (timeTokens.length >= 2) {
      result.departureTime = timeTokens[0]
      result.arrivalTime = timeTokens[timeTokens.length - 1]
    }
  }

  return result
}

const extractFlightInfoFromTitle = (title?: string) => {
  if (!title) return {}

  const flightMatch = title.match(/\b[A-Z]{1,3}\d{1,4}\b/)
  const flightNumber = flightMatch ? flightMatch[0] : undefined

  const airlineName = flightNumber
    ? title
        .replace(flightNumber, "")
        .replace(/[•–—-]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .join(" ")
    : title

  return {
    airlineName: airlineName?.trim() || undefined,
    flightNumber,
  }
}

const parseHotelSubtitle = (subtitle?: string) => {
  if (!subtitle) return {}

  const [locationPart, ratingPart] = subtitle.split("•").map((part) => part.trim())
  const ratingNumber = ratingPart ? parseFloat(ratingPart.replace(/[^0-9.]/g, "")) : undefined

  return {
    location: locationPart || undefined,
    rating: ratingNumber !== undefined && Number.isFinite(ratingNumber) ? ratingNumber : undefined,
  }
}

interface AiResponseRendererProps {
  message: string
  results?: ChatStructuredResult[]
  onFlightBook?: (flight: any) => void
  onHotelBook?: (hotel: any, room: any) => void
  onLocationClick?: (location: { lat: number; lng: number; title: string; description?: string }) => void
  canBook?: boolean
}

export const AiResponseRenderer = ({
  message,
  results = [],
  onFlightBook,
  onHotelBook,
  onLocationClick,
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
    <div className="space-y-4 w-full">
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {flightResults.map((result, index) => {
              // Prioritize ids field, fallback to metadata
              const metadata = result.metadata ?? {}
              const flightId = result.ids?.flightId || String(metadata?.flightId || metadata?.id || `flight-${index}`)
              const scheduleId = result.ids?.scheduleId || (metadata?.scheduleId ? String(metadata?.scheduleId) : undefined)
              const fareId = result.ids?.fareId || (metadata?.fareId ? String(metadata?.fareId) : undefined)

              const subtitleInfo = parseFlightSubtitle(result.subtitle || optionalString(metadata?.subtitle))
              const { airlineName, flightNumber: titleFlightNumber } = extractFlightInfoFromTitle(
                optionalString(result.title || metadata?.title)
              )

              const priceSource = metadata?.price ?? metadata?.totalPrice ?? metadata?.fare ?? metadata?.amount ?? metadata?.pricePerPerson
              const price = parsePriceToNumber(priceSource)

              const currencyCandidate =
                optionalString(metadata?.currency) ||
                optionalString(metadata?.currencyCode) ||
                optionalString(metadata?.priceCurrency)

              const normalizedCurrencyCandidate = currencyCandidate?.replace(/[^A-Za-z]/g, "").toUpperCase()

              const currency =
                normalizedCurrencyCandidate ||
                extractCurrency(currencyCandidate ?? priceSource ?? metadata?.currency ?? metadata?.price, "VND")

              const originRaw = metadata?.origin ?? metadata?.departureAirport ?? metadata?.departure_airport ?? metadata?.from ?? subtitleInfo.origin
              const destinationRaw = metadata?.destination ?? metadata?.arrivalAirport ?? metadata?.arrival_airport ?? metadata?.to ?? subtitleInfo.destination

              const departureTimeRaw =
                metadata?.departureTime ??
                metadata?.departure_time ??
                metadata?.departureDateTime ??
                metadata?.departure_time_local ??
                subtitleInfo.departureTime

              const arrivalTimeRaw =
                metadata?.arrivalTime ??
                metadata?.arrival_time ??
                metadata?.arrivalDateTime ??
                metadata?.arrival_time_local ??
                subtitleInfo.arrivalTime

              const seatClassRaw = metadata?.seatClass ?? metadata?.seat_class ?? metadata?.cabinClass ?? metadata?.class

              const logo =
                optionalString(result.imageUrl) ||
                optionalString(metadata?.airlineLogo) ||
                optionalString(metadata?.airline_logo) ||
                optionalString(metadata?.logo) ||
                optionalString(metadata?.logoUrl)

              const stopsRaw = metadata?.stops ?? metadata?.stopCount ?? metadata?.number_of_stops ?? metadata?.stopsCount
              const stopsValue =
                typeof stopsRaw === "number"
                  ? stopsRaw
                  : typeof stopsRaw === "string" && stopsRaw.trim().length > 0
                  ? stopsRaw
                  : undefined

              const flightData = {
                id: flightId,
                airline: optionalString(metadata?.airline) || airlineName || optionalString(result.title) || "",
                flightNumber: optionalString(metadata?.flightNumber) || optionalString(metadata?.flight_number) || optionalString(metadata?.code) || titleFlightNumber || "",
                origin: optionalString(originRaw) || "",
                destination: optionalString(destinationRaw) || "",
                departureTime: optionalString(departureTimeRaw) || "",
                arrivalTime: optionalString(arrivalTimeRaw) || "",
                duration: optionalString(metadata?.duration) || optionalString(metadata?.flightDuration) || optionalString(metadata?.travelTime) || "",
                stops: stopsValue,
                price,
                currency,
                seatClass: optionalString(seatClassRaw) || "ECONOMY",
                logo,
                scheduleId,
                fareId,
                rating: optionalNumber(metadata?.rating),
                originLatitude: optionalNumber(metadata?.originLatitude),
                originLongitude: optionalNumber(metadata?.originLongitude),
                destinationLatitude: optionalNumber(metadata?.destinationLatitude),
                destinationLongitude: optionalNumber(metadata?.destinationLongitude),
              }

              return (
                <FlightCard
                  key={flightData.id}
                  flight={flightData}
                  onViewDetails={handleFlightViewDetails}
                  onBook={() => onFlightBook?.(flightData)}
                  onLocationClick={onLocationClick}
                  showBookButton={canBook}
                  compact={false}
                  className="h-full"
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {hotelResults.map((result, index) => {
              // Prioritize ids field, fallback to metadata
              const metadata = result.metadata ?? {}
              const hotelId = result.ids?.hotelId || String(metadata?.hotelId || metadata?.id || `hotel-${index}`)

              const subtitleInfo = parseHotelSubtitle(result.subtitle || optionalString(metadata?.subtitle))

              const priceSource = metadata?.price ?? metadata?.pricePerNight ?? metadata?.price_per_night ?? metadata?.amount ?? metadata?.lowestPrice
              const price = parsePriceToNumber(priceSource)

              const currencyCandidate =
                optionalString(metadata?.currency) ||
                optionalString(metadata?.currencyCode) ||
                optionalString(metadata?.priceCurrency)

              const normalizedCurrencyCandidate = currencyCandidate?.replace(/[^A-Za-z]/g, "").toUpperCase()

              const currency =
                normalizedCurrencyCandidate ||
                extractCurrency(currencyCandidate ?? priceSource ?? metadata?.currency ?? metadata?.price, "VND")

              const ratingRaw = metadata?.rating ?? metadata?.reviewScore ?? metadata?.averageRating
              const reviewsRaw = metadata?.reviews ?? metadata?.reviewCount
              const city = optionalString(metadata?.city)
              const country = optionalString(metadata?.country)
              const location =
                optionalString(metadata?.location) ||
                subtitleInfo.location ||
                (city && country ? `${city}, ${country}` : city || country) ||
                undefined

              const hotelData = {
                id: hotelId,
                name: optionalString(result.title) || optionalString(metadata?.name) || "",
                image:
                  optionalString(result.imageUrl) ||
                  optionalString(metadata?.primaryImage) ||
                  optionalString(metadata?.image) ||
                  optionalString(metadata?.thumbnail),
                location,
                city,
                country,
                rating: optionalNumber(ratingRaw) ?? subtitleInfo.rating,
                reviews: optionalNumber(reviewsRaw),
                price,
                originalPrice: optionalNumber(metadata?.originalPrice),
                currency,
                amenities: Array.isArray(metadata?.amenities) ? (metadata?.amenities as string[]) : undefined,
                description: optionalString(result.description) || optionalString(metadata?.description),
                starRating: optionalNumber(metadata?.starRating) ?? subtitleInfo.rating,
                latitude: optionalNumber(metadata?.latitude),
                longitude: optionalNumber(metadata?.longitude),
              }

              return (
                <HotelCard
                  key={hotelData.id}
                  hotel={hotelData}
                  onViewDetails={handleHotelViewDetails}
                  onBook={() => {
                    // Open modal for room selection, similar to search tab
                    handleHotelViewDetails(hotelData)
                  }}
                  onLocationClick={onLocationClick}
                  showBookButton={canBook}
                  compact={false}
                  className="h-full"
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Info Results (Location, Weather, etc.) */}
      {infoResults.length > 0 && (
        <div className="space-y-2">
          {infoResults.map((result, index) => {
            const metadata = (result.metadata || {}) as Record<string, unknown>
            const hasCoordinates = Boolean(metadata.coordinates || (metadata.latitude && metadata.longitude))
            
            const handleLocationClick = () => {
              if (!hasCoordinates || !onLocationClick) return
              
              let lat: number | undefined
              let lng: number | undefined
              
              // Try to extract from coordinates string
              if (metadata.coordinates) {
                const coordStr = String(metadata.coordinates)
                const [latStr, lngStr] = coordStr.split(',').map(s => s.trim())
                lat = parseFloat(latStr)
                lng = parseFloat(lngStr)
              }
              
              // Try direct lat/lng fields
              if (!lat || !lng) {
                lat = metadata.latitude ? parseFloat(String(metadata.latitude)) : undefined
                lng = metadata.longitude ? parseFloat(String(metadata.longitude)) : undefined
              }
              
              if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                const locationDesc = result.subtitle || (typeof metadata.location === 'string' ? metadata.location : undefined) || result.description
                onLocationClick({
                  lat,
                  lng,
                  title: result.title || 'Location',
                  description: locationDesc
                })
              }
            }
            
            const isClickable = hasCoordinates && Boolean(onLocationClick)
            
            return (
              <Alert 
                key={index} 
                className={cn(
                  "border-blue-200 bg-blue-50",
                  isClickable && "cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-colors"
                )}
                onClick={handleLocationClick}
              >
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
                  {isClickable && (
                    <div className="text-xs text-blue-600 mt-2 font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Click để xem trên bản đồ
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )
          })}
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
