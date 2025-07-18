"use client"

import { useState } from "react"
import { useBooking } from "@/lib/booking-context"
import { bookingService } from "@/lib/booking-service"
import { PaymentService } from "@/lib/payment-service"
import { CreateBookingRequest, BookingResponse } from "@/types/booking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Shield, Loader2 } from "lucide-react"

export function PaymentStep() {
  const { state, dispatch, nextStep, prevStep } = useBooking()
  
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCardDetailChange = (field: string, value: string) => {
    setCardDetails(prev => ({ ...prev, [field]: value }))
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Step 1: Create booking first (this will start the saga and reserve resources)
      const bookingRequest: CreateBookingRequest = {
        userId: "user-123", // TODO: Get from auth context
        bookingType: state.bookingType,
        totalAmount: state.totalAmount,
        currency: state.currency,
        flightDetails: state.selectedFlight ? {
          flightId: state.selectedFlight.flightId,
          departureDate: state.flightSearch?.departureDate || "",
          returnDate: state.flightSearch?.returnDate,
          passengers: state.passengers || [],
          seatClass: state.flightSearch?.seatClass || "ECONOMY"
        } : undefined,
        hotelDetails: state.selectedHotel && state.selectedRoom ? {
          hotelId: state.selectedHotel.hotelId,
          roomId: state.selectedRoom.roomId,
          checkInDate: state.hotelSearch?.checkInDate || "",
          checkOutDate: state.hotelSearch?.checkOutDate || "",
          guests: state.hotelSearch?.guests || 1,
          rooms: state.hotelSearch?.rooms || 1
        } : undefined
      }

      // Create booking (this will start the saga and reserve resources)
      const bookingResponse = await bookingService.createBooking(bookingRequest)

      // Step 2: Process payment using the payment service
      const paymentRequest = {
        bookingId: bookingResponse.bookingId,
        amount: state.totalAmount,
        currency: state.currency,
        gateway: paymentMethod === "credit_card" ? "STRIPE" : "VIETQR",
        paymentMethodType: paymentMethod === "credit_card" ? "CREDIT_CARD" : "BANK_TRANSFER",
        paymentMethodToken: paymentMethod === "credit_card" ? generateCardToken() : undefined,
        description: `Payment for booking ${bookingResponse.bookingReference}`,
        returnUrl: `${window.location.origin}/booking/confirmation`,
        cancelUrl: `${window.location.origin}/booking/payment`,
        additionalData: {
          bookingReference: bookingResponse.bookingReference,
          bookingType: state.bookingType
        }
      }

      // Process payment
      const paymentResponse = await PaymentService.processPayment(paymentRequest)

      // Store both booking and payment response for confirmation step
      localStorage.setItem('currentBooking', JSON.stringify({
        ...bookingResponse,
        payment: paymentResponse
      }))

      // Move to confirmation step
      nextStep()

    } catch (err) {
      setError("Payment failed. Please try again.")
      console.error("Payment error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Generate a mock card token (in real implementation, this would use Stripe.js or similar)
  const generateCardToken = () => {
    if (paymentMethod === "credit_card" && cardDetails.cardNumber) {
      return `tok_${cardDetails.cardNumber.slice(-4)}_${Date.now()}`
    }
    return undefined
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD'
    }).format(price)
  }

  const isFormValid = paymentMethod === "credit_card" 
    ? cardDetails.cardNumber && cardDetails.expiryDate && cardDetails.cvv && cardDetails.cardholderName
    : true

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment</h2>
        <p className="text-gray-600">Complete your booking by making payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Card Details */}
          {paymentMethod === "credit_card" && (
            <Card>
              <CardHeader>
                <CardTitle>Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={cardDetails.cardholderName}
                    onChange={(e) => handleCardDetailChange('cardholderName', e.target.value)}
                    placeholder="Enter cardholder name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={(e) => handleCardDetailChange('cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={(e) => handleCardDetailChange('expiryDate', e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardDetailChange('cvv', e.target.value)}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Shield className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Flight Details */}
              {state.selectedFlight && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Flight</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>{state.selectedFlight.airline} {state.selectedFlight.flightNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{state.selectedFlight.origin} → {state.selectedFlight.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passengers: {state.passengers?.length || 1}</span>
                      <span>{formatPrice(state.selectedFlight.price * (state.passengers?.length || 1), state.currency)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hotel Details */}
              {state.selectedHotel && state.selectedRoom && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Hotel</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>{state.selectedHotel.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{state.selectedRoom.roomType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rooms: {state.hotelSearch?.rooms || 1}</span>
                      <span>{formatPrice(state.selectedRoom.pricePerNight, state.currency)}/night</span>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(state.totalAmount, state.currency)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={prevStep} disabled={isProcessing}>
          Back to Details
        </Button>
        
        <Button 
          onClick={handlePayment}
          disabled={!isFormValid || isProcessing}
          className="min-w-[120px]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatPrice(state.totalAmount, state.currency)}`
          )}
        </Button>
      </div>
    </div>
  )
}
