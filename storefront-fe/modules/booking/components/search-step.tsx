"use client"

import { useState } from "react"
import { useBooking } from "@/common/contexts/booking-context"
import { FlightSearchForm } from "./flight-search-form"
import { HotelSearchForm } from "./hotel-search-form"
import { Button } from "@/common/components/ui/button"

export function SearchStep() {
  const { state, nextStep } = useBooking()

  const handleNext = () => {
    nextStep()
  }

  const canProceed = state.flightSearch || state.hotelSearch;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Search for Your Trip</h2>
        <p className="text-gray-600">
          {state.bookingType === "FLIGHT" && "Find the perfect flight for your journey"}
          {state.bookingType === "HOTEL" && "Discover amazing hotels for your stay"}
          {state.bookingType === "COMBO" && "Search for flights and hotels together"}
          {(state.bookingType === "BUS" || state.bookingType === "TRAIN") && "Find transportation options"}
        </p>
      </div>

      <div className="space-y-8">
        {/* Flight Search */}
        {(state.bookingType === "FLIGHT" || state.bookingType === "COMBO") && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Flight Search</h3>
            <FlightSearchForm />
          </div>
        )}

        {/* Hotel Search */}
        {(state.bookingType === "HOTEL" || state.bookingType === "COMBO") && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hotel Search</h3>
            <HotelSearchForm />
          </div>
        )}

        {/* Transport Search (Bus/Train) */}
        {(state.bookingType === "BUS" || state.bookingType === "TRAIN") && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {state.bookingType} booking is coming soon!
            </p>
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button 
          onClick={handleNext}
          disabled={!canProceed}
          size="lg"
        >
          Search & Continue
        </Button>
      </div>
    </div>
  )
}
