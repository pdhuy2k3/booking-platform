"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDateFormatter } from "@/hooks/use-date-formatter"
import {
  FlightBookingDetails,
  HotelBookingDetails
} from '@/modules/booking/types'
import { formatCurrency } from '@/lib/currency'

interface BookingReviewProps {
  bookingType: 'FLIGHT' | 'HOTEL' | 'COMBO'
  flightDetails?: FlightBookingDetails
  hotelDetails?: HotelBookingDetails
  comboDiscount?: number
  onConfirm: () => void
  onEdit: () => void
  onCancel: () => void
}

export function BookingReview({
  bookingType,
  flightDetails,
  hotelDetails,
  comboDiscount,
  onConfirm,
  onEdit,
  onCancel
}: BookingReviewProps) {
  const { formatDateTime, formatDateOnly } = useDateFormatter()

  const renderFlightDetails = (details: FlightBookingDetails) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Thông tin chuyến bay</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
        <div>
          <p className="font-medium">{details.airline} - {details.flightNumber}</p>
          <p className="text-sm text-muted-foreground">
            {details.originAirport} → {details.destinationAirport}
          </p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Khởi hành:</span> {formatDateTime(details.departureDateTime)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Hạ cánh:</span> {formatDateTime(details.arrivalDateTime)}
          </p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Hạng ghế:</span> {details.seatClass}
          </p>
          <p className="text-sm">
            <span className="font-medium">Số hành khách:</span> {details.passengerCount}
          </p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Tổng chi phí:</span> {formatCurrency(details.totalFlightPrice, 'VND')}
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Danh sách hành khách</h4>
        {details.passengers.map((passenger, index) => (
          <div key={index} className="border-b py-2 last:border-b-0">
            <p className="font-medium">{passenger.title} {passenger.firstName} {passenger.lastName}</p>
            <p className="text-sm text-muted-foreground">
              {passenger.passengerType} • {formatDateOnly(passenger.dateOfBirth)} • {passenger.nationality}
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
      <h3 className="text-lg font-semibold">Thông tin khách sạn</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
        <div>
          <p className="font-medium">{details.hotelName}</p>
          <p className="text-sm text-muted-foreground">{details.hotelAddress}</p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Nhận phòng:</span> {formatDateTime(details.checkInDate)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Trả phòng:</span> {formatDateTime(details.checkOutDate)}
          </p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Loại phòng:</span> {details.roomType}
          </p>
          <p className="text-sm">
            <span className="font-medium">Số phòng:</span> {details.numberOfRooms}
          </p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Số khách:</span> {details.numberOfGuests}
          </p>
          <p className="text-sm">
            <span className="font-medium">Tổng chi phí:</span> {formatCurrency(details.totalRoomPrice, 'VND')}
          </p>
        </div>
      </div>
    </div>
  )

  const calculateTotalAmount = () => {
    if (bookingType === 'FLIGHT' && flightDetails) {
      return flightDetails.totalFlightPrice
    }
    if (bookingType === 'HOTEL' && hotelDetails) {
      return hotelDetails.totalRoomPrice
    }
    if (bookingType === 'COMBO') {
      const flightAmount = flightDetails?.totalFlightPrice ?? 0
      const hotelAmount = hotelDetails?.totalRoomPrice ?? 0
      const discount = comboDiscount ?? 0
      return Math.max(flightAmount + hotelAmount - discount, 0)
    }
    return 0
  }

  const totalAmount = calculateTotalAmount()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xem lại thông tin đặt chỗ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {bookingType === 'FLIGHT' && flightDetails && renderFlightDetails(flightDetails)}
        {bookingType === 'HOTEL' && hotelDetails && renderHotelDetails(hotelDetails)}
        {bookingType === 'COMBO' && (
          <>
            {flightDetails && renderFlightDetails(flightDetails)}
            {hotelDetails && renderHotelDetails(hotelDetails)}
            {comboDiscount && comboDiscount > 0 && (flightDetails || hotelDetails) && (
              <div className="border-t pt-4">
                <p className="text-right">
                  <span className="font-medium">Giảm giá gói:</span> -{formatCurrency(comboDiscount, 'VND')}
                </p>
              </div>
            )}
          </>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Tổng chi phí:</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(totalAmount, 'VND')}
            </span>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onEdit}>
            Chỉnh sửa thông tin
          </Button>
          <div className="space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="button" onClick={onConfirm}>
              Xác nhận đặt chỗ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
