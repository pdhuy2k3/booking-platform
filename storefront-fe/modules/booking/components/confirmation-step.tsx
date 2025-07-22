import { useBooking } from "@/common/contexts/booking-context"
import { BookingResponse } from "@/modules/booking/types"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { CheckCircle, Download, Mail, Calendar, MapPin, Users, Plane, Building, CreditCard } from "lucide-react"
import { Label } from "@/common/components/ui/label";

export function ConfirmationStep() {
  const { state, resetBooking } = useBooking()

  const handleNewBooking = () => {
    resetBooking()
  }

  const handleDownloadTicket = () => {
    // TODO: Implement ticket download
    alert("Ticket download will be implemented soon!")
  }

  const handleEmailTicket = () => {
    // TODO: Implement email ticket
    alert("Email ticket will be implemented soon!")
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD'
    }).format(price)
  }

  const getSagaStateColor = (sagaState: string) => {
    switch (sagaState) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'BOOKING_INITIATED':
      case 'FLIGHT_RESERVATION_PENDING':
      case 'HOTEL_RESERVATION_PENDING':
      case 'PAYMENT_PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
      case 'COMPENSATED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (!state.bookingResponse) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading booking confirmation...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">Your booking has been successfully created and is being processed.</p>
      </div>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Booking Reference</Label>
              <p className="text-lg font-semibold">{state.bookingResponse.bookingReference}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{state.bookingResponse.status}</Badge>
                <Badge className={getSagaStateColor(state.bookingResponse.sagaState)}>
                  {state.bookingResponse.sagaState.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
              <p className="text-lg font-semibold">{formatPrice(state.bookingResponse.totalAmount, state.bookingResponse.currency)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Booking Date</Label>
              <p>{new Date(state.bookingResponse.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flight Details */}
        {state.selectedFlight && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Flight Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{state.selectedFlight.airline}</span>
                <Badge variant="outline">{state.selectedFlight.flightNumber}</Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-semibold">{state.selectedFlight.departureTime}</div>
                  <div className="text-sm text-gray-600">{state.flightSearch?.origin}</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-sm text-gray-600">{state.selectedFlight.duration}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{state.selectedFlight.arrivalTime}</div>
                  <div className="text-sm text-gray-600">{state.flightSearch?.destination}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{state.passengers?.length || 1} passenger(s)</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{state.flightSearch?.departureDate}</span>
                {state.flightSearch?.returnDate && (
                  <span> - {state.flightSearch.returnDate}</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hotel Details */}
        {state.selectedHotel && state.selectedRoom && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Hotel Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium">{state.selectedHotel.name}</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{state.selectedHotel.address}</span>
                </div>
              </div>

              <div>
                <div className="font-medium">{state.selectedRoom.roomType}</div>
                <div className="text-sm text-gray-600">
                  Up to {state.selectedRoom.capacity} guests
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{state.hotelSearch?.checkInDate} - {state.hotelSearch?.checkOutDate}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{state.hotelSearch?.guests} guest(s), {state.hotelSearch?.rooms} room(s)</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Booking ID:</span>
              <span className="font-mono text-sm">{state.bookingResponse.bookingId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reference:</span>
              <span className="font-mono text-sm">{state.bookingResponse.bookingReference}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge className={state.bookingResponse.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {state.bookingResponse.status}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="font-semibold">{formatPrice(state.bookingResponse.totalAmount, state.bookingResponse.currency)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Booking Date:</span>
              <span className="text-sm">{new Date(state.bookingResponse.createdAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Passenger Information */}
      {state.passengers && state.passengers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Passenger Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.passengers.map((passenger, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {passenger.firstName} {passenger.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {passenger.nationality} • Born: {passenger.dateOfBirth}
                    </div>
                  </div>
                  {passenger.passportNumber && (
                    <div className="text-sm text-gray-600">
                      Passport: {passenger.passportNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={handleDownloadTicket} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Ticket
        </Button>
        
        <Button onClick={handleEmailTicket} variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Email Ticket
        </Button>
        
        <Button onClick={handleNewBooking}>
          Make Another Booking
        </Button>
      </div>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights.</p>
          <p>• Hotel check-in is typically at 3:00 PM and check-out at 12:00 PM.</p>
          <p>• Keep your booking reference number for future reference.</p>
          <p>• You will receive email confirmations once your booking is fully processed.</p>
          <p>• For any changes or cancellations, please contact our customer service.</p>
        </CardContent>
      </Card>
    </div>
  )
}