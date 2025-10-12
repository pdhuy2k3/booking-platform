"use client"

import type { JSX } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { bookingService, type BookingHistoryItemDto, type BookingHistoryResponseDto } from "@/modules/booking/service"
import { flightService } from "@/modules/flight/service"
import { hotelService } from "@/modules/hotel/service"
import type { FlightFareDetails } from "@/modules/flight/type"
import type { RoomDetails } from "@/modules/hotel/type"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Calendar,
  Plane,
  Building2,
  MapPin,
  Layers,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { useDateFormatter } from "@/hooks/use-date-formatter"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useRecommendPanel } from "@/contexts/recommend-panel-context"

const RESUME_STORAGE_KEY = "bookingResumePayload"
const PROCESSING_STATUSES = new Set(["PENDING", "VALIDATION_PENDING", "PAYMENT_PENDING"])

const PAGE_SIZE = 10

const STATUS_BADGE_MAP: Record<string, { label: string; className: string; icon: JSX.Element }> = {
  CONFIRMED: { label: "Confirmed", className: "bg-green-500/10 text-green-400", icon: <CheckCircle2 className="h-4 w-4" /> },
  PAID: { label: "Paid", className: "bg-green-500/10 text-green-400", icon: <CheckCircle2 className="h-4 w-4" /> },
  PENDING: { label: "Processing", className: "bg-amber-500/10 text-amber-400", icon: <Clock3 className="h-4 w-4" /> },
  PAYMENT_PENDING: { label: "Awaiting Payment", className: "bg-amber-500/10 text-amber-400", icon: <Clock3 className="h-4 w-4" /> },
  VALIDATION_PENDING: { label: "Validating", className: "bg-blue-500/10 text-blue-400", icon: <Clock3 className="h-4 w-4" /> },
  CANCELLED: { label: "Cancelled", className: "bg-red-500/10 text-red-400", icon: <XCircle className="h-4 w-4" /> },
  CANCELED: { label: "Cancelled", className: "bg-red-500/10 text-red-400", icon: <XCircle className="h-4 w-4" /> },
  FAILED: { label: "Failed", className: "bg-red-500/10 text-red-400", icon: <XCircle className="h-4 w-4" /> },
  PAYMENT_FAILED: { label: "Payment Failed", className: "bg-red-500/10 text-red-400", icon: <AlertTriangle className="h-4 w-4" /> },
  VALIDATION_FAILED: { label: "Validation Failed", className: "bg-red-500/10 text-red-400", icon: <AlertTriangle className="h-4 w-4" /> },
}

const getBookingIcon = (type?: string) => {
  switch (type) {
    case "FLIGHT":
      return <Plane className="h-5 w-5" />
    case "HOTEL":
      return <Building2 className="h-5 w-5" />
    case "COMBO":
      return <Layers className="h-5 w-5" />
    default:
      return <MapPin className="h-5 w-5" />
  }
}

function formatCurrency(amount?: number | string | null, currency?: string | null) {
  if (amount == null) return "—"
  const numeric = typeof amount === "string" ? Number(amount) : amount
  if (!Number.isFinite(numeric)) return amount?.toString() ?? "—"
  const resolvedCurrency = currency ? currency.toUpperCase() : "VND"
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: resolvedCurrency,
      currencyDisplay: "symbol",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(numeric)
  } catch {
    return `${numeric.toFixed(2)} ${resolvedCurrency}`
  }
}

const normalizeIsoDateTime = (value?: string | null) => {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value)) {
    return `${value}Z`
  }
  return value
}

