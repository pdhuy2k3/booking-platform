"use client"

import { useState, useEffect } from "react"
import { useBooking } from "@/common/contexts/booking-context"
import { HotelSearchRequest } from "@/modules/booking/types"
import { Button } from "@/common/components/ui/button"
import { Label } from "@/common/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select"
import { Calendar } from "@/common/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/common/utils"

const popularDestinations = [
  "Ho Chi Minh City",
  "Hanoi", 
  "Da Nang",
  "Nha Trang",
  "Hoi An",
  "Phu Quoc",
  "Sapa",
  "Hue",
  "Can Tho",
  "Vung Tau",
  "Bangkok",
  "Singapore",
  "Kuala Lumpur",
  "Seoul",
  "Tokyo"
]

export function HotelSearchForm() {
  const { state, dispatch } = useBooking()
  
  const [formData, setFormData] = useState<HotelSearchRequest>({
    destination: state.hotelSearch?.destination || "",
    checkInDate: state.hotelSearch?.checkInDate || "",
    checkOutDate: state.hotelSearch?.checkOutDate || "",
    guests: state.hotelSearch?.guests || 2,
    rooms: state.hotelSearch?.rooms || 1
  })

  const [checkInDate, setCheckInDate] = useState<Date | undefined>(
    formData.checkInDate ? new Date(formData.checkInDate) : undefined
  )
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(
    formData.checkOutDate ? new Date(formData.checkOutDate) : undefined
  )

  // Auto-update booking context when form data changes
  useEffect(() => {
    const searchRequest: HotelSearchRequest = {
      ...formData,
      checkInDate: checkInDate ? format(checkInDate, "yyyy-MM-dd") : "",
      checkOutDate: checkOutDate ? format(checkOutDate, "yyyy-MM-dd") : ""
    }

    // Only update if we have minimum required fields
    if (searchRequest.destination && searchRequest.checkInDate && searchRequest.checkOutDate) {
      dispatch({ type: 'SET_HOTEL_SEARCH', payload: searchRequest })
    }
  }, [formData, checkInDate, checkOutDate, dispatch])

  const handleInputChange = (field: keyof HotelSearchRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const searchRequest: HotelSearchRequest = {
      ...formData,
      checkInDate: checkInDate ? format(checkInDate, "yyyy-MM-dd") : "",
      checkOutDate: checkOutDate ? format(checkOutDate, "yyyy-MM-dd") : ""
    }

    dispatch({ type: 'SET_HOTEL_SEARCH', payload: searchRequest })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Destination */}
      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <Select value={formData.destination} onValueChange={(value) => handleInputChange('destination', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select destination" />
          </SelectTrigger>
          <SelectContent>
            {popularDestinations.map((destination) => (
              <SelectItem key={destination} value={destination}>
                {destination}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Check-in and Check-out Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Check-in Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkInDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkInDate ? format(checkInDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Check-out Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOutDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={setCheckOutDate}
                disabled={(date) => date <= (checkInDate || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Guests and Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guests">Guests</Label>
          <Select value={formData.guests.toString()} onValueChange={(value) => handleInputChange('guests', parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rooms">Rooms</Label>
          <Select value={formData.rooms.toString()} onValueChange={(value) => handleInputChange('rooms', parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'Room' : 'Rooms'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  )
}
