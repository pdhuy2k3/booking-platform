'use client'

import React, { useState, useEffect } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'
import { paymentService } from '../service'
import { paymentPollingService } from '../service/PaymentPollingService'
import { StripePaymentFormData } from '../type/stripe'
import { getStripeErrorMessage } from '../config/stripe'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency } from '@/lib/currency'
import type { PaymentMethodResponse } from '@/modules/payment/service/payment-method'

// Form validation schema
const paymentFormSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  billingAddress: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(2, 'Country code is required'),
  }),
  savePaymentMethod: z.boolean().optional(),
  setAsDefault: z.boolean().optional(),
})

type PaymentFormData = z.infer<typeof paymentFormSchema>

interface StripePaymentFormProps {
  bookingId: string
  sagaId?: string
  amount: number
  chargeAmount?: number
  feeAmount?: number
  metadata?: Record<string, number | string>
  currency?: string
  description?: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
  onCancel?: () => void
  className?: string
  savedPaymentMethod?: PaymentMethodResponse
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  bookingId,
  sagaId,
  amount,
  chargeAmount,
  feeAmount,
  metadata,
  currency = 'vnd',
  description,
  onSuccess,
  onError,
  onCancel,
  className,
  savedPaymentMethod,
}) => {
  const amountToCharge = chargeAmount ?? amount
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const isUsingSavedMethod = Boolean(savedPaymentMethod?.stripePaymentMethodId)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: amountToCharge,
      currency,
      customerEmail: '',
      customerName: '',
      billingAddress: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
      },
      savePaymentMethod: true,
      setAsDefault: false,
    },
  })

  const savePaymentMethodValue = useWatch({
    control,
    name: 'savePaymentMethod',
  });


  useEffect(() => {
    if (!user) {
      return
    }

    const fullName = user.fullName?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    reset({
      amount: amountToCharge,
      currency,
      customerEmail: user.email || '',
      customerName: fullName || '',
      billingAddress: {
        line1: user.address?.street || '',
        line2: '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        postalCode: user.address?.postalCode || '',
        country: (user.address?.country || 'VN').toUpperCase(),
      },
      savePaymentMethod: true,
      setAsDefault: false,
    })
  }, [user, amountToCharge, currency, reset])

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    if (!stripe || !elements) {
      if (!stripe || (!isUsingSavedMethod && !elements)) {
        setErrorMessage('Payment system not ready. Please try again.')
        return
      }
    }

    setIsProcessing(true)
    setPaymentStatus('processing')
    setErrorMessage(null)

    try {
      if (!isUsingSavedMethod) {
        const submission = await elements!.submit()
        if (submission && submission.error) {
          const message = submission.error.message || 'Unable to process payment details.'
          setErrorMessage(message)
          setPaymentStatus('failed')
          onError?.(message)
          setIsProcessing(false)
          return
        }
      }

      let activeClientSecret = clientSecret
      let activePaymentIntentId = paymentIntentId
      let activeTransactionId = transactionId

      if (!activeClientSecret) {
        const metadataPayload: Record<string, string> = {
          ...(metadata
            ? Object.entries(metadata).reduce<Record<string, string>>((acc, [key, value]) => {
                acc[key] = String(value)
                return acc
              }, {})
            : {}),
        }
        metadataPayload.baseAmount = String(amount)
        if (typeof feeAmount !== 'undefined') {
          metadataPayload.feeAmount = String(feeAmount)
        }

        const createdIntent = await paymentService.createIntent({
          bookingId,
          sagaId,
          amount: data.amount,
          currency: data.currency,
          paymentMethodType: 'CREDIT_CARD',
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          description: description || '',
          billingAddress: data.billingAddress,
          paymentMethodId: savedPaymentMethod?.stripePaymentMethodId,
          customerId: savedPaymentMethod?.stripeCustomerId || undefined,
          confirmPayment: isUsingSavedMethod,
          metadata: metadataPayload,
          savePaymentMethod: data.savePaymentMethod,
          setAsDefault: data.setAsDefault,
        })

        activeClientSecret = createdIntent.clientSecret ?? null
        activePaymentIntentId = createdIntent.id ?? null
        activeTransactionId = createdIntent.transactionId ?? null

        setClientSecret(activeClientSecret)
        setPaymentIntentId(activePaymentIntentId)
        setTransactionId(activeTransactionId)

        if (!isUsingSavedMethod && elements && activeClientSecret) {
          const updateOptions: any = {
            clientSecret: activeClientSecret,
          }
          elements.update(updateOptions)
        }
      }

      if (!activeClientSecret) {
        throw new Error('Unable to initialize payment intent. Please try again.')
      }

      let error: any = null
      let paymentIntent: any = null

      if (isUsingSavedMethod && savedPaymentMethod?.stripePaymentMethodId) {
        const confirmation = await stripe.confirmCardPayment(activeClientSecret, {
          payment_method: savedPaymentMethod.stripePaymentMethodId,
          return_url: `${window.location.origin}/payment/result`,
        })
        error = confirmation.error
        paymentIntent = confirmation.paymentIntent
      } else {
        const confirmation = await stripe.confirmPayment({
          elements: elements!,
          clientSecret: activeClientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/payment/result`,
          },
          redirect: 'if_required',
        })
        error = confirmation.error
        paymentIntent = confirmation.paymentIntent
      }

      if (error) {
        console.error('Payment failed:', error)
        setErrorMessage(getStripeErrorMessage(error.code))
        setPaymentStatus('failed')
        onError?.(error.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        setPaymentStatus('succeeded')
        if (onSuccess) {
          await Promise.resolve(onSuccess(paymentIntent))
        }
      } else if (paymentIntent?.status === 'requires_action') {
        // Start polling for 3D Secure or other actions
        setIsPolling(true)
        setPaymentStatus('processing')
        if (activeTransactionId) {
          startPollingForPaymentStatus(activeTransactionId)
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
      setPaymentStatus('failed')
      onError?.('Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    // Stop polling if active
    if (transactionId) {
      paymentPollingService.stopPolling(transactionId)
    }
    onCancel?.()
  }

  const startPollingForPaymentStatus = (currentTransactionId?: string) => {
    if (!currentTransactionId) {
      return
    }

    paymentPollingService.startPolling(currentTransactionId, {
      maxAttempts: 30, // 1 minute
      intervalMs: 2000, // 2 seconds
      onSuccess: (paymentIntent) => {
        setIsPolling(false)
        setPaymentStatus('succeeded')
        if (onSuccess) {
          void Promise.resolve(onSuccess(paymentIntent))
        }
      },
      onError: (error) => {
        setIsPolling(false)
        setPaymentStatus('failed')
        setErrorMessage(error)
        onError?.(error)
      },
      onTimeout: () => {
        setIsPolling(false)
        setPaymentStatus('failed')
        setErrorMessage('Payment verification timed out. Please check your payment status.')
        onError?.('Payment verification timeout')
      }
    })
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (transactionId) {
        paymentPollingService.stopPolling(transactionId)
      }
    }
  }, [transactionId])

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              {isPolling ? 'Verifying payment status...' : 'Processing your payment...'}
            </AlertDescription>
          </Alert>
        )
      case 'succeeded':
        return (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment successful! Your booking has been confirmed.
            </AlertDescription>
          </Alert>
        )
      case 'failed':
        return (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Payment failed. Please try again or use a different payment method.
            </AlertDescription>
          </Alert>
        )
      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          Complete your booking with secure payment processing
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(handlePaymentSubmit)} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Full Name</Label>
                <Input
                  id="customerName"
                  {...register('customerName')}
                  placeholder="John Doe"
                  className={errors.customerName ? 'border-red-500' : ''}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500 mt-1">{errors.customerName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register('customerEmail')}
                  placeholder="john@example.com"
                  className={errors.customerEmail ? 'border-red-500' : ''}
                />
                {errors.customerEmail && (
                  <p className="text-sm text-red-500 mt-1">{errors.customerEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Billing Address</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="line1">Address Line 1</Label>
                <Input
                  id="line1"
                  {...register('billingAddress.line1')}
                  placeholder="123 Main St"
                  className={errors.billingAddress?.line1 ? 'border-red-500' : ''}
                />
                {errors.billingAddress?.line1 && (
                  <p className="text-sm text-red-500 mt-1">{errors.billingAddress.line1.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                <Input
                  id="line2"
                  {...register('billingAddress.line2')}
                  placeholder="Apt 4B"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('billingAddress.city')}
                    placeholder="New York"
                    className={errors.billingAddress?.city ? 'border-red-500' : ''}
                  />
                  {errors.billingAddress?.city && (
                    <p className="text-sm text-red-500 mt-1">{errors.billingAddress.city.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...register('billingAddress.state')}
                    placeholder="NY"
                  />
                </div>
                
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    {...register('billingAddress.postalCode')}
                    placeholder="10001"
                    className={errors.billingAddress?.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.billingAddress?.postalCode && (
                    <p className="text-sm text-red-500 mt-1">{errors.billingAddress.postalCode.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register('billingAddress.country')}
                  placeholder="US"
                  className={errors.billingAddress?.country ? 'border-red-500' : ''}
                />
                {errors.billingAddress?.country && (
                  <p className="text-sm text-red-500 mt-1">{errors.billingAddress.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Element */}
          {!isUsingSavedMethod ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment Method</h3>
              <div className="border rounded-lg p-4">
                <PaymentElement
                  options={{
                    layout: {
                      type: 'accordion',
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
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="savePaymentMethod"
                    {...register('savePaymentMethod')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="savePaymentMethod" className="text-sm font-medium leading-none">
                    Save this payment method for future use
                  </Label>
                </div>
                {savePaymentMethodValue && (
                  <div className="flex items-center space-x-2 pl-6">
                    <input
                      type="checkbox"
                      id="setAsDefault"
                      {...register('setAsDefault')}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="setAsDefault" className="text-sm font-medium leading-none">
                      Set as default payment method
                    </Label>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Apple Pay and Google Pay will appear automatically if available on your device.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Selected Payment Method</h3>
              <div className="border rounded-lg p-4 bg-slate-50">
                <p className="text-sm text-muted-foreground mb-1">{savedPaymentMethod?.displayName}</p>
                <p className="text-base font-medium">
                  {savedPaymentMethod?.cardBrand
                    ? `${savedPaymentMethod.cardBrand} •••• ${savedPaymentMethod.cardLastFour}`
                    : savedPaymentMethod?.walletEmail ?? 'Saved payment method'}
                </p>
                {savedPaymentMethod?.cardExpiryMonth && savedPaymentMethod?.cardExpiryYear && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Expires {String(savedPaymentMethod.cardExpiryMonth).padStart(2, '0')}/
                    {savedPaymentMethod.cardExpiryYear}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                We will use your saved payment method to complete this transaction securely.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Payment Status */}
          {renderPaymentStatus()}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={
                !stripe ||
                (!isUsingSavedMethod && !elements) ||
                isProcessing ||
                paymentStatus === 'succeeded'
              }
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Thanh toán $${formatCurrency(amountToCharge)} ${currency.toUpperCase()}`
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default StripePaymentForm
