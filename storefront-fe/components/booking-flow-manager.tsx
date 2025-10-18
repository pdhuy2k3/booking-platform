"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
import { useBooking } from '@/contexts/booking-context'
import { BookingFlow } from '@/components/booking-flow'
import { FlightBookingForm } from '@/components/flight-booking-form'
import { HotelBookingForm } from '@/components/hotel-booking-form'
import { BookingReview } from '@/components/booking-review'
import { BookingConfirmation } from '@/components/booking-confirmation'
import { BookingPaymentStep } from '@/components/booking-payment-step'
import { 
  FlightBookingDetails, 
  HotelBookingDetails, 
  ComboBookingDetails 
} from '@/modules/booking/types'

interface BookingFlowManagerProps {
  onBookingComplete: () => void
  showSelection?: boolean
}

export function BookingFlowManager({ onBookingComplete, showSelection = true }: BookingFlowManagerProps) {
  const { 
    step, 
    bookingType, 
    bookingData, 
    bookingResponse,
    selectedFlight,
    selectedHotel,
    updateBookingData, 
    nextStep, 
    prevStep, 
    createBooking,
    resetBooking,
    setBookingType,
    setStep,
    setSelectedFlight,
    setSelectedHotel,
    cancelInFlightBooking,
  } = useBooking()
  const [comboStage, setComboStage] = useState<'flight' | 'hotel'>('flight')
  
  const activeFlight = useMemo(() => (bookingType === 'hotel' ? null : selectedFlight), [bookingType, selectedFlight])
  const activeHotel = useMemo(() => (bookingType === 'flight' ? null : selectedHotel), [bookingType, selectedHotel])

  const handleStartBooking = (type: 'flight' | 'hotel' | 'both') => {
    resetBooking()
    setBookingType(type)
    setSelectedFlight(null)
    setSelectedHotel(null)
    setComboStage('flight')
    updateBookingData({
      bookingType: (type === 'both' ? 'COMBO' : type.toUpperCase()) as 'FLIGHT' | 'HOTEL' | 'COMBO',
      totalAmount: 0,
      currency: 'VND',
      productDetails: undefined,
    })
    setStep('passengers')
  }

  const handleFlightBookingSubmit = (details: FlightBookingDetails) => {
    let totalAmount = details.totalFlightPrice
    let productDetails: FlightBookingDetails | ComboBookingDetails

    if (bookingType === 'both') {
      const existingCombo = (bookingData.productDetails as ComboBookingDetails) || { flightDetails: undefined, hotelDetails: undefined }
      const hotelDetails = existingCombo.hotelDetails
      const hotelTotal = hotelDetails?.totalRoomPrice ?? 0
      totalAmount = details.totalFlightPrice + hotelTotal
      productDetails = {
        ...existingCombo,
        flightDetails: details,
      }
    }
    else {
      productDetails = details
    }

    updateBookingData({
      productDetails: productDetails,
      totalAmount,
      currency: selectedFlight?.currency || bookingData.currency || 'VND',
    })

    setSelectedFlight({
      flightId: details.flightId,
      flightNumber: details.flightNumber,
      airline: details.airline,
      origin: details.originAirport,
      destination: details.destinationAirport,
      originLatitude: details.originLatitude ?? selectedFlight?.originLatitude,
      originLongitude: details.originLongitude ?? selectedFlight?.originLongitude,
      destinationLatitude: details.destinationLatitude ?? selectedFlight?.destinationLatitude,
      destinationLongitude: details.destinationLongitude ?? selectedFlight?.destinationLongitude,
      departureTime: details.departureDateTime,
      arrivalTime: details.arrivalDateTime,
      duration: selectedFlight?.duration,
      price: details.totalFlightPrice,
      currency: selectedFlight?.currency || bookingData.currency || 'VND',
      seatClass: details.seatClass || selectedFlight?.seatClass,
      logo: selectedFlight?.logo,
      scheduleId: details.scheduleId || selectedFlight?.scheduleId,
      fareId: details.fareId || selectedFlight?.fareId,
    })
    if (bookingType === 'both') {
      setComboStage('hotel')
      return
    }
    nextStep()
  }

  const handleHotelBookingSubmit = (details: HotelBookingDetails) => {
    let totalAmount = details.totalRoomPrice
    let productDetails: HotelBookingDetails | ComboBookingDetails

    if (bookingType === 'both') {
      const existingCombo = (bookingData.productDetails as ComboBookingDetails) || { flightDetails: undefined, hotelDetails: undefined }
      const flightDetails = existingCombo.flightDetails
      const flightTotal = flightDetails?.totalFlightPrice ?? 0
      totalAmount = flightTotal + details.totalRoomPrice
      productDetails = {
        ...existingCombo,
        hotelDetails: details,
      }
    }
    else {
      productDetails = details
    }

    updateBookingData({
      productDetails: productDetails,
      totalAmount,
      currency: selectedHotel?.currency || bookingData.currency || 'VND',
    })

    setSelectedHotel({
      id: details.hotelId,
      name: selectedHotel?.name || details.hotelName,
      address: details.hotelAddress,
      city: details.city,
      country: details.country,
      hotelLatitude: details.hotelLatitude ?? selectedHotel?.hotelLatitude,
      hotelLongitude: details.hotelLongitude ?? selectedHotel?.hotelLongitude,
      rating: selectedHotel?.rating,
      roomTypeId: String(details.roomTypeId ?? selectedHotel?.roomTypeId ?? ''),
      roomId: details.roomId ?? selectedHotel?.roomId ?? '',
      roomType: details.roomType,
      roomName: details.roomName,
      price: details.pricePerNight,
      pricePerNight: details.pricePerNight,
      totalPrice: details.totalRoomPrice,
      currency: selectedHotel?.currency || bookingData.currency || 'VND',
      amenities: selectedHotel?.amenities || [],
      image: selectedHotel?.image,
      checkInDate: details.checkInDate,
      checkOutDate: details.checkOutDate,
      guests: details.numberOfGuests,
      rooms: details.numberOfRooms,
      nights: details.numberOfNights,
    })
    nextStep()
  }

  const handleConfirmBooking = async () => {
    await createBooking()
  }

  const handlePaymentComplete = () => {
    nextStep()
  }

  const handlePaymentBack = () => {
    prevStep()
  }

  const handleCancelBooking = () => {
    if (bookingResponse?.bookingId) {
      void cancelInFlightBooking()
    } else {
      resetBooking()
    }
    setComboStage('flight')
  }

  const handleNewBooking = () => {
    resetBooking()
  }

  const handleViewBookings = () => {
    resetBooking()
    onBookingComplete()
  }

  const handleEditDetails = () => {
    prevStep()
  }

  useEffect(() => {
    if (bookingType !== 'both') {
      setComboStage('flight')
    }
  }, [bookingType])

  useEffect(() => {
    if (step === 'selection') {
      setComboStage('flight')
    }
  }, [step])

  const comboDetails = bookingData.bookingType === 'COMBO'
    ? (bookingData.productDetails as ComboBookingDetails | undefined)
    : undefined
  const hasFlightDetails = Boolean(comboDetails?.flightDetails)

  return (
    <div className="container mx-auto py-8">
      {step === 'selection' && showSelection && (
      <BookingFlow 
        onStartBooking={handleStartBooking} 
        isVisible={true} 
      />
    )}

      {step === 'passengers' && bookingType === 'flight' && activeFlight && (
        <FlightBookingForm 
          flight={activeFlight} 
          onSubmit={handleFlightBookingSubmit}
          onCancel={prevStep}
        />
      )}

      {step === 'passengers' && bookingType === 'flight' && !activeFlight && (
        <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-8 text-center space-y-4">
          <h3 className="text-lg font-semibold">Không tìm thấy thông tin chuyến bay</h3>
          <p className="text-muted-foreground">
            Vui lòng quay lại bước trước để chọn chuyến bay hoặc mở lại gợi ý và chọn lại.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={prevStep}>Quay lại</Button>
            <Button onClick={resetBooking}>Bắt đầu lại</Button>
          </div>
        </div>
      )}

      {step === 'passengers' && bookingType === 'hotel' && activeHotel && (
        <HotelBookingForm 
          hotel={activeHotel} 
          onSubmit={handleHotelBookingSubmit}
          onCancel={prevStep}
        />
      )}

      {step === 'passengers' && bookingType === 'hotel' && !activeHotel && (
        <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-8 text-center space-y-4">
          <h3 className="text-lg font-semibold">Không tìm thấy thông tin khách sạn</h3>
          <p className="text-muted-foreground">
            Vui lòng quay lại bước trước để chọn khách sạn phù hợp hoặc mở lại đề xuất để tiếp tục.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={prevStep}>Quay lại</Button>
            <Button onClick={resetBooking}>Bắt đầu lại</Button>
          </div>
        </div>
      )}

      {step === 'passengers' && bookingType === 'both' && (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={comboStage === 'flight' ? 'default' : 'outline'}
              onClick={() => setComboStage('flight')}
            >
              1. Thông tin chuyến bay
            </Button>
            <Button
              variant={comboStage === 'hotel' ? 'default' : 'outline'}
              disabled={!hasFlightDetails}
              onClick={() => setComboStage('hotel')}
            >
              2. Thông tin khách sạn
            </Button>
          </div>

          {comboStage === 'flight' ? (
            activeFlight ? (
              <FlightBookingForm
                flight={activeFlight}
                onSubmit={handleFlightBookingSubmit}
                onCancel={prevStep}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
                Không có dữ liệu chuyến bay. Quay lại bước trước để chọn chuyến bay.
              </div>
            )
          ) : activeHotel ? (
            <HotelBookingForm
              hotel={activeHotel}
              onSubmit={handleHotelBookingSubmit}
              onCancel={() => setComboStage('flight')}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
              Không có dữ liệu khách sạn. Quay lại bước trước để chọn khách sạn.
            </div>
          )}
        </div>
      )}

      {step === 'review' && (
        <BookingReview
          bookingType={bookingData.bookingType}
          flightDetails={
            bookingData.bookingType === 'FLIGHT' 
              ? bookingData.productDetails as FlightBookingDetails
              : bookingData.bookingType === 'COMBO'
              ? (bookingData.productDetails as ComboBookingDetails).flightDetails
              : undefined
          }
          hotelDetails={
            bookingData.bookingType === 'HOTEL' 
              ? bookingData.productDetails as HotelBookingDetails
              : bookingData.bookingType === 'COMBO'
              ? (bookingData.productDetails as ComboBookingDetails).hotelDetails
              : undefined
          }
          comboDetails={
            bookingData.bookingType === 'COMBO' 
              ? bookingData.productDetails as ComboBookingDetails
              : undefined
          }
          onConfirm={handleConfirmBooking}
          onEdit={handleEditDetails}
          onCancel={prevStep}
        />
      )}

      {step === 'payment' && (
        <BookingPaymentStep
          onPaymentSuccess={handlePaymentComplete}
          onBack={handlePaymentBack}
          onCancel={handleCancelBooking}
        />
      )}

      {step === 'confirmation' && (
        <BookingConfirmation
          onNewBooking={handleNewBooking}
          onViewBookings={handleViewBookings}
        />
      )}

      {step === 'error' && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Booking Error</h2>
          <p className="text-muted-foreground mb-6">
            There was an error processing your booking. Please try again.
          </p>
          <div className="space-x-4">
            <Button variant="outline" onClick={prevStep}>
              Go Back
            </Button>
            <Button onClick={resetBooking}>
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
