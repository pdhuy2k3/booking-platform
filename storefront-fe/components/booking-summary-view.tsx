"use client"

import { useEffect, useMemo, useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useBooking } from '@/contexts/booking-context'
import { BookingFlowManager } from '@/components/booking-flow-manager'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { format } from 'date-fns'
import { formatCurrency, formatPrice } from '@/lib/currency'
import { Plane, Building2, Clock, MapPin, Users, Calendar as CalendarIcon, RefreshCcw, ArrowRight } from 'lucide-react'

const parseDateValue = (value?: string) => {
  if (!value) return null

  const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.exec(value)
  if (dateOnlyMatch) {
    const [year, month, day] = value.split('-').map((part) => Number(part))
    if ([year, month, day].every((part) => Number.isInteger(part))) {
      return new Date(year, month - 1, day)
    }
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

const formatDateTime = (value?: string) => {
  const parsed = parseDateValue(value)
  if (!parsed) {
    return value || 'Chưa có'
  }
  return format(parsed, 'PPP p')
}

const formatDate = (value?: string) => {
  const parsed = parseDateValue(value)
  if (!parsed) {
    return value || 'Chưa có'
  }
  return format(parsed, 'PPP')
}

export function BookingSummaryView() {
  const router = useRouter()
  const {
    selectedFlight,
    selectedHotel,
    bookingType,
    bookingData,
    step,
    setStep,
    setBookingType,
    updateBookingData,
    resetBooking,
  } = useBooking()
  const [showFlow, setShowFlow] = useState(step !== 'selection')
  const [initialized, setInitialized] = useState(false)
  const bookingFlowRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated, isLoading: authLoading, login } = useAuth()

  const derivedType = useMemo(() => {
    if (bookingType) return bookingType
    if (selectedFlight && selectedHotel) return 'both'
    if (selectedFlight) return 'flight'
    if (selectedHotel) return 'hotel'
    return null
  }, [bookingType, selectedFlight, selectedHotel])

  const canProceed = useMemo(() => {
    if (derivedType === 'both') return Boolean(selectedFlight && selectedHotel)
    if (derivedType === 'flight') return Boolean(selectedFlight)
    if (derivedType === 'hotel') return Boolean(selectedHotel)
    return false
  }, [derivedType, selectedFlight, selectedHotel])

  const hotelPricing = useMemo(() => {
    if (!selectedHotel) return null

    const pricePerNight = Number(
      selectedHotel.pricePerNight ??
      selectedHotel.price ??
      selectedHotel.totalPrice ??
      0
    )
    const rooms = Math.max(1, Number(selectedHotel.rooms ?? 1))

    let nights = Number(selectedHotel.nights ?? 0)
    if (!Number.isFinite(nights) || nights <= 0) {
      const { checkInDate, checkOutDate } = selectedHotel
      const checkIn = parseDateValue(checkInDate)
      const checkOut = parseDateValue(checkOutDate)

      if (checkIn && checkOut) {
        const diffMs = checkOut.getTime() - checkIn.getTime()
        const dayInMs = 1000 * 60 * 60 * 24
        if (diffMs > 0) {
          nights = Math.max(1, Math.round(diffMs / dayInMs))
        }
      }
    }

    if (!Number.isFinite(nights) || nights <= 0) {
      nights = 1
    }

    const total = Number(
      selectedHotel.totalPrice ??
      pricePerNight * nights * rooms
    )

    return {
      pricePerNight,
      nights,
      rooms,
      total,
    }
  }, [selectedHotel])

  useEffect(() => {
    if (!initialized) {
      // Always land on summary view first, even if coming from another page
      if (step !== 'selection') {
        setStep('selection')
      }
      setInitialized(true)
      setShowFlow(false)
      return
    }
    setShowFlow(step !== 'selection')
  }, [initialized, setStep, step])

  const ensureBookingType = () => {
    if (!derivedType) return
    if (!bookingType || bookingType !== derivedType) {
      setBookingType(derivedType)
    }
    const upper = derivedType === 'both' ? 'COMBO' : derivedType.toUpperCase()
    if (bookingData.bookingType !== upper) {
      updateBookingData({ bookingType: upper as any })
    }
  }

  const handleProceed = () => {
    if (!canProceed || authLoading) return

    if (!isAuthenticated) {
      toast({
        title: 'Yêu cầu đăng nhập',
        description: 'Vui lòng đăng nhập để tiếp tục đặt chỗ.',
        action: (
          <ToastAction altText="Đăng nhập" onClick={login}>
            Đăng nhập
          </ToastAction>
        ),
      })
      return
    }

    ensureBookingType()
    setStep('passengers')
    setShowFlow(true)
    
    // Scroll to the booking flow after a short delay to ensure DOM is updated
    setTimeout(() => {
      if (bookingFlowRef.current) {
        bookingFlowRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 100)
  }

  const handleBookingComplete = () => {
    setShowFlow(false)
  }

  const handleReset = () => {
    resetBooking()
    setShowFlow(false)
  }

  const totalEstimated = useMemo(() => {
    const currency = selectedFlight?.currency || selectedHotel?.currency || 'VND'

    if (derivedType === 'both' && selectedFlight && hotelPricing) {
      return formatCurrency((selectedFlight.price || 0) + hotelPricing.total, currency)
    }

    if (derivedType === 'flight' && selectedFlight) {
      return formatCurrency(selectedFlight.price || 0, currency)
    }

    if (derivedType === 'hotel' && hotelPricing) {
      return formatCurrency(hotelPricing.total, selectedHotel?.currency || 'VND')
    }

    return null
  }, [derivedType, selectedFlight, selectedHotel, hotelPricing])

  const renderFlightCard = () => {
    if (!selectedFlight) return null
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Chuyến bay đã chọn</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/?tab=search&searchTab=flights')}>
              Đổi chuyến bay
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('/?tab=search&searchTab=flights')}>
              <RefreshCcw className="h-4 w-4" />
              <span className="sr-only">Đổi chuyến bay</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center">
                {selectedFlight.logo ? (
                  <Image
                    src={selectedFlight.logo}
                    alt={selectedFlight.airline}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <Plane className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{selectedFlight.airline}</p>
                <p className="text-lg font-semibold">
                  {selectedFlight.origin} → {selectedFlight.destination}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-muted-foreground">Giá ước tính</p>
              <p className="text-lg font-semibold">{formatCurrency(selectedFlight.price || 0, selectedFlight.currency || 'VND')}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> Thời gian bay
              </p>
              <p className="mt-1 font-medium">{selectedFlight.duration || 'Chưa có'}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" /> Hạng ghế
              </p>
              <p className="mt-1 font-medium">{selectedFlight.seatClass || 'Chưa có'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <CalendarIcon className="h-4 w-4" /> Giờ khởi hành
              </p>
              <p className="mt-1 text-sm font-medium">{formatDateTime(selectedFlight.departureTime)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <CalendarIcon className="h-4 w-4" /> Giờ hạ cánh
              </p>
              <p className="mt-1 text-sm font-medium">{formatDateTime(selectedFlight.arrivalTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderHotelCard = () => {
    if (!selectedHotel) return null
    const pricing = hotelPricing
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Khách sạn đã chọn</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/?tab=search&searchTab=hotels')}>
              Đổi khách sạn
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('/?tab=search&searchTab=hotels')}>
              <RefreshCcw className="h-4 w-4" />
              <span className="sr-only">Đổi khách sạn</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{selectedHotel.city}, {selectedHotel.country}</p>
              <p className="text-lg font-semibold">{selectedHotel.name}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{selectedHotel.address}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-muted-foreground">Giá mỗi đêm</p>
              <p className="text-lg font-semibold">
                {formatPrice(
                  pricing?.pricePerNight ??
                  selectedHotel.pricePerNight ??
                  selectedHotel.price ??
                  0
                )}
              </p>
              {pricing && (
                <>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pricing.rooms} phòng · {pricing.nights} đêm
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    Tổng: {formatPrice(pricing.total)}
                  </p>
                </>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Hạng phòng</p>
              <p className="mt-1 font-medium">{selectedHotel.roomName}</p>
              <Badge variant="secondary" className="mt-2 text-xs">
                {selectedHotel.roomType}
              </Badge>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Nhận phòng</p>
              <p className="mt-1 font-medium">{formatDate(selectedHotel.checkInDate)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Trả phòng</p>
              <p className="mt-1 font-medium">{formatDate(selectedHotel.checkOutDate)}</p>
            </div>
          </div>

          {pricing && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Giá mỗi đêm</p>
                <p className="mt-1 font-semibold">{formatPrice(pricing.pricePerNight)}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Số đêm</p>
                <p className="mt-1 font-semibold">{pricing.nights}</p>
                <p className="text-xs text-muted-foreground">
                  {pricing.rooms} phòng
                  {selectedHotel.guests ? ` · ${selectedHotel.guests} khách` : ''}
                </p>
              </div>
              <div className="rounded-lg border bg-primary/10 p-4 text-right md:text-left">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tổng giá</p>
                <p className="mt-1 text-lg font-semibold text-primary">{formatPrice(pricing.total)}</p>
              </div>
            </div>
          )}

          {selectedHotel.amenities?.length ? (
            <div className="flex flex-wrap gap-2">
              {selectedHotel.amenities.slice(0, 6).map((amenity) => (
                <Badge key={amenity} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  const renderEmptyState = () => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <Building2 className="h-10 w-10 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-semibold">Chưa có lựa chọn nào</h2>
          <p className="mt-1 text-muted-foreground">
            Hãy chọn chuyến bay hoặc khách sạn để bắt đầu đặt chỗ. Bạn có thể quay lại trang này bất cứ lúc nào để hoàn tất.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => router.push('/?tab=search&searchTab=flights')}>Tìm chuyến bay</Button>
          <Button variant="outline" onClick={() => router.push('/?tab=search&searchTab=hotels')}>
            Tìm khách sạn
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 bg-background h-full flex flex-col">
      <div className="container mx-auto max-w-full space-y-4 px-4 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Xem lại hành trình</h1>
            <p className="text-muted-foreground">
              Kiểm tra chuyến bay và nơi lưu trú đã chọn trước khi nhập thông tin hành khách.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => { router.push('/'); }}>
              Quay lại trợ lý
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Xóa lựa chọn
            </Button>
          </div>
        </div>

        {selectedFlight || selectedHotel ? (
          <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pb-4">
            {renderFlightCard()}
            {renderHotelCard()}
            {totalEstimated && (
              <Card>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Tổng chi phí dự kiến</p>
                    <p className="text-2xl font-semibold">{totalEstimated}</p>
                  </div>
                  <Button
                    size="lg"
                    className="gap-2"
                    disabled={!canProceed || authLoading}
                    onClick={handleProceed}
                  >
                    Tiếp tục đặt chỗ
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto">
            {renderEmptyState()}
          </div>
        )}

        {showFlow && (
          <div 
            ref={bookingFlowRef}
            className="rounded-lg border bg-card shadow-sm flex-1 min-h-0 transition-all duration-300 relative"
          >
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFlow(false)}
                className="rounded-full bg-background/80 backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="m12 19-7-7 7-7" />
                </svg>
                <span className="sr-only">Quay lại</span>
              </Button>
            </div>
            <div className="pt-12">
              <BookingFlowManager onBookingComplete={handleBookingComplete} showSelection={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
