"use client"

import { useState, useEffect } from "react"
import { useBooking } from "@/lib/booking-context"
import { FlightSearchRequest } from "@/types/booking"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowLeftRight } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const popularCities = [
  { code: "HAN", name: "Hanoi", country: "Vietnam" },
  { code: "SGN", name: "Ho Chi Minh City", country: "Vietnam" },
  { code: "DAD", name: "Da Nang", country: "Vietnam" },
  { code: "NHA", name: "Nha Trang", country: "Vietnam" },
  { code: "BKK", name: "Bangkok", country: "Thailand" },
  { code: "SIN", name: "Singapore", country: "Singapore" },
  { code: "KUL", name: "Kuala Lumpur", country: "Malaysia" },
  { code: "ICN", name: "Seoul", country: "South Korea" },
  { code: "NRT", name: "Tokyo", country: "Japan" }
]

const seatClasses = [
  { value: "ECONOMY", label: "Economy" },
  { value: "PREMIUM_ECONOMY", label: "Premium Economy" },
  { value: "BUSINESS", label: "Business" },
  { value: "FIRST", label: "First Class" }
]

export function FlightSearchForm() {
  const { state, dispatch } = useBooking()
  
  const [formData, setFormData] = useState<FlightSearchRequest>({
    origin: state.flightSearch?.origin || "",
    destination: state.flightSearch?.destination || "",
    departureDate: state.flightSearch?.departureDate || "",
    returnDate: state.flightSearch?.returnDate || "",
    passengers: state.flightSearch?.passengers || 1,
    seatClass: state.flightSearch?.seatClass || "ECONOMY"
  })

  const [isRoundTrip, setIsRoundTrip] = useState(!!formData.returnDate)
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    formData.departureDate ? new Date(formData.departureDate) : undefined
  )
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    formData.returnDate ? new Date(formData.returnDate) : undefined
  )

  // Auto-update booking context when form data changes
  useEffect(() => {
    const searchRequest: FlightSearchRequest = {
      ...formData,
      departureDate: departureDate ? format(departureDate, "yyyy-MM-dd") : "",
      returnDate: isRoundTrip && returnDate ? format(returnDate, "yyyy-MM-dd") : undefined
    }

    // Only update if we have minimum required fields
    if (searchRequest.origin && searchRequest.destination && searchRequest.departureDate) {
      dispatch({ type: 'SET_FLIGHT_SEARCH', payload: searchRequest })
    }
  }, [formData, departureDate, returnDate, isRoundTrip, dispatch])

  const handleInputChange = (field: keyof FlightSearchRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSwapCities = () => {
    setFormData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const searchRequest: FlightSearchRequest = {
      ...formData,
      departureDate: departureDate ? format(departureDate, "yyyy-MM-dd") : "",
      returnDate: isRoundTrip && returnDate ? format(returnDate, "yyyy-MM-dd") : undefined
    }

    dispatch({ type: 'SET_FLIGHT_SEARCH', payload: searchRequest })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trip Type */}
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="tripType"
            checked={!isRoundTrip}
            onChange={() => setIsRoundTrip(false)}
            className="mr-2"
          />
          One Way
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="tripType"
            checked={isRoundTrip}
            onChange={() => setIsRoundTrip(true)}
            className="mr-2"
          />
          Round Trip
        </label>
      </div>

      {/* Origin and Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        <div className="space-y-2">
          <Label htmlFor="origin">From</Label>
          <Select value={formData.origin} onValueChange={(value) => handleInputChange('origin', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select departure city" />
            </SelectTrigger>
            <SelectContent>
              {popularCities.map((city) => (
                <SelectItem key={city.code} value={city.code}>
                  {city.name} ({city.code}) - {city.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Swap Button */}
        <div className="absolute left-1/2 top-8 transform -translate-x-1/2 z-10 md:block hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwapCities}
            className="rounded-full bg-white border-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">To</Label>
          <Select value={formData.destination} onValueChange={(value) => handleInputChange('destination', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select destination city" />
            </SelectTrigger>
            <SelectContent>
              {popularCities.map((city) => (
                <SelectItem key={city.code} value={city.code}>
                  {city.name} ({city.code}) - {city.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Departure Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !departureDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departureDate ? format(departureDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={departureDate}
                onSelect={setDepartureDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {isRoundTrip && (
          <div className="space-y-2">
            <Label>Return Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !returnDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? format(returnDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  disabled={(date) => date < (departureDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Passengers and Class */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="passengers">Passengers</Label>
          <Select value={formData.passengers.toString()} onValueChange={(value) => handleInputChange('passengers', parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seatClass">Class</Label>
          <Select value={formData.seatClass} onValueChange={(value) => handleInputChange('seatClass', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seatClasses.map((seatClass) => (
                <SelectItem key={seatClass.value} value={seatClass.value}>
                  {seatClass.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  )
}
