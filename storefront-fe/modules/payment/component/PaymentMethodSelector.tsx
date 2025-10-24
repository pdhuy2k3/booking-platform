'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Plus, Trash2, Star } from 'lucide-react'
import { paymentMethodService, type PaymentMethodResponse } from '../service/payment-method'

interface PaymentMethodSelectorProps {
  selectedMethodId?: string
  onSelectMethod: (method: PaymentMethodResponse | null) => void
  onAddNewMethod: () => void
  className?: string
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethodId,
  onSelectMethod,
  onAddNewMethod,
  className,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true)
      const methods = await paymentMethodService.getPaymentMethods()
      setError(null)
      setPaymentMethods(methods)
    } catch (error) {
      console.error('Error loading payment methods:', error)
      setError('Failed to load payment methods')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMethod = async (methodId: string) => {
    try {
      await paymentMethodService.deletePaymentMethod(methodId)
      setPaymentMethods(prev => prev.filter(method => method.methodId !== methodId))

      if (selectedMethodId === methodId) {
        onSelectMethod(null)
      }
      setError(null)
    } catch (error) {
      console.error('Error deleting payment method:', error)
      setError('Failed to delete payment method')
    }
  }

  const getMethodIcon = (method: PaymentMethodResponse) => {
    const type = method.methodType?.toUpperCase() ?? ''
    if (type.includes('APPLE')) return ''
    if (type.includes('GOOGLE')) return '🅖'
    if (type.includes('SAMSUNG')) return '🆂'
    if (type.includes('MOMO')) return '💠'
    if (type.includes('ZALO')) return '💬'
    const brand = method.cardBrand?.toLowerCase()
    if (brand?.includes('visa')) return '💳'
    if (brand?.includes('mastercard')) return '💳'
    if (brand?.includes('amex')) return '💳'
    return '💳'
  }

  const formatPrimaryLabel = (method: PaymentMethodResponse) => {
    if (method.cardLastFour) {
      return `**** **** **** ${method.cardLastFour}`
    }
    if (method.walletEmail) {
      return method.walletEmail
    }
    return method.displayName || method.methodType || 'Payment Method'
  }

  const formatSecondaryLabel = (method: PaymentMethodResponse) => {
    if (method.cardExpiryMonth && method.cardExpiryYear) {
      return `Expires ${method.cardExpiryMonth.toString().padStart(2, '0')}/${method.cardExpiryYear
        .toString()
        .slice(-2)}`
    }
    if (method.methodType) {
      return method.methodType
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    }
    return ''
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Loading your saved payment methods...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment Methods</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddNewMethod}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </CardTitle>
        <CardDescription>
          Choose a saved payment method or add a new one
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No payment methods saved</p>
              <p className="text-sm">Add a payment method to get started</p>
            </div>
          ) : (
            paymentMethods.map((method) => (
              <div
                key={method.methodId}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedMethodId === method.methodId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelectMethod(method)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getMethodIcon(method)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatPrimaryLabel(method)}
                        </span>
                        {method.cardBrand && method.cardLastFour && (
                          <Badge variant="secondary" className="text-xs">
                            {method.cardBrand.toUpperCase()}
                          </Badge>
                        )}
                        {!method.cardLastFour && method.methodType && (
                          <Badge variant="outline" className="text-xs">
                            {method.methodType.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        {method.isDefault && (
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatSecondaryLabel(method)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethodId === method.methodId
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedMethodId === method.methodId && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMethod(method.methodId)
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {paymentMethods.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={onAddNewMethod}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Payment Method
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PaymentMethodSelector