function formatDateTime(timestamp?: string | null) {
  const normalized = normalizeIsoDateTime(timestamp)
  if (!normalized) return "—"
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return timestamp || "—"
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDateOnly(timestamp?: string | null) {
  const normalized = normalizeIsoDateTime(timestamp)
  if (!normalized) return "—"
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return timestamp || "—"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const ensureSeatClass = (value?: string | null) => {
  if (!value) return "ECONOMY"
  return value.toUpperCase()
}

const parseProductDetails = (json?: string | null) => {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch (err) {
    console.warn("Failed to parse product details", err)
    return null
  }
  }

  const renderStatusBadge = (status?: string | null) => {
    if (!status) return null
    const meta = STATUS_BADGE_MAP[status] ?? {
      label: status,
      className: "bg-gray-500/10 text-gray-300",
      icon: <Clock3 className="h-4 w-4" />,
    }

    return (
      <Badge className={`gap-1 ${meta.className}`}>
        {meta.icon}
        {meta.label}
      </Badge>
    )
  }

  const renderFlightDetails = (flight?: FlightFareDetails, fallback?: any) => {
    const source = flight ?? fallback
    if (!source) return null

    const departure = flight?.departureTime ?? source?.departureDateTime
    const arrival = flight?.arrivalTime ?? source?.arrivalDateTime
    const seatClass = flight?.seatClass ?? ensureSeatClass(source?.seatClass)
    const priceRaw = flight?.price ?? source?.pricePerPassenger ?? source?.totalFlightPrice
    const price = priceRaw != null ? Number(priceRaw) : undefined
    const currency = flight?.currency ?? source?.currency ?? "VND"
    const airline = flight?.airline ?? source?.airline
    const flightNumber = flight?.flightNumber ?? source?.flightNumber
    
    // Handle both FlightFareDetails and API response structure
    const origin = flight?.originAirport ?? source?.originAirport ?? source?.origin
    const destination = flight?.destinationAirport ?? source?.destinationAirport ?? source?.destination
    const availableSeatsRaw = flight?.availableSeats ?? source?.availableSeats
    const availableSeats = availableSeatsRaw != null ? Number(availableSeatsRaw) : null

    return (
      <div className="space-y-2 rounded-lg border border-gray-300/30 bg-gray-100 p-4">
        <h4 className="font-semibold text-gray-700">Flight Details</h4>
        <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
          <div>
            <span className="text-xs uppercase text-gray-500">Flight</span>
            <p className="font-medium">{flightNumber || 'N/A'}</p>
            {airline && <p className="text-xs text-gray-500">{airline}</p>}
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Route</span>
            <p className="font-medium">{origin || '—'} → {destination || '—'}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Departure</span>
          <p>{formatDateTime(departure)}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Arrival</span>
          <p>{formatDateTime(arrival)}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Seat Class</span>
            <p>{seatClass}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Fare</span>
            <p>{formatCurrency(price ?? priceRaw, currency)}</p>
            {availableSeats != null && Number.isFinite(availableSeats) && (
              <p className="text-xs text-gray-500">Available seats: {availableSeats}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderHotelDetails = (hotel?: RoomDetails, fallback?: any) => {
    const source = hotel ?? fallback
    if (!source) return null

    const title = hotel?.roomType?.name ?? source?.roomName ?? source?.roomType
    const description = hotel?.description ?? source?.description
    const priceRaw = hotel?.price ?? source?.pricePerNight ?? source?.totalRoomPrice
    const price = priceRaw != null ? Number(priceRaw) : undefined
    const currency = source?.currency ?? "VND"
    const capacity = hotel?.maxOccupancy ?? source?.numberOfGuests
    const bedType = hotel?.bedType ?? source?.bedType
    const roomNumber = hotel?.roomNumber ?? source?.roomId

    return (
      <div className="space-y-2 rounded-lg border border-gray-300/30 bg-gray-100 p-4">
        <h4 className="font-semibold text-gray-700">Room Details</h4>
        <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
          <div>
            <span className="text-xs uppercase text-gray-500">Room</span>
            <p className="font-medium">{title || 'Room'}</p>
            {roomNumber && <p className="text-xs text-gray-500">Room ID: {roomNumber}</p>}
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Price</span>
            <p>{formatCurrency(price ?? priceRaw, currency)}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Capacity</span>
            <p>{capacity ? `${capacity} guests` : '—'}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Bed Type</span>
            <p>{bedType || '—'}</p>
          </div>
        </div>
        {description && <p className="text-sm text-gray-600/80">{description}</p>}
      </div>
    )
  }

  const renderFallbackFlightDetails = (fallback: any) => renderFlightDetails(undefined, fallback)
  const renderFallbackHotelDetails = (fallback: any) => renderHotelDetails(undefined, fallback)

type BookingDetailState = {
  flight?: FlightFareDetails
  hotel?: RoomDetails
  fallbackFlight?: any
  fallbackHotel?: any
}

export function BookingHistoryTab() {
  const [items, setItems] = useState<BookingHistoryItemDto[]>([])
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null)
  const [detailErrors, setDetailErrors] = useState<Record<string, string | null>>({})
  const [detailMap, setDetailMap] = useState<Record<string, BookingDetailState>>({})
  const router = useRouter()
  const { toast } = useToast()
  const { showLocation } = useRecommendPanel()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const formatCountdown = useCallback((expires?: string | null) => {
    if (!expires) return null
    const target = new Date(expires).getTime()
    if (Number.isNaN(target)) return null
    const remaining = target - now
    if (remaining <= 0) return '00:00'
    const totalSeconds = Math.floor(remaining / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [now])

  const handleShowFlightLocation = useCallback((booking: BookingHistoryItemDto, target: 'origin' | 'destination') => {
    const latValue = target === 'origin' ? booking.originLatitude : booking.destinationLatitude
    const lngValue = target === 'origin' ? booking.originLongitude : booking.destinationLongitude

    const lat = typeof latValue === 'string' ? Number(latValue) : latValue
    const lng = typeof lngValue === 'string' ? Number(lngValue) : lngValue

    if (!Number.isFinite(lat ?? NaN) || !Number.isFinite(lng ?? NaN)) {
      toast({
        title: "Location unavailable",
        description: `The ${target === 'origin' ? 'departure' : 'arrival'} airport does not have coordinates configured in the system yet.`,
        variant: "destructive",
      })
      return
    }

    showLocation({
      lat: lat as number,
      lng: lng as number,
      title: `${target === 'origin' ? 'Departure' : 'Arrival'} • ${booking.bookingReference}`,
      description: booking.productSummary ?? undefined,
    })
  }, [showLocation, toast])

  const handleShowHotelLocation = useCallback((booking: BookingHistoryItemDto) => {
    const latValue = booking.hotelLatitude
    const lngValue = booking.hotelLongitude
    const lat = typeof latValue === 'string' ? Number(latValue) : latValue
    const lng = typeof lngValue === 'string' ? Number(lngValue) : lngValue

    if (!Number.isFinite(lat ?? NaN) || !Number.isFinite(lng ?? NaN)) {
      toast({
        title: "Location unavailable",
        description: "The hotel location is not yet configured in the system.",
        variant: "destructive",
      })
      return
    }

    showLocation({
      lat: lat as number,
      lng: lng as number,
      title: `Hotel • ${booking.bookingReference}`,
      description: booking.productSummary ?? undefined,
    })
  }, [showLocation, toast])

  const handleContinueBooking = useCallback((booking: BookingHistoryItemDto) => {
    try {
      const productDetails = booking.productDetailsJson ? JSON.parse(booking.productDetailsJson) : null
      sessionStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify({ booking, productDetails }))
      router.push(`/?resume=${booking.bookingId}`)
    } catch (error) {
      console.error('Failed to prepare booking for resuming', error)
      toast({
        title: "Unable to resume booking",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }, [router, toast])

  useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      setIsLoading(true)
      setError(null)
      try {
        const response: BookingHistoryResponseDto = await bookingService.history(page, PAGE_SIZE)
        if (cancelled) return
        setHasNext(response.hasNext)
        setItems((prev) => (page === 0 ? response.items : [...prev, ...response.items]))
      } catch (err: any) {
        if (cancelled) return
        console.error("Failed to load booking history", err)
        setError(err?.message ?? "Failed to load booking history")
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [page])

  const handleRetry = () => {
    setItems([])
    setDetailMap({})
    setDetailErrors({})
    setExpandedId(null)
    setPage(0)
  }

  const handleLoadMore = () => {
    if (!isLoading && hasNext) {
      setPage((prev) => prev + 1)
    }
  }

  const handleViewDetails = async (booking: BookingHistoryItemDto) => {
    const bookingId = booking.bookingId

    if (expandedId === bookingId) {
      setExpandedId(null)
      return
    }

    setExpandedId(bookingId)

    if (detailMap[bookingId]) {
      return
    }

    const product = parseProductDetails(booking.productDetailsJson)
    if (!product) {
      setDetailErrors((prev) => ({ ...prev, [bookingId]: 'No product details available for this booking.' }))
      return
    }

    const baseDetail: BookingDetailState = {
      fallbackFlight: booking.bookingType === 'COMBO' ? product?.flightDetails : booking.bookingType === 'FLIGHT' ? product : undefined,
      fallbackHotel: booking.bookingType === 'COMBO' ? product?.hotelDetails : booking.bookingType === 'HOTEL' ? product : undefined,
    }

    setDetailMap((prev) => ({ ...prev, [bookingId]: baseDetail }))
    setDetailErrors((prev) => ({ ...prev, [bookingId]: null }))
    setDetailLoadingId(bookingId)

    try {
      const detail: BookingDetailState = { ...baseDetail }

      if (booking.bookingType === 'FLIGHT' || booking.bookingType === 'COMBO') {
        const flightInfo = booking.bookingType === 'COMBO' ? product?.flightDetails : product
        if (flightInfo?.flightId && flightInfo?.seatClass && flightInfo?.departureDateTime) {
          const fareDetails = await flightService.getFareDetails(flightInfo.flightId, {
            seatClass: ensureSeatClass(flightInfo.seatClass),
            departureDateTime: flightInfo.departureDateTime,
            scheduleId: (flightInfo as any).scheduleId,
            fareId: (flightInfo as any).fareId,
          })
          // Cast to FlightFareDetails since getFareDetails returns FlightDetails
          detail.flight = fareDetails as any as FlightFareDetails
        }
      }

      if (booking.bookingType === 'HOTEL' || booking.bookingType === 'COMBO') {
        const hotelInfo = booking.bookingType === 'COMBO' ? product?.hotelDetails : product
        if (hotelInfo?.roomId) {
          detail.hotel = await hotelService.getRoomDetails(hotelInfo.roomId)
        }
      }

      setDetailMap((prev) => ({ ...prev, [bookingId]: detail }))
    } catch (err: any) {
      console.error('Failed to load booking item details', err)
      setDetailErrors((prev) => ({ ...prev, [bookingId]: err?.message ?? 'Failed to load booking details.' }))
    } finally {
      setDetailLoadingId(null)
    }
  }

  const historyByDate = useMemo(() => {
    if (items.length === 0) {
      return []
    }

    return items.reduce<{ date: string; entries: BookingHistoryItemDto[] }[]>((acc, item) => {
      const key = item.createdAt?.split('T')[0] ?? 'Unknown'
      const group = acc.find((g) => g.date === key)
      if (group) {
        group.entries.push(item)
      } else {
        acc.push({ date: key, entries: [item] })
      }
      return acc
    }, [])
  }, [items])

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Booking History</CardTitle>
          <CardDescription>Review your completed and in-progress bookings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-red-600">{error}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={handleRetry}>
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          )}

          {items.length === 0 && !isLoading && !error && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600">Plan your next trip to see bookings listed here.</p>
            </div>
          )}

          {historyByDate.map((group) => (
            <div key={group.date} className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">
                {formatDateOnly(group.date)}
              </div>
              <div className="space-y-3">
                {group.entries.map((booking) => {
                  const bookingId = booking.bookingId
                  const detail = detailMap[bookingId]
                  const detailError = detailErrors[bookingId]
                  const isExpanded = expandedId === bookingId
                  const countdown = formatCountdown(booking.reservationExpiresAt)
                  const isProcessing = PROCESSING_STATUSES.has((booking.status || '').toUpperCase())
                  const hasCountdown = countdown !== null
                  const isExpired = hasCountdown && countdown === '00:00'

                  return (
                    <div
                      key={bookingId}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="text-cyan-500">{getBookingIcon(booking.bookingType)}</div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-gray-900 font-medium">
                                {booking.productSummary ?? booking.bookingType ?? "Booking"}
                              </h3>
                              {renderStatusBadge(booking.status)}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{`Reference: ${booking.bookingReference}`}</p>
                              {booking.confirmationNumber && <p>{`Confirmation: ${booking.confirmationNumber}`}</p>}
                              <p>{`Created: ${formatDateTime(booking.createdAt)}`}</p>
                              <p>{`Updated: ${formatDateTime(booking.updatedAt)}`}</p>
                              {isProcessing && hasCountdown && (
                                <p className={`flex items-center gap-2 ${isExpired ? 'text-red-500' : 'text-amber-600'}`}>
                                  <Clock3 className="h-4 w-4" />
                                  {isExpired ? 'Reservation hold expired' : `Reservation expires in ${countdown}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 text-sm md:items-end">
                          <span className="text-gray-900 font-semibold text-base">
                            {formatCurrency(booking.totalAmount, booking.currency)}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => handleViewDetails(booking)}
                              disabled={detailLoadingId === bookingId}
                            >
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 space-y-4">
                          {detailLoadingId === bookingId && (
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading booking details…
                            </div>
                          )}
                          {detailError && (
                            <div className="flex items-center gap-2 text-sm text-red-400">
                              <AlertTriangle className="h-4 w-4" />
                              {detailError}
                            </div>
                          )}
                          {detail && detailLoadingId !== bookingId && (
                            <div className="space-y-4">
                              {renderFlightDetails(detail.flight, detail.fallbackFlight)}
                              {renderHotelDetails(detail.hotel, detail.fallbackHotel)}
                              {!detail.flight && !detail.hotel && !detail.fallbackFlight && !detail.fallbackHotel && (
                                <p className="text-sm text-gray-300">No additional details available for this booking.</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(booking.bookingType === 'FLIGHT' || booking.bookingType === 'COMBO') && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleShowFlightLocation(booking, 'origin')}>
                              View departure on map
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleShowFlightLocation(booking, 'destination')}>
                              View arrival on map
                            </Button>
                          </>
                        )}
                        {(booking.bookingType === 'HOTEL' || booking.bookingType === 'COMBO') && (
                          <Button variant="outline" size="sm" onClick={() => handleShowHotelLocation(booking)}>
                            View hotel on map
                          </Button>
                        )}
                        {isProcessing && (!hasCountdown || !isExpired) && (
                          <Button size="sm" onClick={() => handleContinueBooking(booking)}>
                            Continue booking
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading booking history…
            </div>
          )}

          {hasNext && !isLoading && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
