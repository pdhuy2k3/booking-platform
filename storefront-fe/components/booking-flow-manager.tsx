"use client"

import React, { useState, useEffect } from 'react'
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
    setSelectedHotel
  } = useBooking()
  
  const [flight, setFlight] = useState<any>(null) // Replace with proper flight type
  const [hotel, setHotel] = useState<any>(null) // Replace with proper hotel type

  // Mock data for demonstration
  useEffect(() => {
    if (bookingType === 'flight' || bookingType === 'both') {
      if (selectedFlight) {
        setFlight(selectedFlight)
      } else {
        setFlight({
          id: 'FL123',
          flightNumber: 'VN123',
          airline: 'Vietnam Airlines',
          origin: 'HAN',
          destination: 'SGN',
          departureTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          arrivalTime: new Date(Date.now() + 86400000 + 7200000).toISOString(), // +2 hours
          duration: '2h',
          price: 1500000,
          currency: 'VND',
        })
      }
    } else {
      setFlight(null)
    }

    if (bookingType === 'hotel' || bookingType === 'both') {
      if (selectedHotel) {
        setHotel(selectedHotel)
      } else {
        setHotel({
          id: 'HT456',
          name: 'Hanoi Lotus Hotel',
          address: '123 Hang Gai Street',
          city: 'Hanoi',
          country: 'Vietnam',
          rating: 4,
          roomId: 'RM789',
          roomType: 'Deluxe',
          roomName: 'Deluxe Room with City View',
          price: 2000000,
          currency: 'VND',
          amenities: ['Free WiFi', 'Breakfast included'],
        })
      }
    } else {
      setHotel(null)
    }
  }, [bookingType, selectedFlight, selectedHotel])

  const handleStartBooking = (type: 'flight' | 'hotel' | 'both') => {
    resetBooking()
    setBookingType(type)
    setSelectedFlight(null)
    setSelectedHotel(null)
    updateBookingData({
      bookingType: (type === 'both' ? 'COMBO' : type.toUpperCase()) as any,
      totalAmount: 0,
      currency: 'VND',
      productDetails: undefined,
    })
    setStep('passengers')
  }

  const handleFlightBookingSubmit = (details: FlightBookingDetails) => {
    updateBookingData({ 
      productDetails: bookingType === 'both' 
        ? { ...(bookingData.productDetails as ComboBookingDetails), flightDetails: details }
        : details,
      totalAmount: (bookingData.totalAmount || 0) + details.totalFlightPrice
    })
    nextStep()
  }

  const handleHotelBookingSubmit = (details: HotelBookingDetails) => {
    updateBookingData({ 
      productDetails: bookingType === 'both' 
        ? { ...(bookingData.productDetails as ComboBookingDetails), hotelDetails: details }
        : details,
      totalAmount: (bookingData.totalAmount || 0) + details.totalRoomPrice
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

  return (
    <div className="container mx-auto py-8">
      {step === 'selection' && showSelection && (
        <BookingFlow 
          onStartBooking={handleStartBooking} 
          isVisible={true} 
        />
      )}

      {step === 'passengers' && bookingType === 'flight' && flight && (
        <FlightBookingForm 
          flight={flight} 
          onSubmit={handleFlightBookingSubmit}
          onCancel={prevStep}
        />
      )}

      {step === 'passengers' && bookingType === 'hotel' && hotel && (
        <HotelBookingForm 
          hotel={hotel} 
          onSubmit={handleHotelBookingSubmit}
          onCancel={prevStep}
        />
      )}

      {step === 'passengers' && bookingType === 'both' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center">Đặt gói chuyến đi</h2>
          {flight && (
            <FlightBookingForm 
              flight={flight} 
              onSubmit={handleFlightBookingSubmit}
              onCancel={prevStep}
            />
          )}
          {hotel && (
            <HotelBookingForm 
              hotel={hotel} 
              onSubmit={handleHotelBookingSubmit}
              onCancel={prevStep}
            />
          )}
        </div>
      )}

      {step === 'review' && (
        <BookingReview
          bookingType={bookingData.bookingType as any}
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
          onCancel={handleNewBooking}
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
