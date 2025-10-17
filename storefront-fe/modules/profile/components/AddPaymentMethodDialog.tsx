"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { paymentMethodService, AddPaymentMethodRequest } from "@/modules/payment/service/payment-method"

interface AddPaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddPaymentMethodDialog({ open, onOpenChange, onSuccess }: AddPaymentMethodDialogProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [cardHolderName, setCardHolderName] = useState("")
  const [cardHolderEmail, setCardHolderEmail] = useState("")
  const [setAsDefault, setSetAsDefault] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Stripe has not loaded yet. Please wait.",
        variant: "destructive",
      })
      return
    }

    if (!displayName) {
      toast({
        title: "Validation Error",
        description: "Please enter a display name for this payment method",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Get the CardElement
      const cardElement = elements.getElement(CardElement)
      
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      // Create payment method with Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardHolderName || undefined,
          email: cardHolderEmail || undefined,
        },
      })

      if (error) {
        console.error('Stripe error:', error)
        toast({
          title: "Payment Method Error",
          description: error.message || "Failed to create payment method",
          variant: "destructive",
        })
        return
      }

      if (!paymentMethod) {
        throw new Error("No payment method returned from Stripe")
      }

      // Prepare request for backend
      const request: AddPaymentMethodRequest = {
        methodType: 'CREDIT_CARD',
        provider: 'STRIPE',
        displayName: displayName,
        cardLastFour: paymentMethod.card?.last4,
        cardBrand: paymentMethod.card?.brand?.toUpperCase(),
        cardExpiryMonth: paymentMethod.card?.exp_month,
        cardExpiryYear: paymentMethod.card?.exp_year,
        cardHolderName: cardHolderName || undefined,
        cardHolderEmail: cardHolderEmail || undefined,
        stripePaymentMethodId: paymentMethod.id, // pm_abc123...
        setAsDefault: setAsDefault,
      }

      // Save to backend
      await paymentMethodService.addPaymentMethod(request)

      toast({
        title: "Success",
        description: "Payment method added successfully",
      })

      // Reset form
      setDisplayName("")
      setCardHolderName("")
      setCardHolderEmail("")
      setSetAsDefault(false)
      cardElement.clear()

      onSuccess()
      onOpenChange(false)

    } catch (error: any) {
      console.error('Failed to add payment method:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    setDisplayName("")
    setCardHolderName("")
    setCardHolderEmail("")
    setSetAsDefault(false)
    
    const cardElement = elements?.getElement(CardElement)
    if (cardElement) {
      cardElement.clear()
    }
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Thêm phương thức thanh toán</DialogTitle>
          <DialogDescription>
            Thêm phương thức thanh toán mới vào tài khoản của bạn. Chi tiết thẻ được xử lý an toàn bởi Stripe.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Để thử nghiệm, hãy sử dụng thẻ: 4242 4242 4242 4242, ngày hết hạn bất kỳ trong tương lai và CVC bất kỳ.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="displayName">Tên hiển thị *</Label>
            <Input
              id="displayName"
              placeholder="Thẻ tín dụng của tôi"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cardHolderName">Tên chủ thẻ</Label>
            <Input
              id="cardHolderName"
              placeholder="John Doe"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cardHolderEmail">Email chủ thẻ</Label>
            <Input
              id="cardHolderEmail"
              type="email"
              placeholder="john@example.com"
              value={cardHolderEmail}
              onChange={(e) => setCardHolderEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Chi tiết thẻ *</Label>
            <div className="border rounded-md p-2 bg-white">
              <CardElement
                options={{
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
                  hidePostalCode: false,
                }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Stripe xử lý chi tiết thẻ của bạn một cách an toàn. Chúng tôi không bao giờ thấy số thẻ đầy đủ của bạn.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="setAsDefault"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="setAsDefault" className="cursor-pointer font-normal">
              Đặt làm phương thức thanh toán mặc định
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Thêm phương thức thanh toán'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
