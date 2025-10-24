"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
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

const SEAT_CLASS_LABELS: Record<string, string> = {
  ECONOMY: 'Phổ thông',
  PREMIUM_ECONOMY: 'Phổ thông cao cấp',
  BUSINESS: 'Thương gia',
  FIRST: 'Hạng nhất',
}

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
  if (!flight) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
        Không có thông tin chuyến bay. Vui lòng quay lại trang trước để chọn chuyến bay.
      </div>
    )
  }
  
  const { toast } = useToast();
  const { formatDateTime } = useDateFormatter()
  const initialSeatClass = (flight.seatClass || 'ECONOMY').toUpperCase()
  const [passengerCount, setPassengerCount] = useState<number>(1)
  const [seatClass, setSeatClass] = useState<string>(initialSeatClass)
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
  const [pricePerPassenger, setPricePerPassenger] = useState<number>(Number(flight.price) || 0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const previousSeatClassRef = useRef<string>(initialSeatClass)
  const lastRequestedSeatClassRef = useRef<string>(initialSeatClass)
  const firstLoadSeatClassRef = useRef<boolean>(true)
  const pricePerPassengerRef = useRef<number>(Number(flight.price) || 0)
  const departureDisplaySource = pickDateTimeValue(
    flight.departureTime,
   
    flight.departureTime,
  )
  const arrivalDisplaySource = pickDateTimeValue(
    flight.arrivalTime,
    flight.arrivalTime,
  )

  // Show toast when passenger count changes
  useEffect(() => {
    pricePerPassengerRef.current = pricePerPassenger
  }, [pricePerPassenger])

  // Show toast when passenger count changes
  useEffect(() => {
    if (passengerCount !== 1) { // Only show toast if not the initial value
      toast({
        title: "Thông báo thay đổi giá",
        description: `Số lượng hành khách đã được cập nhật thành ${passengerCount}. Tổng tạm tính mới là ${(pricePerPassenger * passengerCount).toLocaleString()} VND.`,
        duration: 3000,
      });
    }
  }, [passengerCount, pricePerPassenger, toast]);

  // Keep states in sync when the selected flight changes
  useEffect(() => {
    const normalizedSeatClass = (flight.seatClass || 'ECONOMY').toUpperCase()
    previousSeatClassRef.current = normalizedSeatClass
    lastRequestedSeatClassRef.current = normalizedSeatClass
    firstLoadSeatClassRef.current = true
    setSeatClass(normalizedSeatClass)
    const basePrice = Number(flight.price) || 0
    setPricePerPassenger(basePrice)
    pricePerPassengerRef.current = basePrice
}, [flight.flightId, flight.seatClass, flight.price])

  // Fetch updated fare details when the seat class changes
  useEffect(() => {
    if (firstLoadSeatClassRef.current) {
      firstLoadSeatClassRef.current = false
      return
    }

    let isCancelled = false
    const requestedSeatClass = seatClass
    lastRequestedSeatClassRef.current = requestedSeatClass
    setIsFetching(true)

    const fetchUpdatedFare = async () => {
      try {
        const flightModule = await import('@/modules/flight/service')
        const normalizedInitialSeatClass = (flight.seatClass || 'ECONOMY').toUpperCase()
        const params: { seatClass?: string; scheduleId?: string; fareId?: string } = {
          seatClass: requestedSeatClass,
        }
        if (flight.scheduleId) {
          params.scheduleId = flight.scheduleId
        }
        if (requestedSeatClass === normalizedInitialSeatClass && flight.fareId) {
          params.fareId = flight.fareId
        }

        const updatedFlight = await flightModule.flightService.getFareDetails(flight.flightId, params)
        if (isCancelled || lastRequestedSeatClassRef.current !== requestedSeatClass) {
          return
        }

        const newPricePerPassenger = Number(updatedFlight.price ?? 0)
        if (!Number.isFinite(newPricePerPassenger)) {
          throw new Error('INVALID_PRICE')
        }

        const previousPrice = pricePerPassengerRef.current
        setPricePerPassenger(newPricePerPassenger)
        pricePerPassengerRef.current = newPricePerPassenger
        previousSeatClassRef.current = requestedSeatClass

        if (Math.abs(newPricePerPassenger - previousPrice) > 0.009) {
        const label = SEAT_CLASS_LABELS[requestedSeatClass] ?? requestedSeatClass
          toast({
            title: "Cập nhật giá vé",
            description: `Giá vé hạng ${label} hiện tại là ${(newPricePerPassenger * passengerCount).toLocaleString()} VND.`,
            duration: 3000,
          })
        }
      } catch (error: any) {
        if (isCancelled || lastRequestedSeatClassRef.current !== requestedSeatClass) {
          return
        }

        console.error("Error fetching updated flight price:", error);
        const label = SEAT_CLASS_LABELS[requestedSeatClass] ?? requestedSeatClass
        toast({
          title: "Không tìm thấy hạng ghế",
          description: `Hạng ghế ${label} hiện không khả dụng cho chuyến bay này.`,
          variant: "destructive",
        })

        const fallbackSeatClass = previousSeatClassRef.current || (flight.seatClass || 'ECONOMY').toUpperCase()
        if (fallbackSeatClass !== requestedSeatClass) {
          firstLoadSeatClassRef.current = true
          setSeatClass(fallbackSeatClass)
        }
      } finally {
        if (!isCancelled) {
          setIsFetching(false)
        }
      }
    }

    void fetchUpdatedFare()

    return () => {
      isCancelled = true
    }
  }, [seatClass, flight.flightId, flight.scheduleId, flight.fareId, flight.seatClass, passengerCount, toast])

  const totalAmount = useMemo(() => pricePerPassenger * passengerCount, [pricePerPassenger, passengerCount])

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
      flight.departureTime,
    )
    const arrivalDateValue = pickDateTimeValue(
      flight.arrivalTime,
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
      pricePerPassenger: pricePerPassenger,
      totalFlightPrice: totalAmount,
      airlineLogo: flight.logo,
      originAirportName: flight.origin,
      destinationAirportName: flight.destination
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
              <Select
                value={seatClass}
                onValueChange={(value) => {
                  const normalized = value.toUpperCase()
                  if (normalized === seatClass) return
                  previousSeatClassRef.current = seatClass
                  firstLoadSeatClassRef.current = false
                  setSeatClass(normalized)
                }}
                disabled={isFetching}
              >
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
              Tiếp tục
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
