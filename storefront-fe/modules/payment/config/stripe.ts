// Stripe configuration for frontend
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { StripeElementsOptions } from '../type/stripe'
import {env} from "@/env.mjs";
// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_default'

// Stripe currencies without minor units (zero-decimal)
const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg',
  'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'
])

// Initialize Stripe
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

const toStripeAmount = (amount: number, currency: string): number => {
  const normalizedCurrency = currency.toLowerCase()
  if (ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)) {
    return Math.round(amount)
  }
  return Math.round(amount * 100)
}

// Default Stripe Elements options
export const defaultStripeElementsOptions: StripeElementsOptions = {
  mode: 'payment',
  currency: 'vnd',
  paymentMethodTypes: ['card'],
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
  locale: 'en',
}

// Payment-specific Elements options
export const createPaymentElementsOptions = (
  amount: number,
  currency: string = 'vnd',
  customAppearance?: Partial<StripeElementsOptions['appearance']>
): StripeElementsOptions => ({
  ...defaultStripeElementsOptions,
  amount: toStripeAmount(amount, currency),
  currency: currency.toLowerCase(),
  appearance: {
    ...defaultStripeElementsOptions.appearance,
    ...customAppearance,
  },
})

// Setup mode Elements options (for saving payment methods)
export const createSetupElementsOptions = (
  customAppearance?: Partial<StripeElementsOptions['appearance']>
): StripeElementsOptions => ({
  ...defaultStripeElementsOptions,
  mode: 'setup',
  appearance: {
    ...defaultStripeElementsOptions.appearance,
    ...customAppearance,
  },
})

// Subscription mode Elements options
export const createSubscriptionElementsOptions = (
  customAppearance?: Partial<StripeElementsOptions['appearance']>
): StripeElementsOptions => ({
  ...defaultStripeElementsOptions,
  mode: 'subscription',
  appearance: {
    ...defaultStripeElementsOptions.appearance,
    ...customAppearance,
  },
})

// Error messages for common Stripe errors
export const STRIPE_ERROR_MESSAGES = {
  card_declined: 'Your card was declined. Please try a different payment method.',
  expired_card: 'Your card has expired. Please use a different payment method.',
  incorrect_cvc: 'The security code you entered is incorrect.',
  incorrect_number: 'The card number you entered is incorrect.',
  insufficient_funds: 'Your card has insufficient funds.',
  processing_error: 'A processing error occurred. Please try again.',
  authentication_required: 'Additional authentication is required for this payment.',
  generic_decline: 'Your card was declined. Please try a different payment method.',
  generic_error: 'Payment processing failed. Please try again or contact support.',
} as const

// Get user-friendly error message
export const getStripeErrorMessage = (errorCode?: string): string => {
  if (!errorCode) return STRIPE_ERROR_MESSAGES.generic_error
  
  return STRIPE_ERROR_MESSAGES[errorCode as keyof typeof STRIPE_ERROR_MESSAGES] || STRIPE_ERROR_MESSAGES.generic_error
}

// Validate Stripe configuration
export const validateStripeConfig = (): boolean => {
  if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY === 'pk_test_default') {
    console.warn('Stripe publishable key not configured. Using test key.')
    return false
  }
  
  if (!STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    console.error('Invalid Stripe publishable key format.')
    return false
  }
  
  return true
}

// Check if running in test mode
export const isStripeTestMode = (): boolean => {
  return STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')
}

// Get Stripe environment
export const getStripeEnvironment = (): 'test' | 'live' => {
  return isStripeTestMode() ? 'test' : 'live'
}
