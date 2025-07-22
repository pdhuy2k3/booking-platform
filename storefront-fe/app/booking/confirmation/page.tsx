"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Download, Share, Calendar, MapPin, Users, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { bookingService } from "@/lib/booking-service"
import { PaymentService } from "@/lib/payment-service"

interface BookingConfirmationData {
  bookingId: string
  bookingReference: string
  status: string
  totalAmount: number
  currency: string
  paymentStatus: string
  createdAt: string
  bookingType: string
  flightDetails?: any
  hotelDetails?: any
  paymentMethod?: string
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [booking, setBooking] = useState<BookingConfirmationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bookingId = searchParams.get('booking_id')
  const paymentIntentId = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
    } else {
      setError("Booking ID not found")
      setLoading(false)
    }
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      
      // Fetch booking details
      const bookingResponse = await bookingService.getBooking(bookingId!)
      
      // If there's a payment intent, confirm the payment status
      if (paymentIntentId && redirectStatus === 'succeeded') {
        try {
          await PaymentService.confirmPaymentIntent({
            paymentIntentId: paymentIntentId
          })
        } catch (paymentError) {
          console.warn("Payment confirmation warning:", paymentError)
        }
      }
      
      setBooking({
        bookingId: bookingResponse.bookingId,
        bookingReference: bookingResponse.bookingReference,
        status: bookingResponse.status,
        totalAmount: bookingResponse.totalAmount,
        currency: bookingResponse.currency,
        paymentStatus: 'completed', // Default payment status for confirmation page
        createdAt: bookingResponse.createdAt,
        bookingType: bookingResponse.bookingType,
        flightDetails: bookingResponse.flightDetails,
        hotelDetails: bookingResponse.hotelDetails,
        paymentMethod: 'Credit Card' // Default payment method
      })
    } catch (err) {
      setError("Failed to load booking details")
      console.error("Booking fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'succeeded':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDownloadConfirmation = () => {
    // TODO: Implement PDF download
    alert("PDF download will be implemented")
  }

  const handleShareBooking = () => {
    // TODO: Implement sharing
    if (navigator.share) {
      navigator.share({
        title: `Booking Confirmation - ${booking?.bookingReference}`,
        text: `My booking ${booking?.bookingReference} is confirmed!`,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Booking link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your booking details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your booking reference is <span className="font-semibold">{booking.bookingReference}</span>
          </p>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Booking ID:</span>
                    <p className="font-medium">{booking.bookingId}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Reference:</span>
                    <p className="font-medium">{booking.bookingReference}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Booked on:</span>
                    <p className="font-medium">{formatDate(booking.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flight Details */}
            {booking.flightDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Flight Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{booking.flightDetails.airline} {booking.flightDetails.flightNumber}</p>
                        <p className="text-sm text-gray-600">
                          {booking.flightDetails.departure} → {booking.flightDetails.arrival}
                        </p>
                      </div>
                      <Badge variant="outline">{booking.flightDetails.seatClass}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {booking.flightDetails.departureDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {booking.flightDetails.passengers?.length || 1} passenger(s)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hotel Details */}
            {booking.hotelDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Hotel Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{booking.hotelDetails.hotelName}</p>
                      <p className="text-sm text-gray-600">{booking.hotelDetails.roomType}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Check-in: {booking.hotelDetails.checkInDate}</span>
                      <span>Check-out: {booking.hotelDetails.checkOutDate}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {booking.hotelDetails.guests} guest(s)
                      </span>
                      <span>{booking.hotelDetails.rooms} room(s)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold">
                      {formatPrice(booking.totalAmount, booking.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <Badge className={getStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                  {booking.paymentMethod && (
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-medium">{booking.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleDownloadConfirmation} 
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Confirmation
                </Button>
                <Button 
                  onClick={handleShareBooking} 
                  className="w-full"
                  variant="outline"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Booking
                </Button>
                <Separator />
                <Button 
                  onClick={() => router.push('/')} 
                  className="w-full"
                >
                  Book Another Trip
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Notes */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2 text-blue-900">Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights</li>
              <li>• A confirmation email has been sent to your registered email address</li>
              <li>• For hotels, please present a valid ID and credit card at check-in</li>
              <li>• Cancellation and modification policies apply as per terms and conditions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading booking confirmation...</p>
          </div>
        </div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  )
}
