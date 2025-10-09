"use client"

import React, { useState, useEffect } from 'react'
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
import { useDateFormatter } from "@/hooks/use-date-formatter"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { HotelBookingDetails, GuestDetails } from '@/modules/booking/types'

interface HotelBookingFormProps {
  hotel: any
  onSubmit: (details: HotelBookingDetails) => void
  onCancel: () => void
}

export function HotelBookingForm({ hotel, onSubmit, onCancel }: HotelBookingFormProps) {
  const { formatDateOnly } = useDateFormatter()
  const { toast } = useToast()

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

  // Calculate the number of nights between check-in and check-out dates
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Calculate initial total price
  const initialNights = calculateNights();
  const [initialTotalPrice, setInitialTotalPrice] = useState<number>(hotel.price * initialNights * 1);
  const [currentTotal, setCurrentTotal] = useState<number>(hotel.price * initialNights * 1);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Show toast when check-in date changes
  useEffect(() => {
    if (checkInDate) {
      const newNights = calculateNights();
      const newTotal = hotel.price * newNights * numberOfRooms;
      if (newNights > 0) {
        toast({
          title: "Thông báo thay đổi giá",
          description: `Giá phòng đã thay đổi từ ${initialTotalPrice.toLocaleString()} VND sang ${newTotal.toLocaleString()} VND do thay đổi ngày nhận/trả phòng.`,
          duration: 3000,
        });
      }
    }
  }, [checkInDate, checkOutDate, initialTotalPrice, hotel.price, numberOfRooms, toast]);

  // Show toast when number of rooms changes
  useEffect(() => {
    const newTotal = hotel.price * calculateNights() * numberOfRooms;
    if (numberOfRooms !== 1) { // Only show toast if not the initial value
      toast({
        title: "Thông báo thay đổi giá",
        description: `Giá phòng đã thay đổi từ ${initialTotalPrice.toLocaleString()} VND sang ${newTotal.toLocaleString()} VND do thay đổi số lượng phòng.`,
        duration: 3000,
      });
    }
  }, [numberOfRooms, initialTotalPrice, hotel.price, toast]);

  // Show toast when number of guests changes
  useEffect(() => {
    if (numberOfGuests !== 2) { // Only show toast if not the initial value
      toast({
        title: "Thông báo đặt phòng",
        description: `Số lượng khách đã được cập nhật thành ${numberOfGuests}.`,
        duration: 3000,
      });
    }
  }, [numberOfGuests, toast]);

  // Add the room type functionality
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number>(hotel.roomTypeId || hotel.id || 1);
  
  // Show toast when room type changes and fetch updated price
  useEffect(() => {
    const initialRoomTypeId = hotel.roomTypeId || hotel.id || 1;
    if (selectedRoomTypeId !== initialRoomTypeId) { // Only when not the initial value
      setIsFetching(true);
      
      // Fetch updated room details based on selected room type
      import('@/modules/hotel/service').then(module => {
        module.hotelService.getRoomDetails(selectedRoomTypeId)
        .then(updatedRoom => {
          // Calculate new total based on new price
          const newTotal = updatedRoom.price * calculateNights() * numberOfRooms;
          setCurrentTotal(newTotal);
          toast({
            title: "Thông báo thay đổi giá",
            description: `Giá phòng đã được cập nhật theo loại phòng đã chọn: ${(newTotal).toLocaleString()} VND.`,
            duration: 3000,
          });
        })
        .catch(error => {
          console.error("Error fetching updated room price:", error);
          toast({
            title: "Lỗi",
            description: "Không thể cập nhật giá phòng, vui lòng thử lại.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsFetching(false);
        });
      });
    }
  }, [selectedRoomTypeId, numberOfRooms, toast, calculateNights, hotel.roomTypeId, hotel.id]);

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
      roomTypeId: selectedRoomTypeId || hotel.roomTypeId || hotel.id || 1,
      roomId: hotel.roomId,
      roomType: hotel.roomType,
      roomName: hotel.roomName,
      checkInDate: formatDateOnly(checkInDate.toISOString()),
      checkOutDate: formatDateOnly(checkOutDate.toISOString()),
      numberOfNights,
      numberOfRooms,
      numberOfGuests,
      guests,
      pricePerNight: currentTotal / numberOfNights / numberOfRooms, // Calculate price per night based on current total
      totalRoomPrice: currentTotal, // Use the dynamically calculated total
      bedType,
      amenities: hotel.amenities,
      specialRequests
    }

    onSubmit(bookingDetails)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin đặt phòng khách sạn</CardTitle>
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
              <Label htmlFor="checkInDate">Ngày nhận phòng</Label>
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
                    {checkInDate ? formatDateOnly(checkInDate.toISOString()) : <span>Chọn ngày</span>}
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
              <Label htmlFor="checkOutDate">Ngày trả phòng</Label>
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
                    {checkOutDate ? formatDateOnly(checkOutDate.toISOString()) : <span>Chọn ngày</span>}
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
              <Label htmlFor="numberOfRooms">Số lượng phòng</Label>
              <Select
                value={numberOfRooms.toString()} 
                onValueChange={(value) => setNumberOfRooms(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn số phòng" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Phòng' : 'Phòng'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="numberOfGuests">Số lượng khách</Label>
              <Select
                value={numberOfGuests.toString()} 
                onValueChange={(value) => setNumberOfGuests(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn số khách" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Khách' : 'Khách'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bedType">Loại giường</Label>
              <Select value={bedType} onValueChange={setBedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại giường" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Giường đơn</SelectItem>
                  <SelectItem value="DOUBLE">Giường đôi</SelectItem>
                  <SelectItem value="TWIN">Giường đơn đôi</SelectItem>
                  <SelectItem value="KING">Giường King</SelectItem>
                  <SelectItem value="QUEEN">Giường Queen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="roomType">Loại phòng</Label>
              <Select value={selectedRoomTypeId?.toString() || (hotel.roomTypeId?.toString() || hotel.id?.toString() || '1')} onValueChange={(value) => setSelectedRoomTypeId(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại phòng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={hotel.roomTypeId?.toString() || hotel.id?.toString() || '1'}>
                    {hotel.roomType || 'Phòng hiện tại'}
                  </SelectItem>
                  {/* Add more room types if available */}
                  {hotel.roomTypes && Array.isArray(hotel.roomTypes) && hotel.roomTypes.map((roomType: any) => (
                    <SelectItem key={roomType.id} value={roomType.id?.toString()}>
                      {roomType.name} - {roomType.price?.toLocaleString()} VND/đêm
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Guest Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin khách</h3>
            {guests.map((guest, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">
                    {guest.guestType === 'PRIMARY' ? 'Khách chính (Liên hệ)' : `Khách ${index}`}
                    {guest.guestType === 'PRIMARY' && <span className="text-sm text-muted-foreground ml-2">(Người liên hệ)</span>}
                  </h4>
                  {guest.guestType !== 'PRIMARY' && guests.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveGuest(index)}
                    >
                      Xóa
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`title-${index}`}>Danh xưng *</Label>
                    <Select
                      value={guest.title} 
                      onValueChange={(value) => handleGuestChange(index, 'title', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh xưng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MR">Ông</SelectItem>
                        <SelectItem value="MRS">Bà</SelectItem>
                        <SelectItem value="MS">Cô</SelectItem>
                        <SelectItem value="MISS">Chị</SelectItem>
                        <SelectItem value="DR">Tiến sĩ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`firstName-${index}`}>Tên *</Label>
                    <Input
                      id={`firstName-${index}`}
                      value={guest.firstName}
                      onChange={(e) => handleGuestChange(index, 'firstName', e.target.value)}
                      placeholder="Tên"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`lastName-${index}`}>Họ *</Label>
                    <Input
                      id={`lastName-${index}`}
                      value={guest.lastName}
                      onChange={(e) => handleGuestChange(index, 'lastName', e.target.value)}
                      placeholder="Họ"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`dateOfBirth-${index}`}>Ngày sinh *</Label>
                    <Input
                      id={`dateOfBirth-${index}`}
                      type="date"
                      value={guest.dateOfBirth}
                      onChange={(e) => handleGuestChange(index, 'dateOfBirth', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`gender-${index}`}>Giới tính *</Label>
                    <Select
                      value={guest.gender} 
                      onValueChange={(value) => handleGuestChange(index, 'gender', value as any)}
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
                      value={guest.nationality}
                      onChange={(e) => handleGuestChange(index, 'nationality', e.target.value)}
                      placeholder="Mã quốc gia (vd: VN)"
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
                          placeholder="Địa chỉ email"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`phoneNumber-${index}`}>Số điện thoại</Label>
                        <Input
                          id={`phoneNumber-${index}`}
                          value={guest.phoneNumber}
                          onChange={(e) => handleGuestChange(index, 'phoneNumber', e.target.value)}
                          placeholder="Số điện thoại"
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
                Thêm khách khác
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
              placeholder="Các yêu cầu hoặc điều kiện đặc biệt"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit">
              Tiếp tục đến trang xem xét
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
