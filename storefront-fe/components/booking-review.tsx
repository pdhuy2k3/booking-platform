"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { 
  FlightBookingDetails, 
  HotelBookingDetails, 
  ComboBookingDetails 
} from '@/modules/booking/types'
import { formatCurrency } from '@/lib/currency'

interface BookingReviewProps {
  bookingType: 'FLIGHT' | 'HOTEL' | 'COMBO'
  flightDetails?: FlightBookingDetails
  hotelDetails?: HotelBookingDetails
  comboDetails?: ComboBookingDetails
  onConfirm: () => void
  onEdit: () => void
  onCancel: () => void
}

export function BookingReview({ 
  bookingType, 
  flightDetails, 
  hotelDetails, 
  comboDetails, 
  onConfirm, 
  onEdit, 
  onCancel 
}: BookingReviewProps) {
  const renderFlightDetails = (details: FlightBookingDetails) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Flight Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
        <div>
          <p className="font-medium">{details.airline} - {details.flightNumber}</p>
          <p className="text-sm text-muted-foreground">
            {details.originAirport} → {details.destinationAirport}
          </p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Departure:</span> {format(new Date(details.departureDateTime), 'PPP p')}
          </p>
          <p className="text-sm">
            <span className="font-medium">Arrival:</span> {format(new Date(details.arrivalDateTime), 'PPP p')}
          </p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Class:</span> {details.seatClass}
          </p>
          <p className="text-sm">
            <span className="font-medium">Passengers:</span> {details.passengerCount}
          </p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Price:</span> {formatCurrency(details.totalFlightPrice, 'VND')}
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Passengers</h4>
        {details.passengers.map((passenger, index) => (
          <div key={index} className="border-b py-2 last:border-b-0">
            <p className="font-medium">{passenger.title} {passenger.firstName} {passenger.lastName}</p>
            <p className="text-sm text-muted-foreground">
              {passenger.passengerType} • {format(new Date(passenger.dateOfBirth), 'PPP')} • {passenger.nationality}
            </p>
            {passenger.email && (
              <p className="text-sm">{passenger.email}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderHotelDetails = (details: HotelBookingDetails) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Hotel Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
        <div>
          <p className="font-medium">{details.hotelName}</p>
          <p className="text-sm text-muted-foreground">
            {details.hotelAddress}, {details.city}, {details.country}
          </p>
          <div className="flex items-center mt-1">
            {[...Array(details.starRating || 0)].map((_, i) => (
              <span key={i} className="text-yellow-500">★</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Room:</span> {details.roomName} ({details.roomType})
          </p>
          <p className="text-sm">
            <span className="font-medium">Dates:</span> {format(new Date(details.checkInDate), 'PPP')} - {format(new Date(details.checkOutDate), 'PPP')}
          </p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Guests:</span> {details.numberOfGuests}
          </p>
          <p className="text-sm">
            <span className="font-medium">Rooms:</span> {details.numberOfRooms}
          </p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Price:</span> {formatCurrency(details.totalRoomPrice, 'VND')}
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Guests</h4>
        {details.guests.map((guest, index) => (
          <div key={index} className="border-b py-2 last:border-b-0">
            <p className="font-medium">
              {guest.title} {guest.firstName} {guest.lastName}
              {guest.guestType === 'PRIMARY' && <span className="text-xs bg-primary text-primary-foreground rounded px-2 py-1 ml-2">Contact</span>}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(guest.dateOfBirth), 'PPP')} • {guest.nationality}
            </p>
            {guest.email && (
              <p className="text-sm">{guest.email}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const calculateTotalAmount = () => {
    let total = 0
    if (bookingType === 'FLIGHT' && flightDetails) {
      total = flightDetails.totalFlightPrice
    } else if (bookingType === 'HOTEL' && hotelDetails) {
      total = hotelDetails.totalRoomPrice
    } else if (bookingType === 'COMBO' && comboDetails) {
      total = comboDetails.flightDetails.totalFlightPrice + comboDetails.hotelDetails.totalRoomPrice
      if (comboDetails.comboDiscount) {
        total -= comboDetails.comboDiscount
      }
    }
    return total
  }

  const totalAmount = calculateTotalAmount()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Booking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {bookingType === 'FLIGHT' && flightDetails && renderFlightDetails(flightDetails)}
        {bookingType === 'HOTEL' && hotelDetails && renderHotelDetails(hotelDetails)}
        {bookingType === 'COMBO' && comboDetails && (
          <>
            {renderFlightDetails(comboDetails.flightDetails)}
            {renderHotelDetails(comboDetails.hotelDetails)}
            {comboDetails.comboDiscount && (
              <div className="border-t pt-4">
                <p className="text-right">
                  <span className="font-medium">Combo Discount:</span> -{formatCurrency(comboDetails.comboDiscount, 'VND')}
                </p>
              </div>
            )}
          </>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(totalAmount, 'VND')}
            </span>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onEdit}>
            Edit Details
          </Button>
          <div className="space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" onClick={onConfirm}>
              Confirm Booking
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}