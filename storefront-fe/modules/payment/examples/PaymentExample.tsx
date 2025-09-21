'use client'

import React, { useState } from 'react'
import { PaymentPage } from '../component'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'

export const PaymentExample: React.FC = () => {
  const [showPayment, setShowPayment] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'error' | null
    message: string
  }>({ status: null, message: '' })

  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentResult({
      status: 'success',
      message: 'Payment completed successfully!'
    })
    setShowPayment(false)
  }

  const handlePaymentError = (error: string) => {
    setPaymentResult({
      status: 'error',
      message: `Payment failed: ${error}`
    })
  }

  const handleBack = () => {
    setShowPayment(false)
    setPaymentResult({ status: null, message: '' })
  }

  if (showPayment) {
    return (
      <PaymentPage
        bookingId="booking-123"
        amount={299.99}
        currency="usd"
        description="Flight booking from NYC to LAX"
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onBack={handleBack}
        className="max-w-6xl mx-auto p-6"
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Integration Example</CardTitle>
          <CardDescription>
            This example demonstrates the Stripe payment integration with React components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Flight Booking</h3>
              <p className="text-sm text-gray-600 mb-2">NYC → LAX</p>
              <p className="text-lg font-semibold">$299.99</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Processing Fee</h3>
              <p className="text-sm text-gray-600 mb-2">Stripe fee (2.9% + $0.30)</p>
              <p className="text-lg font-semibold">$9.00</p>
            </div>
            
            <div className="p-4 border rounded-lg bg-blue-50">
              <h3 className="font-medium mb-2">Total</h3>
              <p className="text-sm text-gray-600 mb-2">Including fees</p>
              <p className="text-lg font-semibold text-blue-600">$308.99</p>
            </div>
          </div>

          {paymentResult.status && (
            <div className={`p-4 rounded-lg border ${
              paymentResult.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {paymentResult.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  paymentResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {paymentResult.message}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={() => setShowPayment(true)}>
              Proceed to Payment
            </Button>
            
            <Button variant="outline" onClick={() => setPaymentResult({ status: null, message: '' })}>
              Reset Example
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Stripe Integration</h4>
              <div className="space-y-1">
                <Badge variant="secondary">Payment Elements</Badge>
                <Badge variant="secondary">3D Secure</Badge>
                <Badge variant="secondary">Multiple Payment Methods</Badge>
                <Badge variant="secondary">Webhook Support</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">UI Components</h4>
              <div className="space-y-1">
                <Badge variant="secondary">Payment Form</Badge>
                <Badge variant="secondary">Method Selector</Badge>
                <Badge variant="secondary">Payment Summary</Badge>
                <Badge variant="secondary">Error Handling</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentExample
