"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, Smartphone, CreditCard } from "lucide-react"
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { paymentMethodService, AddPaymentMethodRequest } from "@/modules/payment/service/payment-method"

interface AddPaymentMethodDialogV2Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddPaymentMethodDialogV2({ open, onOpenChange, onSuccess }: AddPaymentMethodDialogV2Props) {
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
      // Submit the PaymentElement to collect payment method details
      const { error: submitError } = await elements.submit()
      
      if (submitError) {
        throw new Error(submitError.message)
      }

      // Create payment method with Stripe using PaymentElement
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: {
            name: cardHolderName || undefined,
            email: cardHolderEmail || undefined,
          },
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

      // Determine method type based on payment method type
      let methodType: 'CREDIT_CARD' | 'DIGITAL_WALLET' = 'CREDIT_CARD'
      
      // PaymentMethod type can be: card, us_bank_account, card_present, etc.
      // For wallets (Apple Pay, Google Pay), Stripe creates a card payment method
      // but we can check the wallet property
      if (paymentMethod.type === 'card') {
        methodType = 'CREDIT_CARD'
      }

      // Prepare request for backend
      const request: AddPaymentMethodRequest = {
        methodType: methodType,
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
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm phương thức thanh toán</DialogTitle>
          <DialogDescription>
            Thêm phương thức thanh toán mới vào tài khoản của bạn. Hỗ trợ thẻ, Apple Pay và Google Pay.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <div className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <Smartphone className="h-4 w-4" />
          </div>
          <AlertDescription>
            <strong>Apple Pay & Google Pay:</strong> Khả dụng khi sử dụng Safari/Chrome trên các thiết bị được hỗ trợ.
            <br />
            <strong>Thẻ thử nghiệm:</strong> 4242 4242 4242 4242, ngày hết hạn bất kỳ trong tương lai, CVC bất kỳ.
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
            <Label>Chi tiết thanh toán *</Label>
            <div className="border rounded-md p-2 bg-white">
              <PaymentElement
                options={{
                  layout: {
                    type: 'tabs',
                    defaultCollapsed: false,
                    radios: true,
                    spacedAccordionItems: false
                  },
                  wallets: {
                    applePay: 'auto',
                    googlePay: 'auto',
                  },
                  fields: {
                    billingDetails: {
                      address: {
                        country: 'auto',
                      }
                    }
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Chọn phương thức thanh toán của bạn. Apple Pay và Google Pay sẽ tự động xuất hiện nếu có sẵn trên thiết bị của bạn.
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
