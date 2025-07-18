"use client"

import { useState } from "react"
import { useBooking, useBookingValidation } from "@/lib/booking-context"
import { PassengerInfo } from "@/types/booking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Plus, Trash2 } from "lucide-react"

export function DetailsStep() {
  const { state, dispatch, nextStep, prevStep } = useBooking()
  const { canProceedToPayment } = useBookingValidation()
  
  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    state.passengers || [
      {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "Vietnam",
        passportNumber: ""
      }
    ]
  )

  const handlePassengerChange = (index: number, field: keyof PassengerInfo, value: string) => {
    const updatedPassengers = [...passengers]
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value }
    setPassengers(updatedPassengers)
  }

  const addPassenger = () => {
    setPassengers([...passengers, {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "Vietnam",
      passportNumber: ""
    }])
  }

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index))
    }
  }

  const handleNext = () => {
    dispatch({ type: 'SET_PASSENGERS', payload: passengers })
    nextStep()
  }

  const isFormValid = passengers.every(p => 
    p.firstName.trim() && p.lastName.trim() && p.dateOfBirth && p.nationality
  )

  const requiredPassengers = state.flightSearch?.passengers || 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Passenger Details</h2>
        <p className="text-gray-600">Please provide information for all passengers</p>
      </div>

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {state.selectedFlight && (
              <div className="flex justify-between">
                <span>Flight: {state.selectedFlight.airline} {state.selectedFlight.flightNumber}</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(state.selectedFlight.price)}</span>
              </div>
            )}
            {state.selectedHotel && state.selectedRoom && (
              <div className="flex justify-between">
                <span>Hotel: {state.selectedHotel.name} - {state.selectedRoom.roomType}</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(state.selectedRoom.pricePerNight)}</span>
              </div>
            )}
            <div className="border-t pt-2 font-semibold flex justify-between">
              <span>Total Amount:</span>
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(state.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passenger Forms */}
      <div className="space-y-4">
        {passengers.map((passenger, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Passenger {index + 1}
                </CardTitle>
                {passengers.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePassenger(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`firstName-${index}`}>First Name *</Label>
                  <Input
                    id={`firstName-${index}`}
                    value={passenger.firstName}
                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
                  <Input
                    id={`lastName-${index}`}
                    value={passenger.lastName}
                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`dateOfBirth-${index}`}>Date of Birth *</Label>
                  <Input
                    id={`dateOfBirth-${index}`}
                    type="date"
                    value={passenger.dateOfBirth}
                    onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`nationality-${index}`}>Nationality *</Label>
                  <Select 
                    value={passenger.nationality} 
                    onValueChange={(value) => handlePassengerChange(index, 'nationality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vietnam">Vietnam</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                      <SelectItem value="Thailand">Thailand</SelectItem>
                      <SelectItem value="Malaysia">Malaysia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`passportNumber-${index}`}>Passport Number</Label>
                  <Input
                    id={`passportNumber-${index}`}
                    value={passenger.passportNumber || ""}
                    onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                    placeholder="Enter passport number (optional)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Passenger Button */}
        {passengers.length < requiredPassengers && (
          <Button
            variant="outline"
            onClick={addPassenger}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Passenger
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={prevStep}>
          Back to Selection
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!isFormValid}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}
