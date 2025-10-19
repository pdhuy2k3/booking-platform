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
import { mapboxService } from "@/modules/mapbox/services/mapboxClientService"

const RESUME_STORAGE_KEY = "bookingResumePayload"
const PROCESSING_STATUSES = new Set(["PENDING", "VALIDATION_PENDING", "PAYMENT_PENDING"])

const PAGE_SIZE = 10

const STATUS_BADGE_MAP: Record<string, { label: string; className: string; icon: JSX.Element }> = {
  CONFIRMED: { label: "Đã xác nhận", className: "bg-green-500/10 text-green-400", icon: <CheckCircle2 className="h-4 w-4" /> },
  PAID: { label: "Đã thanh toán", className: "bg-green-500/10 text-green-400", icon: <CheckCircle2 className="h-4 w-4" /> },
  PENDING: { label: "Đang xử lý", className: "bg-amber-500/10 text-amber-400", icon: <Clock3 className="h-4 w-4" /> },
  PAYMENT_PENDING: { label: "Chờ thanh toán", className: "bg-amber-500/10 text-amber-400", icon: <Clock3 className="h-4 w-4" /> },
  VALIDATION_PENDING: { label: "Đang xác thực", className: "bg-blue-500/10 text-blue-400", icon: <Clock3 className="h-4 w-4" /> },
  CANCELLED: { label: "Đã hủy", className: "bg-red-500/10 text-red-400", icon: <XCircle className="h-4 w-4" /> },
  CANCELED: { label: "Đã hủy", className: "bg-red-500/10 text-red-400", icon: <XCircle className="h-4 w-4" /> },
  FAILED: { label: "Thất bại", className: "bg-red-500/10 text-red-400", icon: <XCircle className="h-4 w-4" /> },
  PAYMENT_FAILED: { label: "Thanh toán thất bại", className: "bg-red-500/10 text-red-400", icon: <AlertTriangle className="h-4 w-4" /> },
  VALIDATION_FAILED: { label: "Xác thực thất bại", className: "bg-red-500/10 text-red-400", icon: <AlertTriangle className="h-4 w-4" /> },
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
        <h4 className="font-semibold text-gray-700">Chi tiết chuyến bay</h4>
        <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
          <div>
            <span className="text-xs uppercase text-gray-500">Chuyến bay</span>
            <p className="font-medium">{flightNumber || 'N/A'}</p>
            {airline && <p className="text-xs text-gray-500">{airline}</p>}
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Hành trình</span>
            <p className="font-medium">{origin || '—'} → {destination || '—'}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Khởi hành</span>
          <p>{formatDateTime(departure)}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Đến</span>
          <p>{formatDateTime(arrival)}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Hạng ghế</span>
            <p>{seatClass}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Giá vé</span>
            <p>{formatCurrency(price ?? priceRaw, currency)}</p>
            {availableSeats != null && Number.isFinite(availableSeats) && (
              <p className="text-xs text-gray-500">Số ghế trống: {availableSeats}</p>
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
        <h4 className="font-semibold text-gray-700">Chi tiết phòng</h4>
        <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
          <div>
            <span className="text-xs uppercase text-gray-500">Phòng</span>
            <p className="font-medium">{title || 'Phòng'}</p>
            {roomNumber && <p className="text-xs text-gray-500">Mã phòng: {roomNumber}</p>}
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Giá</span>
            <p>{formatCurrency(price ?? priceRaw, currency)}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Sức chứa</span>
            <p>{capacity ? `${capacity} khách` : '—'}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500">Loại giường</span>
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
  const { showLocation, showLocations, showJourney, setMapStyle } = useRecommendPanel()
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
        title: "Vị trí không có sẵn",
        description: `Sân bay ${target === 'origin' ? 'khởi hành' : 'đến'} chưa được cấu hình tọa độ trong hệ thống.`,
        variant: "destructive",
      })
      return
    }

    showLocation({
      lat: lat as number,
      lng: lng as number,
      title: `${target === 'origin' ? 'Khởi hành' : 'Đến'} • ${booking.bookingReference}`,
      description: booking.productSummary ?? undefined,
      type: 'airport'
    });
  }, [showLocation, toast])

  const handleShowHotelLocation = useCallback((booking: BookingHistoryItemDto) => {
    const latValue = booking.hotelLatitude
    const lngValue = booking.hotelLongitude
    const lat = typeof latValue === 'string' ? Number(latValue) : latValue
    const lng = typeof lngValue === 'string' ? Number(lngValue) : lngValue

    if (!Number.isFinite(lat ?? NaN) || !Number.isFinite(lng ?? NaN)) {
      toast({
        title: "Vị trí không có sẵn",
        description: "Vị trí khách sạn chưa được cấu hình trong hệ thống.",
        variant: "destructive",
      })
      return;
    }

    setMapStyle('mapbox://styles/phamduyhuy/cmgnvqn9e00tl01s69xu41j43');
    showLocation({
      lat: lat as number,
      lng: lng as number,
      title: `Khách sạn • ${booking.bookingReference}`,
      description: booking.productSummary ?? undefined,
      type: 'hotel'
    });
  }, [showLocation, toast, setMapStyle]);

  const handleShowFlightJourney = useCallback((booking: BookingHistoryItemDto) => {
    const originLat = typeof booking.originLatitude === 'string' ? Number(booking.originLatitude) : booking.originLatitude;
    const originLng = typeof booking.originLongitude === 'string' ? Number(booking.originLongitude) : booking.originLongitude;
    const destLat = typeof booking.destinationLatitude === 'string' ? Number(booking.destinationLatitude) : booking.destinationLatitude;
    const destLng = typeof booking.destinationLongitude === 'string' ? Number(booking.destinationLongitude) : booking.destinationLongitude;

    if (!originLat || !originLng || !destLat || !destLng) {
      toast({
        title: "Hành trình không có sẵn",
        description: "Đặt vé máy bay này không có đủ dữ liệu tọa độ để hiển thị hành trình.",
        variant: "destructive",
      });
      return;
    }

    setMapStyle('mapbox://styles/phamduyhuy/cmgnvl0ec00ud01se98ju3a80');
    const originLabel = booking.originAirportCode || booking.originCity || '';
    const destinationLabel = booking.destinationAirportCode || booking.destinationCity || '';
    const markerLabel = booking.bookingReference
      ?? (originLabel && destinationLabel ? `${originLabel} → ${destinationLabel}` : 'Hành trình');

    const pathCoordinates = mapboxService.generateFlightPath(
      { latitude: originLat, longitude: originLng },
      { latitude: destLat, longitude: destLng }
    );

    const resolvedCoordinates = pathCoordinates.length > 1
      ? pathCoordinates
      : [[originLng, originLat], [destLng, destLat]] as [number, number][];

    showJourney({
      id: booking.bookingId,
      origin: { latitude: originLat, longitude: originLng },
      destination: { latitude: destLat, longitude: destLng },
      color: '#ef4444',
      travelMode: 'flight',
      animate: true,
      markerLabel,
      pathCoordinates: resolvedCoordinates,
      durationMs: Math.max(8000, resolvedCoordinates.length * 22)
    });

    showLocations([
      {
        id: `${booking.bookingId}-origin`,
        lat: originLat,
        lng: originLng,
        title: originLabel ? `Khởi hành: ${originLabel}` : `Khởi hành • ${booking.bookingReference}`,
        description: booking.productSummary ?? undefined,
        type: 'airport'
      },
      {
        id: `${booking.bookingId}-destination`,
        lat: destLat,
        lng: destLng,
        title: destinationLabel ? `Đến: ${destinationLabel}` : `Đến • ${booking.bookingReference}`,
        description: booking.productSummary ?? undefined,
        type: 'airport'
      }
    ], { preserveJourneys: true });

  }, [showJourney, showLocations, toast, setMapStyle]);

  const handleContinueBooking = useCallback((booking: BookingHistoryItemDto) => {
    try {
      // For all bookings, including those requiring payment, use the resume flow
      // The resumeBooking function in booking context will handle setting the correct step based on status and sagaState
      const productDetails = booking.productDetailsJson ? JSON.parse(booking.productDetailsJson) : null
      const payload = { booking, productDetails }
      
      // Store in sessionStorage with a consistent key
      sessionStorage.setItem('bookingResumePayload', JSON.stringify(payload))
      
      // Redirect to homepage with resume parameter - this will open the booking modal at the appropriate step
      router.push(`/?resume=${booking.bookingId}`)
    } catch (error) {
      console.error('Không thể chuẩn bị đặt chỗ để tiếp tục', error)
      toast({
        title: "Không thể tiếp tục đặt chỗ",
        description: "Vui lòng thử lại sau.",
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
    <div className="space-y-4 h-full flex flex-col">
      <Card className="bg-white/70 border-gray-200 flex-1 flex flex-col min-h-0">
        <CardHeader>
          <CardTitle className="text-gray-900">Lịch sử đặt chỗ</CardTitle>
          <CardDescription>Xem lại các đặt chỗ đã hoàn thành và đang thực hiện của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-50 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-red-600">{error}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={handleRetry}>
                    Thử lại
                  </Button>
                </div>
              </div>
            </div>
          )}

          {items.length === 0 && !isLoading && !error && (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có đặt chỗ nào</h3>
              <p className="text-gray-600">Lên kế hoạch cho chuyến đi tiếp theo của bạn để xem các đặt chỗ được liệt kê ở đây.</p>
            </div>
          )}

          {historyByDate.map((group) => (
            <div key={group.date} className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-gray-400">
                {formatDateOnly(group.date)}
              </div>
              <div className="space-y-2">
                {group.entries.map((booking) => {
                  const bookingId = booking.bookingId
                  const detail = detailMap[bookingId]
                  const detailError = detailErrors[bookingId]
                  const isExpanded = expandedId === bookingId
                  const countdown = formatCountdown(booking.reservationExpiresAt)
                  const isAwaitingPayment = (booking.status || '').toUpperCase() === 'PAYMENT_PENDING';
                  const isProcessing = PROCESSING_STATUSES.has((booking.status || '').toUpperCase())
                  const hasCountdown = countdown !== null
                  const isExpired = hasCountdown && countdown === '00:00'

                  return (
                    <div
                      key={bookingId}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="text-cyan-500">{getBookingIcon(booking.bookingType)}</div>
                          <div>
                            <div className="flex flex-wrap items-center gap-1">
                              <h3 className="text-gray-900 font-medium">
                                {booking.productSummary ?? booking.bookingType ?? "Đặt chỗ"}
                              </h3>
                              {renderStatusBadge(booking.status)}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{`Mã tham chiếu: ${booking.bookingReference}`}</p>
                              {booking.confirmationNumber && <p>{`Xác nhận: ${booking.confirmationNumber}`}</p>}
                              <p>{`Tạo lúc: ${formatDateTime(booking.createdAt)}`}</p>
                              <p>{`Cập nhật lúc: ${formatDateTime(booking.updatedAt)}`}</p>
                              {isProcessing && hasCountdown && (
                                <p className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : 'text-amber-600'}`}>
                                  <Clock3 className="h-4 w-4" />
                                  {isExpired ? 'Giữ chỗ đã hết hạn' : `Giữ chỗ sẽ hết hạn trong ${countdown}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-1 text-sm md:items-end">
                          <span className="text-gray-900 font-semibold text-base">
                            {formatCurrency(booking.totalAmount, booking.currency)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => handleViewDetails(booking)}
                              disabled={detailLoadingId === bookingId}
                            >
                              {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-3">
                          {detailLoadingId === bookingId && (
                            <div className="flex items-center gap-1 text-sm text-gray-300">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang tải chi tiết đặt chỗ…
                            </div>
                          )}
                          {detailError && (
                            <div className="flex items-center gap-1 text-sm text-red-400">
                              <AlertTriangle className="h-4 w-4" />
                              {detailError}
                            </div>
                          )}
                          {detail && detailLoadingId !== bookingId && (
                            <div className="space-y-3">
                              {renderFlightDetails(detail.flight, detail.fallbackFlight)}
                              {renderHotelDetails(detail.hotel, detail.fallbackHotel)}
                              {!detail.flight && !detail.hotel && !detail.fallbackFlight && !detail.fallbackHotel && (
                                <p className="text-sm text-gray-300">Không có chi tiết bổ sung cho đặt chỗ này.</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1">
                        {(booking.bookingType === 'FLIGHT' || booking.bookingType === 'COMBO') && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleShowFlightLocation(booking, 'origin')}>
                              Xem điểm đi trên bản đồ
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleShowFlightLocation(booking, 'destination')}>
                              Xem điểm đến trên bản đồ
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleShowFlightJourney(booking)}>
                              Xem hành trình
                            </Button>
                          </>
                        )}
                        {(booking.bookingType === 'HOTEL' || booking.bookingType === 'COMBO') && (
                          <Button variant="outline" size="sm" onClick={() => handleShowHotelLocation(booking)}>
                            Xem khách sạn trên bản đồ
                          </Button>
                        )}
                        {isProcessing && (!hasCountdown || !isExpired) && (
                          <Button size="sm" onClick={() => handleContinueBooking(booking)}>
                            {isAwaitingPayment || booking.status?.toUpperCase() === 'PENDING' || booking.sagaState?.toUpperCase() === 'PAYMENT_PENDING' ? 'Hoàn tất thanh toán' : 'Tiếp tục đặt chỗ'}
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
            <div className="flex items-center justify-center gap-1 text-sm text-gray-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải lịch sử đặt chỗ…
            </div>
          )}

          {hasNext && !isLoading && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleLoadMore}>
                Tải thêm
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
