import { apiClient } from "./api-client"

// Payment types
export interface PaymentMethod {
  id: string
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'MOMO' | 'ZALOPAY' | 'VNPAY' | 'BANK_TRANSFER'
  displayName: string
  provider: string
  isDefault: boolean
  lastFour?: string
  expiryDate?: string
  cardBrand?: string
  isActive: boolean
}

export interface PaymentRequest {
  bookingId: string
  amount: number
  currency: string
  gateway: 'STRIPE' | 'VIETQR' | 'PAYPAL'
  paymentMethodType: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET'
  paymentMethodId?: string
  paymentMethodToken?: string
  returnUrl: string
  cancelUrl: string
  description?: string
  bankCode?: string
  accountNumber?: string
  accountName?: string
  additionalData?: Record<string, any>
}

export interface PaymentResponse {
  paymentId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  amount: number
  currency: string
  paymentUrl?: string
  transactionId?: string
  providerResponse?: any
  createdAt: string
  updatedAt: string
}

export interface PaymentStatus {
  paymentId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  amount: number
  currency: string
  transactionId?: string
  failureReason?: string
  processedAt?: string
  refundedAmount?: number
  canRefund: boolean
}

export interface RefundRequest {
  paymentId: string
  amount?: number // null for full refund
  reason: string
}

export interface RefundResponse {
  refundId: string
  paymentId: string
  amount: number
  currency: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  reason: string
  processedAt?: string
}

export class PaymentService {
  // Get available payment methods for user
  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return apiClient.get<PaymentMethod[]>(`/api/payments/storefront/methods/${userId}`)
  }

  // Add new payment method
  static async addPaymentMethod(userId: string, paymentMethod: {
    type: string
    provider: string
    token: string
    isDefault?: boolean
  }): Promise<PaymentMethod> {
    return apiClient.post<PaymentMethod>(`/api/payments/storefront/methods/${userId}`, paymentMethod)
  }

  // Update payment method
  static async updatePaymentMethod(
    userId: string,
    methodId: string,
    updates: { isDefault?: boolean; isActive?: boolean }
  ): Promise<PaymentMethod> {
    return apiClient.patch<PaymentMethod>(`/api/payments/storefront/methods/${userId}/${methodId}`, updates)
  }

  // Delete payment method
  static async deletePaymentMethod(userId: string, methodId: string): Promise<void> {
    return apiClient.delete(`/api/payments/storefront/methods/${userId}/${methodId}`)
  }

  // Process payment using Strategy Pattern
  static async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>('/api/payments/process-payment', request)
  }

  // Get payment status
  static async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    return apiClient.get<PaymentStatus>(`/api/payments/status/${transactionId}`)
  }

  // Get payment history for user
  static async getPaymentHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{
    payments: PaymentResponse[]
    totalCount: number
    page: number
    limit: number
    hasMore: boolean
  }> {
    const queryParams = apiClient.buildQueryParams({
      page,
      limit,
      status
    })

    return apiClient.get(`/api/payments/storefront/history/${userId}?${queryParams}`)
  }

  // Request refund
  static async requestRefund(transactionId: string, request: RefundRequest): Promise<RefundResponse> {
    return apiClient.post<RefundResponse>(`/api/payments/refund/${transactionId}`, request)
  }

  // Get refund status
  static async getRefundStatus(refundId: string): Promise<RefundResponse> {
    return apiClient.get<RefundResponse>(`/api/payments/storefront/refunds/${refundId}`)
  }

  // Get supported payment providers
  static async getSupportedProviders(): Promise<Array<{
    provider: string
    displayName: string
    types: string[]
    isActive: boolean
    logo: string
    description: string
  }>> {
    return apiClient.get('/api/payments/storefront/providers')
  }

  // Verify payment callback
  static async verifyPaymentCallback(
    paymentId: string,
    callbackData: Record<string, any>
  ): Promise<PaymentStatus> {
    return apiClient.post<PaymentStatus>(`/api/payments/storefront/${paymentId}/verify`, callbackData)
  }

  // Cancel payment
  static async cancelPayment(transactionId: string, reason?: string): Promise<void> {
    return apiClient.post(`/api/payments/cancel/${transactionId}`, { reason })
  }

  // Get payment receipt
  static async getPaymentReceipt(paymentId: string): Promise<{
    paymentId: string
    bookingReference: string
    amount: number
    currency: string
    paymentMethod: string
    transactionId: string
    paidAt: string
    receiptUrl: string
    breakdown: Array<{
      description: string
      amount: number
    }>
  }> {
    return apiClient.get(`/api/payments/storefront/${paymentId}/receipt`)
  }
}

// Mock service for development
class MockPaymentService {
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        id: "pm-1",
        type: "CREDIT_CARD",
        displayName: "Visa ending in 4242",
        provider: "stripe",
        isDefault: true,
        lastFour: "4242",
        expiryDate: "12/25",
        cardBrand: "visa",
        isActive: true
      },
      {
        id: "pm-2",
        type: "MOMO",
        displayName: "MoMo Wallet",
        provider: "momo",
        isDefault: false,
        isActive: true
      }
    ]
  }

  static async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return {
      paymentId: `pay-${Date.now()}`,
      status: "COMPLETED",
      amount: request.amount,
      currency: request.currency,
      transactionId: `txn-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  static async getSupportedProviders() {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return [
      {
        provider: "stripe",
        displayName: "Credit/Debit Card",
        types: ["CREDIT_CARD", "DEBIT_CARD"],
        isActive: true,
        logo: "/payment-logos/stripe.png",
        description: "Pay securely with your credit or debit card"
      },
      {
        provider: "momo",
        displayName: "MoMo E-Wallet",
        types: ["MOMO"],
        isActive: true,
        logo: "/payment-logos/momo.png",
        description: "Pay with your MoMo wallet"
      },
      {
        provider: "vnpay",
        displayName: "VNPay",
        types: ["VNPAY"],
        isActive: true,
        logo: "/payment-logos/vnpay.png",
        description: "Pay with VNPay gateway"
      }
    ]
  }
}

// Use real service now that we have populated databases
export const paymentService = PaymentService

// Keep mock service available for testing if needed
export { MockPaymentService }
