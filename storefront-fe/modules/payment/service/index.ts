// Placeholder payment service. Integrate with payment-service when API contracts are ready.

export interface CreatePaymentIntentPayload {
  bookingId: string
  amount: number
  currency: string
}

export interface PaymentIntent {
  id: string
  status: "requires_payment_method" | "requires_confirmation" | "succeeded" | "canceled"
  clientSecret?: string
}

export const paymentService = {
  async createIntent(_payload: CreatePaymentIntentPayload): Promise<PaymentIntent> {
    throw new Error("paymentService.createIntent not implemented")
  },
}

