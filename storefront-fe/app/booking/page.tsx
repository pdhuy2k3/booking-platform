"use client"

import { BookingProvider } from "@/common/contexts/booking-context"
import { BookingFlow } from "@/modules/booking/components/booking-flow"

export default function BookingPage() {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Your Trip</h1>
            <BookingFlow />
          </div>
        </div>
      </div>
    </BookingProvider>
  )
}
