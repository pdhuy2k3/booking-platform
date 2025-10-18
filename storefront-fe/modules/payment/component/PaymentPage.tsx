'use client'

import React, { useState } from 'react'
import { StripeProvider } from '../context/StripeProvider'
import StripePaymentForm from './StripePaymentForm'
import PaymentMethodSelector from './PaymentMethodSelector'
import PaymentSummary from './PaymentSummary'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CreditCard, Wallet } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { bookingService } from '@/modules/booking/service'
import type { PaymentMethodResponse } from '../service/payment-method'

interface PaymentPageProps {
  bookingId: string
  amount: number
  currency?: string
  description?: string
  sagaId?: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
  onBack?: () => void
  className?: string
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  bookingId,
  amount,
  currency = 'vnd',
  description,
  sagaId,
  onSuccess,
  onError,
  onBack,
  className,
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string | undefined>(undefined)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodResponse | null>(null)
  const [activeTab, setActiveTab] = useState<'new' | 'saved'>('new')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  const handleSelectMethod = (method: PaymentMethodResponse | null) => {
    setSelectedMethod(method)
    setSelectedMethodId(method?.methodId)
    if (method) {
      setActiveTab('saved')
    }
  }

  const initiatePayment = async (paymentMethodId?: string) => {
    try {
      setInitError(null)
      setIsInitiatingPayment(true)
      await bookingService.requestPaymentInitiation(
        bookingId,
        paymentMethodId ? { paymentMethodId } : undefined
      )
    } catch (error: any) {
      const message = error?.message || 'Unable to prepare payment. Please try again.'
      setInitError(message)
      throw error
    } finally {
      setIsInitiatingPayment(false)
    }
  }

  const handleAddNewMethod = async () => {
    try {
      await initiatePayment()
      setActiveTab('new')
      setSelectedMethodId(undefined)
      setSelectedMethod(null)
      setShowPaymentForm(true)
    } catch {
      // error handled via initError state
    }
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent)
    onSuccess?.(paymentIntent)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    onError?.(error)
  }

  const handleBack = () => {
    if (showPaymentForm) {
      setShowPaymentForm(false)
    } else {
      onBack?.()
    }
  }

  const calculateFees = (amount: number) => {
    // Stripe fee: 2.9% + $0.30
    const feePercentage = 0.029
    const feeFixed = 0.30
    return Math.round((amount * feePercentage + feeFixed) * 100) / 100
  }

  const fees = calculateFees(amount)
  const totalAmount = amount + fees
  const paymentMetadata = {
    baseAmount: amount,
    feeAmount: fees,
  }

  if (showPaymentForm) {
    return (
      <div className={className}>
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payment Methods
          </Button>
        </div>

        <StripeProvider amount={totalAmount} currency={currency}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StripePaymentForm
              bookingId={bookingId}
              sagaId={sagaId}
              amount={amount}
              chargeAmount={totalAmount}
              feeAmount={fees}
              metadata={paymentMetadata}
              currency={currency}
              description={description}
              savedPaymentMethod={selectedMethod ?? undefined}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handleBack}
            />
            
            <PaymentSummary
              amount={amount}
              currency={currency}
              description={description}
              fees={fees}
              totalAmount={totalAmount}
            />
          </div>
        </StripeProvider>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'new' | 'saved')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Saved Methods
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                New Payment
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="saved" className="space-y-4">
              <PaymentMethodSelector
                selectedMethodId={selectedMethodId}
                onSelectMethod={handleSelectMethod}
                onAddNewMethod={() => { void handleAddNewMethod(); }}
              />
              
              {selectedMethodId && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Selected payment method will be used for this transaction.
                    </p>
                  </div>
                  
                  <Button
                    disabled={!selectedMethodId || isInitiatingPayment}
                    onClick={async () => {
                      if (!selectedMethodId) return
                      try {
                        await initiatePayment(selectedMethodId)
                        setShowPaymentForm(true)
                      } catch {
                        // handled via initError
                      }
                    }}
                    className="w-full"
                  >
                    {isInitiatingPayment ? 'Preparing payment...' : 'Continue with Selected Method'}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="new" className="space-y-4">
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Add New Payment Method</h3>
                <p className="text-gray-600 mb-4">
                  Enter your payment details securely
                </p>
                <Button
                  onClick={() => { void handleAddNewMethod(); }}
                  disabled={isInitiatingPayment}
                >
                  {isInitiatingPayment ? 'Preparing payment...' : 'Add Payment Method'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {initError && (
            <Alert variant="destructive">
              <AlertDescription>{initError}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <PaymentSummary
          amount={amount}
          currency={currency}
          description={description}
          fees={fees}
          totalAmount={totalAmount}
        />
      </div>
    </div>
  )
}

export default PaymentPage
