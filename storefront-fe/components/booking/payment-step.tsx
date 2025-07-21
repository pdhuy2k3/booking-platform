"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useBooking } from "@/lib/booking-context"
import { bookingService } from "@/lib/booking-service"
import { PaymentService } from "@/lib/payment-service"
import { CreateBookingRequest, BookingResponse } from "@/types/booking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Shield, Loader2, QrCode, Banknote } from "lucide-react"

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  gateway: "STRIPE" | "VIETQR"
  type: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "credit_card",
    name: "Credit/Debit Card",
    description: "Pay securely with your credit or debit card",
    icon: <CreditCard className="w-6 h-6" />,
    gateway: "STRIPE",
    type: "CREDIT_CARD"
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer (VietQR)",
    description: "Transfer money via VietQR code",
    icon: <QrCode className="w-6 h-6" />,
    gateway: "VIETQR",
    type: "BANK_TRANSFER"
  }
]

export function PaymentStep() {
  const { state, dispatch, nextStep, prevStep } = useBooking()
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("credit_card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [vietQRData, setVietQRData] = useState<any>(null)
  const [booking, setBooking] = useState<BookingResponse | null>(null)

  // Get selected payment method
  const currentMethod = paymentMethods.find(m => m.id === selectedPaymentMethod)

  // Format price helper
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD'
    }).format(price)
  }

  // Create booking and payment intent when payment method changes
  useEffect(() => {
    if (currentMethod) {
      handleCreateBookingAndPaymentIntent()
    }
  }, [selectedPaymentMethod])

  const handleCreateBookingAndPaymentIntent = async () => {
    setError(null)
    setIsProcessing(true)

    try {
      // Step 1: Create booking first (this will start the saga and reserve resources)
      if (!booking) {
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

        const bookingResponse = await bookingService.createBooking(bookingRequest)
        setBooking(bookingResponse)
      }

      // Step 2: Create payment intent based on selected method
      if (currentMethod?.gateway === "STRIPE") {
        await createStripePaymentIntent()
      } else if (currentMethod?.gateway === "VIETQR") {
        await createVietQRPayment()
      }

    } catch (err) {
      setError("Failed to initialize payment. Please try again.")
      console.error("Payment initialization error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const createStripePaymentIntent = async () => {
    try {
      const response = await PaymentService.createPaymentIntent({
        bookingId: booking!.bookingId,
        amount: state.totalAmount,
        currency: state.currency,
        gateway: "STRIPE",
        description: `Payment for booking ${booking!.bookingReference}`,
        metadata: {
          booking_reference: booking!.bookingReference,
          booking_type: state.bookingType
        }
      })

      setStripeClientSecret(response.clientSecret || null)
    } catch (err) {
      throw new Error("Failed to create Stripe payment intent")
    }
  }

  const createVietQRPayment = async () => {
    try {
      const response = await PaymentService.createPaymentIntent({
        bookingId: booking!.bookingId,
        amount: state.totalAmount,
        currency: state.currency,
        gateway: "VIETQR",
        description: `Payment for booking ${booking!.bookingReference}`,
        accountName: "BookingSmart",
        accountNumber: "1234567890",
        metadata: {
          booking_reference: booking!.bookingReference,
          booking_type: state.bookingType
        }
      })

      setVietQRData(response)
    } catch (err) {
      throw new Error("Failed to create VietQR payment")
    }
  }

  const handlePaymentMethodChange = (methodId: string) => {
    setSelectedPaymentMethod(methodId)
    setStripeClientSecret(null)
    setVietQRData(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment</h2>
        <p className="text-muted-foreground">Choose your payment method and complete your booking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Select Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPaymentMethod} onValueChange={handlePaymentMethodChange}>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label 
                        htmlFor={method.id} 
                        className="flex items-center gap-3 cursor-pointer flex-1 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        {method.icon}
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {currentMethod?.gateway === "STRIPE" && stripeClientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: stripeClientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#0F172A',
                      },
                    },
                  }}
                >
                  <StripePaymentForm 
                    onSuccess={() => nextStep()}
                    onError={(error) => setError(error)}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </Elements>
              )}

              {currentMethod?.gateway === "VIETQR" && vietQRData && (
                <VietQRPaymentForm 
                  qrData={vietQRData}
                  onSuccess={() => nextStep()}
                  onError={(error) => setError(error)}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              )}

              {isProcessing && !stripeClientSecret && !vietQRData && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Initializing payment...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Flight Details */}
              {state.selectedFlight && (
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Flight</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{state.selectedFlight.airline} {state.selectedFlight.flightNumber}</span>
                      <span className="font-medium">{formatPrice(state.selectedFlight.price, state.currency)}</span>
                    </div>
                    <div className="text-gray-600">
                      {state.selectedFlight.origin} → {state.selectedFlight.destination}
                    </div>
                    <div className="text-gray-600">
                      {state.flightSearch?.departureDate}
                    </div>
                  </div>
                </div>
              )}

              {/* Hotel Details */}
              {state.selectedHotel && state.selectedRoom && (
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Hotel</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{state.selectedHotel.name}</span>
                      <span className="font-medium">{formatPrice(state.selectedRoom.pricePerNight, state.currency)}/night</span>
                    </div>
                    <div className="text-gray-600">
                      {state.selectedRoom.roomType}
                    </div>
                    <div className="text-gray-600">
                      {state.hotelSearch?.checkInDate} - {state.hotelSearch?.checkOutDate}
                    </div>
                  </div>
                </div>
              )}

              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(state.totalAmount, state.currency)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={isProcessing}
              className="flex-1"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stripe Payment Form Component
