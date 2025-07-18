"use client"

import { useBooking } from "@/lib/booking-context"
import { BookingTypeSelector } from "./booking-type-selector"
import { SearchStep } from "./search-step"
import { SelectStep } from "./select-step"
import { DetailsStep } from "./details-step"
import { PaymentStep } from "./payment-step"
import { ConfirmationStep } from "./confirmation-step"
import { BookingProgress } from "./booking-progress"

export function BookingFlow() {
  const { state } = useBooking()

  const renderStep = () => {
    switch (state.step) {
      case "SEARCH":
        return <SearchStep />
      case "SELECT":
        return <SelectStep />
      case "DETAILS":
        return <DetailsStep />
      case "PAYMENT":
        return <PaymentStep />
      case "CONFIRMATION":
        return <ConfirmationStep />
      default:
        return <SearchStep />
    }
  }

  return (
    <div className="space-y-8">
      {/* Booking Type Selector - Always visible */}
      <BookingTypeSelector />
      
      {/* Progress Indicator */}
      <BookingProgress />
      
      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {renderStep()}
      </div>
    </div>
  )
}
