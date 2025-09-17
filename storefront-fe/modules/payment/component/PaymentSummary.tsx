'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Receipt, CreditCard, Shield, Clock } from 'lucide-react'

interface PaymentSummaryProps {
  amount: number
  currency: string
  description?: string
  fees?: number
  taxes?: number
  discount?: number
  totalAmount: number
  paymentMethod?: {
    type: string
    last4?: string
    brand?: string
  }
  processingTime?: string
  className?: string
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  amount,
  currency,
  description,
  fees = 0,
  taxes = 0,
  discount = 0,
  totalAmount,
  paymentMethod,
  processingTime = '2-3 business days',
  className,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(value)
  }

  const formatCardNumber = (last4?: string) => {
    return last4 ? `**** **** **** ${last4}` : '**** **** **** ****'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Payment Summary
        </CardTitle>
        <CardDescription>
          Review your payment details before proceeding
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        {description && (
          <div>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        )}

        {/* Payment Method */}
        {paymentMethod && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {paymentMethod.brand?.toUpperCase()} {formatCardNumber(paymentMethod.last4)}
            </span>
          </div>
        )}

        {/* Amount Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(amount)}</span>
          </div>
          
          {fees > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processing fee</span>
              <span>{formatCurrency(fees)}</span>
            </div>
          )}
          
          {taxes > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxes</span>
              <span>{formatCurrency(taxes)}</span>
            </div>
          )}
          
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Security & Processing Info */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Secured by Stripe</span>
            <Badge variant="secondary" className="text-xs">
              SSL Encrypted
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Processing time: {processingTime}</span>
          </div>
        </div>

        {/* Currency Note */}
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          <p>
            <strong>Note:</strong> All amounts are in {currency.toUpperCase()}. 
            Your bank may charge additional fees for international transactions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default PaymentSummary