interface StripePaymentFormProps {
  onSuccess: () => void
  onError: (error: string) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

function StripePaymentForm({ onSuccess, onError, isProcessing, setIsProcessing }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation`,
        },
        redirect: 'if_required'
      })

      if (error) {
        onError(error.message || "Payment failed")
      } else {
        onSuccess()
      }
    } catch (err) {
      onError("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Complete Payment"
        )}
      </Button>
    </form>
  )
}

// VietQR Payment Form Component
interface VietQRPaymentFormProps {
  qrData: any
  onSuccess: () => void
  onError: (error: string) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

function VietQRPaymentForm({ qrData, onSuccess, onError, isProcessing, setIsProcessing }: VietQRPaymentFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'completed'>('pending')

  const handleCheckPayment = async () => {
    setPaymentStatus('checking')
    
    // Simulate payment verification (in real implementation, you'd check with your backend)
    setTimeout(() => {
      // For demo purposes, randomly succeed or fail
      const success = Math.random() > 0.3
      if (success) {
        setPaymentStatus('completed')
        onSuccess()
      } else {
        setPaymentStatus('pending')
        onError("Payment not detected yet. Please try again.")
      }
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <img 
            src={qrData.qrCodeUrl} 
            alt="VietQR Code" 
            className="mx-auto mb-4"
            width={200}
            height={200}
          />
          <p className="text-sm text-gray-600 mb-2">Scan QR code with your banking app</p>
          <p className="text-xs text-gray-500">or transfer manually using details below</p>
        </div>

        <div className="text-left space-y-2 text-sm">
          <div><strong>Bank:</strong> {qrData.bankCode}</div>
          <div><strong>Account:</strong> {qrData.accountNumber}</div>
          <div><strong>Account Name:</strong> {qrData.accountName}</div>
          <div><strong>Amount:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(qrData.amount)}</div>
          <div><strong>Description:</strong> {qrData.description}</div>
        </div>
      </div>

      <Button 
        onClick={handleCheckPayment}
        disabled={paymentStatus === 'checking'}
        className="w-full"
        variant={paymentStatus === 'completed' ? 'default' : 'outline'}
      >
        {paymentStatus === 'checking' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Checking Payment...
          </>
        ) : paymentStatus === 'completed' ? (
          "Payment Confirmed"
        ) : (
          "I've Made the Payment"
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        After making the payment, click the button above to verify your transaction
      </p>
    </div>
  )
}
