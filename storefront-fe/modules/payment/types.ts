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
