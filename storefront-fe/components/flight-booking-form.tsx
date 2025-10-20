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
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { FlightBookingDetails, PassengerDetails } from '@/modules/booking/types'
import { useToast } from "@/hooks/use-toast"
import { useDateFormatter } from "@/hooks/use-date-formatter"
import { formatBookingDateTime } from '@/lib/date-format'

const pickDateTimeValue = (...values: (string | null | undefined)[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }
  }
  return undefined
}

import type { SelectedFlight } from '@/types'

interface FlightBookingFormProps {
  flight: SelectedFlight
  onSubmit: (details: FlightBookingDetails) => void
  onCancel: () => void
}

export function FlightBookingForm({ flight, onSubmit, onCancel }: FlightBookingFormProps) {
  const { toast } = useToast();
  const { formatDateTime, formatDateOnly, formatTimeOnly, timezone, language } = useDateFormatter()
  const [passengerCount, setPassengerCount] = useState<number>(1)
  const [seatClass, setSeatClass] = useState<string>('ECONOMY')
  const [specialRequests, setSpecialRequests] = useState<string>('')
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

  // Calculate initial total price
  const [initialTotalPrice, setInitialTotalPrice] = useState<number>(flight.price || 0);
  const [currentTotal, setCurrentTotal] = useState<number>(flight.price);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const departureDisplaySource = pickDateTimeValue(
    flight.departureDateTime,
    flight.raw?.departureDateTime,
    flight.departureTime,
    flight.raw?.departureTime,
  )
  const arrivalDisplaySource = pickDateTimeValue(
    flight.arrivalDateTime,
    flight.raw?.arrivalDateTime,
    flight.arrivalTime,
    flight.raw?.arrivalTime,
  )

  // Show toast when passenger count changes
  useEffect(() => {
    if (passengerCount !== 1) { // Only show toast if not the initial value
      toast({
        title: "Thông báo thay đổi giá",
        description: `Giá vé đã thay đổi từ ${initialTotalPrice.toLocaleString()} VND sang ${(flight.price * passengerCount).toLocaleString()} VND do thay đổi số hành khách.`,
        duration: 3000,
      });
    }
  }, [passengerCount, initialTotalPrice, flight.price, toast]);

  // Show toast when seat class changes and fetch updated price
  useEffect(() => {
    if (seatClass !== 'ECONOMY') { // Only when not the initial value
      setIsFetching(true);
      
      // Fetch updated price based on selected seat class
      import('@/modules/flight/service').then(module => {
        module.flightService.getFareDetails(
          flight.id.toString(), 
          { 
            seatClass: seatClass,
            scheduleId: flight.scheduleId,
            fareId: flight.fareId
          }
        )
        .then(updatedFlight => {
          setCurrentTotal(updatedFlight.price);
          toast({
            title: "Thông báo thay đổi giá",
            description: `Giá vé đã cập nhật theo hạng ghế: ${seatClass}. Mới: ${(updatedFlight.price * passengerCount).toLocaleString()} VND.`,
            duration: 3000,
          });
        })
        .catch(error => {
          console.error("Error fetching updated flight price:", error);
          toast({
            title: "Lỗi",
            description: "Không thể cập nhật giá vé, vui lòng thử lại.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsFetching(false);
        });
      });
    }
  }, [seatClass, flight, passengerCount, toast]);



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
      alert('Vui lòng điền đầy đủ thông tin bắt buộc của hành khách')
      return
    }

    const normalizeDateTime = (value?: string | null): string => {
      if (!value) {
        return ''
      }

      // If the value already looks like an ISO string, keep it as-is
      const isoMatch = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/.test(value)
      if (isoMatch) {
        return value
      }

      // Otherwise try to parse in a timezone-friendly way
      const parsed = new Date(value)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString()
      }

      // Fallback: return the original string to avoid crashing downstream
      return value
    }

    const departureDateValue = pickDateTimeValue(
      flight.departureDateTime,
      flight.raw?.departureDateTime,
      flight.departureTime,
      flight.raw?.departureTime,
    )
    const arrivalDateValue = pickDateTimeValue(
      flight.arrivalDateTime,
      flight.raw?.arrivalDateTime,
      flight.arrivalTime,
      flight.raw?.arrivalTime,
    )

    const bookingDetails: FlightBookingDetails = {
      flightId: flight.flightId,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      originAirport: flight.origin,
      destinationAirport: flight.destination,
      originLatitude: flight.originLatitude ?? flight.raw?.originLatitude,
      originLongitude: flight.originLongitude ?? flight.raw?.originLongitude,
      destinationLatitude: flight.destinationLatitude ?? flight.raw?.destinationLatitude,
      destinationLongitude: flight.destinationLongitude ?? flight.raw?.destinationLongitude,
      departureDateTime: normalizeDateTime(departureDateValue),
      arrivalDateTime: normalizeDateTime(arrivalDateValue),
      seatClass,
      scheduleId: flight.scheduleId,
      fareId: flight.fareId,
      passengerCount,
      passengers,
      pricePerPassenger: currentTotal / passengerCount, // Calculate price per passenger based on current total
      totalFlightPrice: currentTotal // Use the dynamically calculated total
    }

    onSubmit(bookingDetails)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin đặt vé máy bay</CardTitle>
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
                <span className="font-medium">Khởi hành:</span> {formatDateTime(departureDisplaySource)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Hạ cánh:</span> {formatDateTime(arrivalDisplaySource)}
              </p>
            </div>
          </div>

          {/* Booking Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passengerCount">Số hành khách</Label>
              <Select 
                value={passengerCount.toString()} 
                onValueChange={(value) => setPassengerCount(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn số lượng" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'hành khách' : 'hành khách'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="seatClass">Hạng ghế</Label>
              <Select value={seatClass} onValueChange={setSeatClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hạng ghế" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ECONOMY">Phổ thông</SelectItem>
                  <SelectItem value="PREMIUM_ECONOMY">Phổ thông cao cấp</SelectItem>
                  <SelectItem value="BUSINESS">Thương gia</SelectItem>
                  <SelectItem value="FIRST">Hạng nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Passenger Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin hành khách</h3>
            {passengers.map((passenger, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Hành khách {index + 1}</h4>
                  {passengers.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemovePassenger(index)}
                    >
                      Xóa
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`title-${index}`}>Danh xưng *</Label>
                    <Select 
                      value={passenger.title} 
                      onValueChange={(value) => handlePassengerChange(index, 'title', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh xưng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MR">Ông (Mr.)</SelectItem>
                        <SelectItem value="MRS">Bà (Mrs.)</SelectItem>
                        <SelectItem value="MS">Cô (Ms.)</SelectItem>
                        <SelectItem value="MISS">Cô gái (Miss)</SelectItem>
                        <SelectItem value="DR">Tiến sĩ (Dr.)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`passengerType-${index}`}>Loại hành khách *</Label>
                    <Select 
                      value={passenger.passengerType} 
                      onValueChange={(value) => handlePassengerChange(index, 'passengerType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADULT">Người lớn</SelectItem>
                        <SelectItem value="CHILD">Trẻ em</SelectItem>
                        <SelectItem value="INFANT">Em bé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`firstName-${index}`}>Tên *</Label>
                    <Input
                      id={`firstName-${index}`}
                      value={passenger.firstName}
                      onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                      placeholder="Tên"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`lastName-${index}`}>Họ *</Label>
                    <Input
                      id={`lastName-${index}`}
                      value={passenger.lastName}
                      onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                      placeholder="Họ"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`dateOfBirth-${index}`}>Ngày sinh *</Label>
                    <Input
                      id={`dateOfBirth-${index}`}
                      type="date"
                      value={passenger.dateOfBirth}
                      onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`gender-${index}`}>Giới tính *</Label>
                    <Select 
                      value={passenger.gender} 
                      onValueChange={(value) => handlePassengerChange(index, 'gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Nam</SelectItem>
                        <SelectItem value="F">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`nationality-${index}`}>Quốc tịch *</Label>
                    <Input
                      id={`nationality-${index}`}
                      value={passenger.nationality}
                      onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                      placeholder="Mã quốc gia (vd: VN)"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`email-${index}`}>Email</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={passenger.email}
                      onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                      placeholder="Địa chỉ email"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`phoneNumber-${index}`}>Số điện thoại</Label>
                    <Input
                      id={`phoneNumber-${index}`}
                      value={passenger.phoneNumber}
                      onChange={(e) => handlePassengerChange(index, 'phoneNumber', e.target.value)}
                      placeholder="Số điện thoại"
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
                Thêm hành khách
              </Button>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
            <Textarea
              id="specialRequests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Nhập yêu cầu hoặc ghi chú đặc biệt"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit">
              Tiếp tục xem lại
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
