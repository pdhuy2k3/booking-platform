"use client"

import React, { useState } from 'react'
import { BookingProvider } from '@/contexts/booking-context'
import { BookingFlowManager } from '@/components/booking-flow-manager'
import { Button } from '@/components/ui/button'

export default function BookingPage() {
  const [showBookingFlow, setShowBookingFlow] = useState(true)

  const handleBookingComplete = () => {
    setShowBookingFlow(false)
  }

  const handleStartBooking = () => {
    setShowBookingFlow(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Book Your Trip</h1>
          {!showBookingFlow && (
            <Button onClick={handleStartBooking}>
              Start New Booking
            </Button>
          )}
        </div>

        {showBookingFlow ? (
          <BookingProvider>
            <BookingFlowManager onBookingComplete={handleBookingComplete} />
          </BookingProvider>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Ready to Book Your Trip?</h2>
            <p className="text-muted-foreground mb-6">
              Start your journey by creating a new booking.
            </p>
            <Button onClick={handleStartBooking} size="lg">
              Create Booking
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}