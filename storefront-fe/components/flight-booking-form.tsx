"use client"

import React, { useEffect, useState } from 'react'
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
import { FlightBookingDetails, PassengerDetails } from '@/modules/booking/types'

const formatDateTimeLabel = (value?: string) => {
  if (!value) return 'N/A'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return format(parsed, 'PPP p')
}

interface FlightBookingFormProps {
  flight: any // Replace with proper flight type
  onSubmit: (details: FlightBookingDetails) => void
  onCancel: () => void
}

export function FlightBookingForm({ flight, onSubmit, onCancel }: FlightBookingFormProps) {
  const [passengerCount, setPassengerCount] = useState<number>(1)
  const [seatClass, setSeatClass] = useState<string>('ECONOMY')
  const [specialRequests, setSpecialRequests] = useState<string>('')
  const [departureDate, setDepartureDate] = useState<Date | undefined>(new Date())
  const [passengers, setPassengers] = useState<PassengerDetails[]>([
    {
      passengerType: 'ADULT',
      title: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'M',
      nationality: 'VN',
      email: '',
      phoneNumber: ''
    }
  ])

  useEffect(() => {
    if (flight?.departureTime) {
      const parsed = new Date(flight.departureTime)
      if (!Number.isNaN(parsed.getTime())) {
        setDepartureDate(parsed)
      }
    }
  }, [flight?.departureTime])

  const handleAddPassenger = () => {
    if (passengers.length < 9) { // Max 9 passengers
      setPassengers([
        ...passengers,
        {
          passengerType: passengers.length === 0 ? 'ADULT' : 'CHILD',
          title: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'M',
          nationality: 'VN',
          email: '',
          phoneNumber: ''
        }
      ])
    }
  }

  const handleRemovePassenger = (index: number) => {
    if (passengers.length > 1) {
      const newPassengers = [...passengers]
      newPassengers.splice(index, 1)
      setPassengers(newPassengers)
    }
  }

  const handlePassengerChange = (index: number, field: keyof PassengerDetails, value: string) => {
    const newPassengers = [...passengers]
    newPassengers[index] = {
      ...newPassengers[index],
      [field]: value
    }
    setPassengers(newPassengers)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const isValid = passengers.every(passenger => 
      passenger.firstName && passenger.lastName && passenger.dateOfBirth
    )
    
    if (!isValid) {
      alert('Please fill in all required passenger information')
      return
    }

    const bookingDetails: FlightBookingDetails = {
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      originAirport: flight.origin,
      destinationAirport: flight.destination,
      departureDateTime: departureDate ? departureDate.toISOString() : new Date().toISOString(),
      arrivalDateTime: flight.arrivalTime,
      seatClass,
      passengerCount,
      passengers,
      pricePerPassenger: flight.price,
      totalFlightPrice: flight.price * passengerCount
    }

    onSubmit(bookingDetails)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flight Booking Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Flight Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold">{flight.airline} - {flight.flightNumber}</h3>
              <p className="text-sm text-muted-foreground">
                {flight.origin} → {flight.destination}
              </p>
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">Departure:</span> {formatDateTimeLabel(flight.departureTime)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Arrival:</span> {formatDateTimeLabel(flight.arrivalTime)}
              </p>
            </div>
          </div>

          {/* Booking Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passengerCount">Number of Passengers</Label>
              <Select 
                value={passengerCount.toString()} 
                onValueChange={(value) => setPassengerCount(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select passengers" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="seatClass">Seat Class</Label>
              <Select value={seatClass} onValueChange={setSeatClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select seat class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ECONOMY">Economy</SelectItem>
                  <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="FIRST">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="departureDate">Departure Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !departureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Passenger Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Passenger Information</h3>
            {passengers.map((passenger, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Passenger {index + 1}</h4>
                  {passengers.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemovePassenger(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`title-${index}`}>Title *</Label>
                    <Select 
                      value={passenger.title} 
                      onValueChange={(value) => handlePassengerChange(index, 'title', value)}
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
                    <Label htmlFor={`passengerType-${index}`}>Passenger Type *</Label>
                    <Select 
                      value={passenger.passengerType} 
                      onValueChange={(value) => handlePassengerChange(index, 'passengerType', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADULT">Adult</SelectItem>
                        <SelectItem value="CHILD">Child</SelectItem>
                        <SelectItem value="INFANT">Infant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`firstName-${index}`}>First Name *</Label>
                    <Input
                      id={`firstName-${index}`}
                      value={passenger.firstName}
                      onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
                    <Input
                      id={`lastName-${index}`}
                      value={passenger.lastName}
                      onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                      placeholder="Last name"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`dateOfBirth-${index}`}>Date of Birth *</Label>
                    <Input
                      id={`dateOfBirth-${index}`}
                      type="date"
                      value={passenger.dateOfBirth}
                      onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`gender-${index}`}>Gender *</Label>
                    <Select 
                      value={passenger.gender} 
                      onValueChange={(value) => handlePassengerChange(index, 'gender', value as any)}
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
                      value={passenger.nationality}
                      onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                      placeholder="Country code (e.g., VN)"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`email-${index}`}>Email</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={passenger.email}
                      onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                      placeholder="Email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`phoneNumber-${index}`}>Phone Number</Label>
                    <Input
                      id={`phoneNumber-${index}`}
                      value={passenger.phoneNumber}
                      onChange={(e) => handlePassengerChange(index, 'phoneNumber', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>
            ))}

            {passengers.length < 9 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddPassenger}
                className="mt-2"
              >
                Add Another Passenger
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
