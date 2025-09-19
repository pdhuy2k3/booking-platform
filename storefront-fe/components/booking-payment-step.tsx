"use client"

import { useEffect, useMemo, useState } from 'react'
import { useBooking } from '@/contexts/booking-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PaymentPage } from '@/modules/payment'
import { formatCurrency } from '@/lib/currency'
import { Loader2, CheckCircle2, AlertCircle, Clock3, CreditCard } from 'lucide-react'
import { bookingApiService } from '@/modules/booking/service/booking-api'

interface BookingPaymentStepProps {
  onPaymentSuccess: () => void
  onBack: () => void
  onCancel: () => void
}

const PENDING_STATUSES = new Set(['VALIDATION_PENDING', 'PENDING', 'PAYMENT_PENDING'])
const PAYMENT_READY_STATUSES = new Set(['PENDING', 'PAYMENT_PENDING'])
const SUCCESS_STATUSES = new Set(['CONFIRMED', 'PAID'])
const FAILURE_STATUSES = new Set(['FAILED', 'PAYMENT_FAILED', 'CANCELLED', 'CANCELED', 'VALIDATION_FAILED', 'REJECTED'])

export function BookingPaymentStep({ onPaymentSuccess, onBack, onCancel }: BookingPaymentStepProps) {
  const {
    step,
    isLoading,
    bookingData,
    bookingResponse,
    bookingStatus,
    refreshBookingStatus,
  } = useBooking()
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const amount = bookingData.totalAmount || 0
  const currency = (bookingData.currency || 'USD').toLowerCase()
  const bookingId = bookingResponse?.bookingId

  const status = (bookingStatus?.status || bookingResponse?.status || (isLoading ? 'VALIDATION_PENDING' : 'UNKNOWN')).toUpperCase()
  const message = bookingStatus?.message || bookingResponse?.message || 'Processing your booking...'
  const lastUpdated = bookingStatus?.lastUpdated
  const estimatedCompletion = bookingStatus?.estimatedCompletion

  const statusMeta = useMemo(() => {
    if (SUCCESS_STATUSES.has(status)) {
      return {
        icon: CheckCircle2,
        tone: 'text-green-600',
        bg: 'bg-green-50 border-green-200',
        title: 'Booking Confirmed',
        description: message || 'Booking confirmed successfully!',
      }
    }

    if (FAILURE_STATUSES.has(status)) {
      return {
        icon: AlertCircle,
        tone: 'text-red-600',
        bg: 'bg-red-50 border-red-200',
        title: 'Booking Issue',
        description: message || 'There was a problem processing your booking.',
      }
    }

    if (PAYMENT_READY_STATUSES.has(status)) {
      return {
        icon: CreditCard,
        tone: 'text-amber-600',
        bg: 'bg-amber-50 border-amber-200',
        title: 'Ready for Payment',
        description: message || 'Inventory locked, proceed to payment.',
      }
    }

    if (status === 'VALIDATION_PENDING') {
      return {
        icon: Clock3,
        tone: 'text-blue-600',
        bg: 'bg-blue-50 border-blue-200',
        title: 'Validating Booking',
        description: message || 'Checking inventory availability...',
      }
    }

    return {
      icon: Loader2,
      tone: 'text-muted-foreground',
      bg: 'bg-muted/40 border-muted',
      title: 'Processing',
      description: message || 'Processing your booking...',
    }
  }, [message, status])

  const StatusIcon = statusMeta.icon

  useEffect(() => {
    if (step === 'payment' && SUCCESS_STATUSES.has(status)) {
      onPaymentSuccess()
    }
  }, [step, status, onPaymentSuccess])

  const handlePaymentSuccess = async () => {
    try {
      setPaymentError(null)
      if (bookingId) {
        await bookingApiService.confirmBooking(bookingId)
      }
      await refreshBookingStatus()
      onPaymentSuccess()
    } catch (error) {
      console.error('Error confirming booking after payment:', error)
      setPaymentError('Payment succeeded but confirmation failed. Please contact support.')
    }
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
  }

  const isPaymentReady = PAYMENT_READY_STATUSES.has(status)
  const isFailure = FAILURE_STATUSES.has(status)
  const isSuccess = SUCCESS_STATUSES.has(status)

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle>Complete Your Payment</CardTitle>
        <p className="text-sm text-muted-foreground">
          We&apos;re finalizing your booking. You can proceed with payment once inventory is locked.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${statusMeta.bg}`}>
          <StatusIcon className={`h-6 w-6 flex-shrink-0 ${statusMeta.tone}`} />
          <div>
            <p className="font-medium">{statusMeta.title}</p>
            <p className="text-sm text-muted-foreground">{statusMeta.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="uppercase tracking-wide">
                {status}
              </Badge>
              {lastUpdated && <span>Updated: {new Date(lastUpdated).toLocaleString()}</span>}
              {estimatedCompletion && <span>ETA: {new Date(estimatedCompletion).toLocaleString()}</span>}
            </div>
          </div>
        </div>

        <Separator />

        {!bookingId && !isLoading && (
          <Alert variant="destructive">
            <AlertTitle>Missing booking information</AlertTitle>
            <AlertDescription>
              We could not find a booking reference for this payment. Please go back and submit your booking again.
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Creating booking request...</span>
          </div>
        )}

        {paymentError && (
          <Alert variant="destructive">
            <AlertTitle>Payment failed</AlertTitle>
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}

        {isFailure && (
          <div className="space-y-4 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm">
            <p className="font-medium text-destructive">
              {statusMeta.description || 'The booking could not be completed.'}
            </p>
            <p className="text-muted-foreground">
              You can return to the previous step to review your details or start over.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={onBack}>
                Review booking
              </Button>
              <Button variant="destructive" onClick={onCancel}>
                Start over
              </Button>
            </div>
          </div>
        )}

        {isSuccess && !isLoading && (
          <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-6 text-sm">
            <p className="font-medium text-green-700">
              Payment completed. Redirecting you to confirmation...
            </p>
            <Button onClick={onPaymentSuccess}>Continue</Button>
          </div>
        )}

            {bookingId && !isLoading && isPaymentReady && !isSuccess && !isFailure && (
              <div className="space-y-6">
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <p className="font-medium">Booking Reference</p>
                  <p className="text-muted-foreground">
                    {bookingResponse?.bookingReference || bookingId}
                  </p>
                  <p className="mt-3 font-medium">Amount due</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(amount, bookingData.currency || 'VND')}
                  </p>
                </div>

                {amount > 0 ? (
                  <PaymentPage
                    bookingId={bookingId}
                    sagaId={bookingResponse?.sagaId}
                    amount={amount}
                    currency={currency}
                    description={`Booking payment ${bookingResponse?.bookingReference || ''}`.trim()}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                onBack={onBack}
              />
            ) : (
              <div className="space-y-4 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                <p>No payment is required for this booking.</p>
                <Button onClick={handlePaymentSuccess}>Continue</Button>
              </div>
            )}
          </div>
        )}

        {!isPaymentReady && !isSuccess && !isFailure && !isLoading && bookingId && PENDING_STATUSES.has(status) && (
          <div className="space-y-4 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            <p>
              We&apos;re validating availability for your booking. This usually takes a few seconds.
              You&apos;ll be able to proceed to payment as soon as the inventory is locked.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button variant="outline" onClick={onBack}>
            Back to review
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel booking
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingPaymentStep
