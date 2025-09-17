"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { HotelBookingDetails, GuestDetails } from '@/modules/booking/types'

interface HotelBookingFormProps {
  hotel: any // Replace with proper hotel type
  onSubmit: (details: HotelBookingDetails) => void
  onCancel: () => void
}

export function HotelBookingForm({ hotel, onSubmit, onCancel }: HotelBookingFormProps) {
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date())
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(new Date(Date.now() + 86400000)) // Next day
  const [numberOfRooms, setNumberOfRooms] = useState<number>(1)
  const [numberOfGuests, setNumberOfGuests] = useState<number>(2)
  const [bedType, setBedType] = useState<string>('DOUBLE')
  const [specialRequests, setSpecialRequests] = useState<string>('')
  const [guests, setGuests] = useState<GuestDetails[]>([
    {
      guestType: 'PRIMARY',
      title: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'M',
      nationality: 'VN',
      email: '',
      phoneNumber: ''
    },
    {
      guestType: 'ADDITIONAL',
      title: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'M',
      nationality: 'VN'
    }
  ])

  const handleAddGuest = () => {
    if (guests.length < 10) { // Max 10 guests
      setGuests([
        ...guests,
        {
          guestType: 'ADDITIONAL',
          title: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'M',
          nationality: 'VN'
        }
      ])
    }
  }

  const handleRemoveGuest = (index: number) => {
    // Cannot remove the primary guest
    if (guests.length > 1 && guests[index].guestType !== 'PRIMARY') {
      const newGuests = [...guests]
      newGuests.splice(index, 1)
      setGuests(newGuests)
    }
  }

  const handleGuestChange = (index: number, field: keyof GuestDetails, value: string) => {
    const newGuests = [...guests]
    newGuests[index] = {
      ...newGuests[index],
      [field]: value
    }
    setGuests(newGuests)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const primaryGuest = guests.find(g => g.guestType === 'PRIMARY')
    const isValid = primaryGuest && primaryGuest.firstName && primaryGuest.lastName && primaryGuest.dateOfBirth && primaryGuest.email
    
    if (!isValid) {
      alert('Please fill in all required information for the primary guest')
      return
    }

    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates')
      return
    }

    const numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const bookingDetails: HotelBookingDetails = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelAddress: hotel.address,
      city: hotel.city,
      country: hotel.country,
      starRating: hotel.rating,
      roomId: hotel.roomId,
      roomType: hotel.roomType,
      roomName: hotel.roomName,
      checkInDate: format(checkInDate, 'yyyy-MM-dd'),
      checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
      numberOfNights,
      numberOfRooms,
      numberOfGuests,
      guests,
      pricePerNight: hotel.price,
      totalRoomPrice: hotel.price * numberOfNights * numberOfRooms,
      bedType,
      amenities: hotel.amenities,
      specialRequests
    }

    onSubmit(bookingDetails)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hotel Booking Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hotel Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold">{hotel.name}</h3>
              <p className="text-sm text-muted-foreground">
                {hotel.address}, {hotel.city}, {hotel.country}
              </p>
              <div className="flex items-center mt-2">
                {[...Array(hotel.rating || 0)].map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">Room:</span> {hotel.roomName} ({hotel.roomType})
              </p>
              <p className="text-sm">
                <span className="font-medium">Price:</span> {hotel.price.toLocaleString()} VND per night
              </p>
            </div>
          </div>

          {/* Booking Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkInDate">Check-in Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={setCheckInDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="checkOutDate">Check-out Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOutDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? format(checkOutDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={setCheckOutDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="numberOfRooms">Number of Rooms</Label>
              <Select 
                value={numberOfRooms.toString()} 
                onValueChange={(value) => setNumberOfRooms(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rooms" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Room' : 'Rooms'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="numberOfGuests">Number of Guests</Label>
              <Select 
                value={numberOfGuests.toString()} 
                onValueChange={(value) => setNumberOfGuests(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bedType">Bed Preference</Label>
              <Select value={bedType} onValueChange={setBedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bed type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Single Bed</SelectItem>
                  <SelectItem value="DOUBLE">Double Bed</SelectItem>
                  <SelectItem value="TWIN">Twin Beds</SelectItem>
                  <SelectItem value="KING">King Size</SelectItem>
                  <SelectItem value="QUEEN">Queen Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Guest Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
            {guests.map((guest, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">
                    {guest.guestType === 'PRIMARY' ? 'Primary Guest (Contact)' : `Guest ${index}`}
                    {guest.guestType === 'PRIMARY' && <span className="text-sm text-muted-foreground ml-2">(Contact Person)</span>}
                  </h4>
                  {guest.guestType !== 'PRIMARY' && guests.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveGuest(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`title-${index}`}>Title *</Label>
                    <Select 
                      value={guest.title} 
                      onValueChange={(value) => handleGuestChange(index, 'title', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MR">Mr.</SelectItem>
                        <SelectItem value="MRS">Mrs.</SelectItem>
                        <SelectItem value="MS">Ms.</SelectItem>
                        <SelectItem value="MISS">Miss</SelectItem>
                        <SelectItem value="DR">Dr.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`firstName-${index}`}>First Name *</Label>
                    <Input
                      id={`firstName-${index}`}
                      value={guest.firstName}
                      onChange={(e) => handleGuestChange(index, 'firstName', e.target.value)}
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
                    <Input
                      id={`lastName-${index}`}
                      value={guest.lastName}
                      onChange={(e) => handleGuestChange(index, 'lastName', e.target.value)}
                      placeholder="Last name"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`dateOfBirth-${index}`}>Date of Birth *</Label>
                    <Input
                      id={`dateOfBirth-${index}`}
                      type="date"
                      value={guest.dateOfBirth}
                      onChange={(e) => handleGuestChange(index, 'dateOfBirth', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`gender-${index}`}>Gender *</Label>
                    <Select 
                      value={guest.gender} 
                      onValueChange={(value) => handleGuestChange(index, 'gender', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`nationality-${index}`}>Nationality *</Label>
                    <Input
                      id={`nationality-${index}`}
                      value={guest.nationality}
                      onChange={(e) => handleGuestChange(index, 'nationality', e.target.value)}
                      placeholder="Country code (e.g., VN)"
                    />
                  </div>

                  {guest.guestType === 'PRIMARY' && (
                    <>
                      <div>
                        <Label htmlFor={`email-${index}`}>Email *</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={guest.email}
                          onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                          placeholder="Email address"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`phoneNumber-${index}`}>Phone Number</Label>
                        <Input
                          id={`phoneNumber-${index}`}
                          value={guest.phoneNumber}
                          onChange={(e) => handleGuestChange(index, 'phoneNumber', e.target.value)}
                          placeholder="Phone number"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {guests.length < 10 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddGuest}
                className="mt-2"
              >
                Add Another Guest
              </Button>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests or requirements"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Continue to Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}