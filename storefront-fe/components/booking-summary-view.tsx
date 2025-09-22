"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useBooking } from '@/contexts/booking-context'
import { BookingFlowManager } from '@/components/booking-flow-manager'
import { format } from 'date-fns'
import { formatCurrency, formatPrice } from '@/lib/currency'
import { Plane, Building2, Clock, MapPin, Users, Calendar as CalendarIcon, RefreshCcw, ArrowRight } from 'lucide-react'

const formatDateTime = (value?: string) => {
  if (!value) return 'N/A'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return format(parsed, 'PPP p')
}

const formatDate = (value?: string) => {
  if (!value) return 'N/A'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
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
    if (!canProceed) return
    ensureBookingType()
    setStep('passengers')
    setShowFlow(true)
  }

  const handleBookingComplete = () => {
    setShowFlow(false)
  }

  const handleReset = () => {
    resetBooking()
    setShowFlow(false)
  }

  const totalEstimated = useMemo(() => {
    const currency = selectedFlight?.currency || 'VND'
    if (derivedType === 'both' && selectedFlight && selectedHotel) {
      return formatCurrency((selectedFlight.price || 0) + (selectedHotel.price || 0), currency)
    }
    if (derivedType === 'flight' && selectedFlight) {
      return formatCurrency(selectedFlight.price || 0, currency)
    }
    if (derivedType === 'hotel' && selectedHotel) {
      return formatPrice(selectedHotel.price || 0)
    }
    return null
  }, [derivedType, selectedFlight, selectedHotel])

  const renderFlightCard = () => {
    if (!selectedFlight) return null
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Selected Flight</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/?tab=search&searchTab=flights')}>
              Change flight
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('/?tab=search&searchTab=flights')}>
              <RefreshCcw className="h-4 w-4" />
              <span className="sr-only">Change flight</span>
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
              <p className="text-xs uppercase text-muted-foreground">Estimated fare</p>
              <p className="text-lg font-semibold">{formatCurrency(selectedFlight.price || 0, selectedFlight.currency || 'VND')}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> Duration
              </p>
              <p className="mt-1 font-medium">{selectedFlight.duration || 'N/A'}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" /> Cabin
              </p>
              <p className="mt-1 font-medium">{selectedFlight.seatClass || 'N/A'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <CalendarIcon className="h-4 w-4" /> Departure
              </p>
              <p className="mt-1 text-sm font-medium">{formatDateTime(selectedFlight.departureTime)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <CalendarIcon className="h-4 w-4" /> Arrival
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
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Selected Stay</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/?tab=search&searchTab=hotels')}>
              Change room
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('/?tab=search&searchTab=hotels')}>
              <RefreshCcw className="h-4 w-4" />
              <span className="sr-only">Change room</span>
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
              <p className="text-xs uppercase text-muted-foreground">Nightly rate</p>
              <p className="text-lg font-semibold">{formatPrice(selectedHotel.price || 0)}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Room Type</p>
              <p className="mt-1 font-medium">{selectedHotel.roomName}</p>
              <Badge variant="secondary" className="mt-2 text-xs">
                {selectedHotel.roomType}
              </Badge>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Check-in</p>
              <p className="mt-1 font-medium">{formatDate(selectedHotel.checkInDate)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Check-out</p>
              <p className="mt-1 font-medium">{formatDate(selectedHotel.checkOutDate)}</p>
            </div>
          </div>

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
          <h2 className="text-xl font-semibold">No selections yet</h2>
          <p className="mt-1 text-muted-foreground">
            Choose a flight or hotel to start your booking. You can come back here anytime to complete the process.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => router.push('/?tab=search&searchTab=flights')}>Find flights</Button>
          <Button variant="outline" onClick={() => router.push('/?tab=search&searchTab=hotels')}>
            Browse hotels
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8 bg-background py-10">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Review Your Trip</h1>
            <p className="text-muted-foreground">
              Confirm your selected flight and stay before entering passenger and guest details.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => { router.push('/'); }}>
              Back to assistant
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset selections
            </Button>
          </div>
        </div>

        {selectedFlight || selectedHotel ? (
          <div className="space-y-6">
            {renderFlightCard()}
            {renderHotelCard()}
            {totalEstimated && (
              <Card>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Estimated total</p>
                    <p className="text-2xl font-semibold">{totalEstimated}</p>
                  </div>
                  <Button
                    size="lg"
                    className="gap-2"
                    disabled={!canProceed}
                    onClick={handleProceed}
                  >
                    Continue to booking
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          renderEmptyState()
        )}

        {showFlow && (
          <div className="rounded-lg border bg-card shadow-sm">
            <BookingFlowManager onBookingComplete={handleBookingComplete} showSelection={false} />
          </div>
        )}
      </div>
    </div>
  )
}
