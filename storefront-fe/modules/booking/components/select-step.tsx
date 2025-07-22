"use client"

import { useState, useEffect } from "react"
import { useBooking } from "@/common/contexts/booking-context"
import { FlightService } from "@/modules/flights/api";
import { HotelService } from "@/modules/hotels/api";
import { FlightSearchResult, HotelSearchResult } from "@/modules/booking/types"
import { Button } from "@/common/components/ui/button"
import { FlightCard } from "./flight-card"
import { HotelCard } from "./hotel-card"
import { Loader2 } from "lucide-react"

export function SelectStep() {
  const { state, nextStep, prevStep } = useBooking()
  
  const [flightResults, setFlightResults] = useState<FlightSearchResult[]>([])
  const [hotelResults, setHotelResults] = useState<HotelSearchResult[]>([])
  const [loadingFlights, setLoadingFlights] = useState(false)
  const [loadingHotels, setLoadingHotels] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search flights
  useEffect(() => {
    if (state.flightSearch && (state.bookingType === "FLIGHT" || state.bookingType === "COMBO")) {
      setLoadingFlights(true)
      setError(null)
      
      FlightService.searchFlights(state.flightSearch)
        .then(results => {
          setFlightResults(results.flights)
        })
        .catch(err => {
          setError("Failed to search flights. Please try again.")
          console.error("Flight search error:", err)
        })
        .finally(() => {
          setLoadingFlights(false)
        })
    }
  }, [state.flightSearch, state.bookingType])

  // Search hotels
  useEffect(() => {
    if (state.hotelSearch && (state.bookingType === "HOTEL" || state.bookingType === "COMBO")) {
      setLoadingHotels(true)
      setError(null)
      
      HotelService.searchHotels(state.hotelSearch)
        .then(results => {
          setHotelResults(results.hotels)
        })
        .catch(err => {
          setError("Failed to search hotels. Please try again.")
          console.error("Hotel search error:", err)
        })
        .finally(() => {
          setLoadingHotels(false)
        })
    }
  }, [state.hotelSearch, state.bookingType])

  const handleNext = () => {
    nextStep()
  }

  const canProceed = (
    (state.bookingType === 'FLIGHT' && state.selectedFlight) ||
    (state.bookingType === 'HOTEL' && state.selectedHotel && state.selectedRoom) ||
    (state.bookingType === 'COMBO' && state.selectedFlight && state.selectedHotel && state.selectedRoom)
  );

  const isLoading = loadingFlights || loadingHotels

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Select Your Options</h2>
        <p className="text-gray-600">Choose from the available options below</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Flight Results */}
      {(state.bookingType === "FLIGHT" || state.bookingType === "COMBO") && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Available Flights</h3>
          
          {loadingFlights ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Searching flights...</span>
            </div>
          ) : flightResults.length > 0 ? (
            <div className="space-y-3">
              {flightResults.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  isSelected={state.selectedFlight?.id === flight.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No flights found for your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Hotel Results */}
      {(state.bookingType === "HOTEL" || state.bookingType === "COMBO") && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Available Hotels</h3>
          
          {loadingHotels ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Searching hotels...</span>
            </div>
          ) : hotelResults.length > 0 ? (
            <div className="space-y-4">
              {hotelResults.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  isSelected={state.selectedHotel?.id === hotel.id}
                  selectedRoom={state.selectedRoom}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hotels found for your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={prevStep}>
          Back to Search
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!canProceed || isLoading}
        >
          Continue to Details
        </Button>
      </div>
    </div>
  )
}