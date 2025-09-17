// Stripe payment service for frontend integration
import { 
  StripePaymentIntentRequest, 
  StripePaymentIntentResponse, 
  StripeRefundRequest, 
  StripeRefundResponse,
  StripePaymentMethod,
  StripeCustomer
} from '../type/stripe'
import { apiClient } from '@/lib/api-client'

class StripePaymentService {
  private baseUrl = '/payments'

  /**
   * Create a Stripe PaymentIntent
   */
  async createPaymentIntent(request: StripePaymentIntentRequest): Promise<StripePaymentIntentResponse> {
    try {
      return await apiClient.post<StripePaymentIntentResponse>(
        `${this.baseUrl}/stripe/create-payment-intent`,
        request
      )
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  }

  /**
   * Confirm a Stripe PaymentIntent
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntentResponse> {
    try {
      return await apiClient.post<StripePaymentIntentResponse>(
        `${this.baseUrl}/stripe/confirm-payment-intent/${paymentIntentId}`,
        {}
      )
    } catch (error) {
      console.error('Error confirming payment intent:', error)
      throw error
    }
  }

  /**
   * Process a payment using existing payment method
   */
  async processPayment(request: StripePaymentIntentRequest): Promise<StripePaymentIntentResponse> {
    try {
      return await apiClient.post<StripePaymentIntentResponse>(
        `${this.baseUrl}/process-payment`,
        request
      )
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  }

  /**
   * Create a refund
   */
  async createRefund(request: StripeRefundRequest): Promise<StripeRefundResponse> {
    try {
      return await apiClient.post<StripeRefundResponse>(
        `${this.baseUrl}/refund`,
        request
      )
    } catch (error) {
      console.error('Error creating refund:', error)
      throw error
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string): Promise<StripePaymentIntentResponse> {
    try {
      return await apiClient.get<StripePaymentIntentResponse>(
        `${this.baseUrl}/status/${transactionId}`
      )
    } catch (error) {
      console.error('Error getting payment status:', error)
      throw error
    }
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(transactionId: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/cancel/${transactionId}`,
        {}
      )
    } catch (error) {
      console.error('Error canceling payment:', error)
      throw error
    }
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(): Promise<StripePaymentMethod[]> {
    try {
      return await apiClient.get<StripePaymentMethod[]>(
        `${this.baseUrl}/payment-methods`
      )
    } catch (error) {
      console.error('Error getting payment methods:', error)
      throw error
    }
  }

  /**
   * Get customer information
   */
  async getCustomer(): Promise<StripeCustomer | null> {
    try {
      return await apiClient.get<StripeCustomer>(
        `${this.baseUrl}/customer`
      )
    } catch (error) {
      console.error('Error getting customer:', error)
      throw error
    }
  }
}

export const stripePaymentService = new StripePaymentService()
export default stripePaymentService
