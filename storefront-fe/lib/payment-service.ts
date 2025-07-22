import { apiClient } from "./api-client"

export interface PaymentMethod {
  id: string
  type: string
  displayName: string
  provider: string
  isDefault: boolean
  isActive: boolean
  lastFour?: string
  cardBrand?: string
}

export interface CreatePaymentIntentRequest {
  bookingId: string
  amount: number
  currency: string
  gateway: "STRIPE" | "VIETQR"
  description?: string
  metadata?: Record<string, any>
  accountName?: string
  accountNumber?: string
}

export interface PaymentIntentResponse {
  paymentIntentId: string
  clientSecret?: string
  amount: number
  currency: string
  status: string
  gateway: string
  qrCodeUrl?: string
  qrCodeData?: string
  transferInfo?: string
  description?: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface ConfirmPaymentIntentRequest {
  paymentIntentId: string
  paymentMethodId?: string
  returnUrl?: string
  useStripeSdk?: boolean
}

export interface PaymentRequest {
  amount: number
  currency: string
  paymentMethodId?: string
  description?: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  id: string
  status: string
  amount: number
  currency: string
  clientSecret?: string
  paymentUrl?: string
}

export interface PaymentStatus {
  transactionId: string
  status: string
  amount: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface RefundRequest {
  amount?: number
  reason?: string
}

export interface RefundResponse {
  success: boolean
  refundId: string
  amount: number
  status: string
}

export class PaymentService {
  // Payment Intent Management
  static async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    return apiClient.post<PaymentIntentResponse>("/api/payments/storefront/payment-intent", request)
  }

  static async confirmPaymentIntent(request: ConfirmPaymentIntentRequest): Promise<PaymentIntentResponse> {
    return apiClient.post<PaymentIntentResponse>("/api/payments/storefront/payment-intent/confirm", request)
  }

  // Payment Methods
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiClient.get<PaymentMethod[]>("/api/payments/storefront/methods")
  }

  // Stripe Configuration
  static async getStripeConfig(): Promise<{ publishableKey: string; apiVersion: string }> {
    return apiClient.get("/api/payments/storefront/stripe/config")
  }

  // Stripe Payment Processing
  static async createStripePaymentIntent(request: {
    bookingId: string
    amount: number
    currency: string
    metadata?: Record<string, any>
  }): Promise<{
    id: string
    clientSecret: string
    amount: number
    currency: string
    status: string
    paymentMethodTypes: string[]
  }> {
    return apiClient.post("/api/payments/storefront/stripe/create-intent", request)
  }

  static async confirmStripePayment(request: {
    paymentIntentId: string
  }): Promise<{
    success: boolean
    paymentIntent?: any
    error?: any
  }> {
    return apiClient.post("/api/payments/storefront/stripe/confirm", request)
  }

  // General Payment Processing
  static async processPayment(request: {
    bookingId: string
    amount: number
    currency: string
    gateway: string
    paymentMethodType: string
    paymentMethodId?: string
    paymentMethodToken?: string
    description?: string
    additionalData?: Record<string, any>
  }): Promise<{
    success: boolean
    paymentId: string
    transactionId: string
    status: string
    amount: number
    currency: string
    paymentUrl?: string
    createdAt: string
  }> {
    return apiClient.post("/api/payments/storefront/process-payment", request)
  }

  // Payment Status and Management
  static async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    return apiClient.get<PaymentStatus>(`/api/payments/storefront/status/${transactionId}`)
  }

  static async cancelPayment(transactionId: string, reason?: string): Promise<{
    success: boolean
    transactionId: string
    status: string
    cancelledAt: string
    reason: string
  }> {
    return apiClient.post(`/api/payments/storefront/cancel/${transactionId}`, { reason })
  }

  // Refund Processing
  static async processRefund(transactionId: string, request: RefundRequest): Promise<RefundResponse> {
    return apiClient.post<RefundResponse>(`/api/payments/storefront/refund/${transactionId}`, request)
  }

  // Legacy Payment Methods (for backward compatibility)
  static async processPaymentLegacy(request: PaymentRequest): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>("/api/payments/storefront/process", request)
  }

  static async getPaymentHistory(page: number = 1, limit: number = 10): Promise<{
    payments: PaymentStatus[]
    totalCount: number
    page: number
    limit: number
    hasMore: boolean
  }> {
    const queryParams = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    }).toString()
    return apiClient.get(`/api/payments/storefront/history?${queryParams}`)
  }
}

// Export singleton instance for compatibility
export const paymentService = new PaymentService()
