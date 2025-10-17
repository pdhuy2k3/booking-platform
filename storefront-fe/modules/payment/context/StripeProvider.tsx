'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe, createPaymentElementsOptions, validateStripeConfig } from '../config/stripe'
import { StripeElementsOptions } from '../type/stripe'

interface StripeProviderProps {
  children: React.ReactNode
  amount?: number
  currency?: string
  mode?: 'payment' | 'setup' | 'subscription'
  appearance?: Partial<StripeElementsOptions['appearance']>
}

interface StripeContextValue {
  stripe: any
  elements: any
  isStripeLoaded: boolean
  stripeError: string | null
}

const StripeContext = createContext<StripeContextValue | null>(null)

export const useStripeContext = () => {
  const context = useContext(StripeContext)
  if (!context) {
    throw new Error('useStripeContext must be used within a StripeProvider')
  }
  return context
}

export const StripeProvider: React.FC<StripeProviderProps> = ({
  children,
  amount = 0,
  currency = 'vnd',
  mode = 'payment',
  appearance,
}) => {
  const [stripe, setStripe] = useState<any>(null)
  const [elements, setElements] = useState<any>(null)
  const [isStripeLoaded, setIsStripeLoaded] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Validate configuration
        if (!validateStripeConfig()) {
          setStripeError('Stripe configuration is invalid')
          return
        }

        // Load Stripe
        const stripeInstance = await getStripe()
        if (!stripeInstance) {
          setStripeError('Failed to load Stripe')
          return
        }

        setStripe(stripeInstance)
        setIsStripeLoaded(true)
        setStripeError(null)
      } catch (error) {
        console.error('Error initializing Stripe:', error)
        setStripeError('Failed to initialize Stripe')
      }
    }

    initializeStripe()
  }, [])

  // Create Elements options based on mode
  const getElementsOptions = (): any => {
    switch (mode) {
      case 'payment':
        return {
          ...createPaymentElementsOptions(amount, currency, appearance),
          setupFutureUsage: 'on_session', // Match the backend configuration
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
        }
      case 'setup':
        return {
          mode: 'setup',
          paymentMethodCreation: 'manual',
          setupFutureUsage: 'on_session', // Match the backend configuration
          appearance: {
            theme: 'stripe',
            ...appearance,
          },
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
        }
      case 'subscription':
        return {
          mode: 'subscription',
          setupFutureUsage: 'on_session', // Match the backend configuration
          appearance: {
            theme: 'stripe',
            ...appearance,
          },
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
        }
      default:
        return {
          ...createPaymentElementsOptions(amount, currency, appearance),
          setupFutureUsage: 'on_session', // Match the backend configuration
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
        }
    }
  }

  const contextValue: StripeContextValue = {
    stripe,
    elements,
    isStripeLoaded,
    stripeError,
  }

  if (!isStripeLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment system...</p>
        </div>
      </div>
    )
  }

  if (stripeError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <p className="text-red-600 mb-2">Payment system error</p>
          <p className="text-sm text-gray-600">{stripeError}</p>
        </div>
      </div>
    )
  }

  return (
    <StripeContext.Provider value={contextValue}>
      <Elements stripe={stripe} options={getElementsOptions()}>
        {children}
      </Elements>
    </StripeContext.Provider>
  )
}

export default StripeProvider
