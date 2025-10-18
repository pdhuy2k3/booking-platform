// Payment method management service
import { apiClient } from '@/lib/api-client'

export interface PaymentMethodType {
  CREDIT_CARD: string
  DEBIT_CARD: string
  BANK_TRANSFER: string
  DIGITAL_WALLET: string
}

export interface PaymentProvider {
  STRIPE: string
  VIETQR: string
  MOMO: string
  ZALOPAY: string
}

export interface PaymentMethodResponse {
  methodId: string
  displayName: string
  methodType: keyof PaymentMethodType
  provider: keyof PaymentProvider
  isDefault: boolean
  isActive: boolean
  isVerified: boolean
  cardLastFour?: string
  cardBrand?: string
  cardExpiryMonth?: number
  cardExpiryYear?: number
  bankName?: string
  bankAccountLastFour?: string
  walletEmail?: string
  createdAt: string
  updatedAt: string
  stripePaymentMethodId?: string
  stripeCustomerId?: string
}

export interface AddPaymentMethodRequest {
  methodType: keyof PaymentMethodType
  provider: keyof PaymentProvider
  displayName: string
  cardLastFour?: string
  cardBrand?: string
  cardExpiryMonth?: number
  cardExpiryYear?: number
  cardHolderName?: string
  cardHolderEmail?: string
  bankName?: string
  bankAccountLastFour?: string
  walletEmail?: string
  stripePaymentMethodId?: string
  stripeCustomerId?: string
  setAsDefault?: boolean
  billingAddress?: string
  postalCode?: string
  country?: string
}

export const paymentMethodService = {
  /**
   * Get all payment methods for the authenticated user
   */
  async getPaymentMethods(): Promise<PaymentMethodResponse[]> {
    try {
      const response = await apiClient.get<PaymentMethodResponse[]>('/payments/payment-methods')
      return response
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      throw error
    }
  },

  /**
   * Get a specific payment method by ID
   */
  async getPaymentMethodById(methodId: string): Promise<PaymentMethodResponse> {
    try {
      const response = await apiClient.get<PaymentMethodResponse>(`/payments/payment-methods/${methodId}`)
      return response
    } catch (error) {
      console.error('Error fetching payment method:', error)
      throw error
    }
  },

  /**
   * Add a new payment method
   */
  async addPaymentMethod(request: AddPaymentMethodRequest): Promise<PaymentMethodResponse> {
    try {
      const response = await apiClient.post<PaymentMethodResponse>('/payments/payment-methods', request)
      return response
    } catch (error) {
      console.error('Error adding payment method:', error)
      throw error
    }
  },

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(methodId: string): Promise<PaymentMethodResponse> {
    try {
      const response = await apiClient.put<PaymentMethodResponse>(
        `/payments/payment-methods/${methodId}/set-default`
      )
      return response
    } catch (error) {
      console.error('Error setting default payment method:', error)
      throw error
    }
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    try {
      await apiClient.delete(`/payments/payment-methods/${methodId}`)
    } catch (error) {
      console.error('Error deleting payment method:', error)
      throw error
    }
  },

  /**
   * Update payment method details
   */
  async updatePaymentMethod(
    methodId: string,
    updates: { displayName?: string }
  ): Promise<PaymentMethodResponse> {
    try {
      const response = await apiClient.put<PaymentMethodResponse>(
        `/payments/payment-methods/${methodId}`,
        updates
      )
      return response
    } catch (error) {
      console.error('Error updating payment method:', error)
      throw error
    }
  },

  /**
   * Verify a payment method
   */
  async verifyPaymentMethod(methodId: string): Promise<{ verified: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ verified: boolean; message: string }>(
        `/payments/payment-methods/${methodId}/verify`
      )
      return response
    } catch (error) {
      console.error('Error verifying payment method:', error)
      throw error
    }
  },

  /**
   * Helper: Check if a card is expired
   */
  isCardExpired(expiryMonth?: number, expiryYear?: number): boolean {
    if (!expiryMonth || !expiryYear) return false

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    return expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)
  },

  /**
   * Helper: Format expiry date
   */
  formatExpiryDate(month?: number, year?: number): string {
    if (!month || !year) return ''
    return `${String(month).padStart(2, '0')}/${year}`
  },

  /**
   * Helper: Get payment method description
   */
  getPaymentMethodDescription(method: PaymentMethodResponse): string {
    if (method.cardBrand && method.cardLastFour) {
      return `${method.cardBrand} ending in ${method.cardLastFour}`
    } else if (method.bankName && method.bankAccountLastFour) {
      return `${method.bankName} account ending in ${method.bankAccountLastFour}`
    } else if (method.walletEmail) {
      return `Wallet: ${method.walletEmail}`
    } else {
      return method.displayName
    }
  },

  /**
   * Helper: Get card brand icon name
   */
  getCardBrandIcon(brand?: string): string {
    if (!brand) return 'credit-card'

    const brandLower = brand.toLowerCase()
    if (brandLower.includes('visa')) return 'cc-visa'
    if (brandLower.includes('mastercard')) return 'cc-mastercard'
    if (brandLower.includes('amex') || brandLower.includes('american express')) return 'cc-amex'
    if (brandLower.includes('discover')) return 'cc-discover'
    if (brandLower.includes('jcb')) return 'cc-jcb'

    return 'credit-card'
  },
}
