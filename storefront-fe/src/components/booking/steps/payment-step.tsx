import { useState, useEffect } from "react";
import { PassengerInfo, ContactInfo, BillingInfo } from "@/types/api/booking";
import { FlightOffer } from "@/types/api/flight";
import { HotelOffer } from "@/types/api/hotel";
import { PackageOffer } from "@/types/api/package";
import { useCreatePaymentIntent, useConfirmPayment } from "@/hooks/api/use-bookings";
import { useBookingFlow } from "@/hooks/use-booking-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Shield, Lock, AlertCircle } from "lucide-react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { StripeProvider } from "@/components/payment/stripe-provider";

interface PaymentStepProps {
  selectedItem?: FlightOffer | HotelOffer | PackageOffer;
  passengers: PassengerInfo[];
  contactInfo?: ContactInfo;
  billingInfo?: BillingInfo;
  totalAmount: number;
  currency: string;
  paymentMethod?: { type: string; details?: Record<string, unknown> };
  onContinue: () => void;
  onBack: () => void;
}

function PaymentForm({
  passengers,
  contactInfo,
  billingInfo,
  totalAmount,
  currency,
  onContinue,
  onBack
}: Omit<PaymentStepProps, 'selectedItem'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const { getBookingData } = useBookingFlow();
  const confirmPayment = useConfirmPayment();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !termsAccepted) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError("Card element not found");
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${passengers[0]?.firstName} ${passengers[0]?.lastName}`,
          email: contactInfo?.email,
          phone: contactInfo?.phone,
        },
      });

      if (paymentMethodError) {
        setPaymentError(paymentMethodError.message || "Payment method creation failed");
        setIsProcessing(false);
        return;
      }

      // Get booking data
      const bookingData = getBookingData();
      // Override the payment method with Stripe details
      const updatedBookingData = {
        ...bookingData,
        paymentMethod: {
          type: "stripe" as const,
          stripePaymentMethodId: paymentMethod.id,
        }
      };

      // Confirm payment and create booking
      await confirmPayment.mutateAsync({
        paymentIntentId: paymentMethod.id,
        bookingData: updatedBookingData,
      });

      onContinue();
    } catch (error: unknown) {
      setPaymentError(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Method</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Card Information</Label>
            <div className="mt-2 p-3 border rounded-md">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {paymentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billingFirstName">First Name</Label>
              <Input
                id="billingFirstName"
                value={billingInfo?.firstName || passengers[0]?.firstName || ""}
                placeholder="Enter first name"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="billingLastName">Last Name</Label>
              <Input
                id="billingLastName"
                value={billingInfo?.lastName || passengers[0]?.lastName || ""}
                placeholder="Enter last name"
                readOnly
              />
            </div>
          </div>

          <div>
            <Label htmlFor="billingEmail">Email Address</Label>
            <Input
              id="billingEmail"
              type="email"
              value={contactInfo?.email || ""}
              placeholder="Enter email address"
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{(totalAmount * 0.9).toLocaleString()} {currency}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & Fees</span>
              <span>{(totalAmount * 0.1).toLocaleString()} {currency}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{totalAmount.toLocaleString()} {currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <div className="text-sm">
              <Label htmlFor="terms" className="cursor-pointer">
                I agree to the{" "}
                <a href="/terms" className="text-primary hover:underline" target="_blank">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </a>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <Shield className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
        <Lock className="h-3 w-3" />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back to Details
        </Button>
        <Button 
          type="submit" 
          size="lg" 
          disabled={!stripe || !termsAccepted || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pay {totalAmount.toLocaleString()} {currency}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function PaymentStep(props: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const createPaymentIntent = useCreatePaymentIntent();

  useEffect(() => {
    // Create payment intent when component mounts
    const initializePayment = async () => {
      try {
        const bookingData = {
          bookingType: "flight" as const, // This should be determined from selectedItem
          totalAmount: props.totalAmount,
          currency: props.currency,
          passengers: props.passengers,
          contactInfo: props.contactInfo,
        };

        const paymentIntent = await createPaymentIntent.mutateAsync(bookingData);
        setClientSecret(paymentIntent.clientSecret);
      } catch (error) {
        console.error("Failed to initialize payment:", error);
      }
    };

    initializePayment();
  }, [props.totalAmount, props.currency, props.passengers, props.contactInfo, createPaymentIntent]);

  if (!clientSecret) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Secure Payment</h2>
          <p className="text-gray-600">Initializing secure payment...</p>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Secure Payment</h2>
        <p className="text-gray-600">Complete your booking with secure payment processing.</p>
      </div>

      <StripeProvider clientSecret={clientSecret}>
        <PaymentForm {...props} />
      </StripeProvider>
    </div>
  );
}
