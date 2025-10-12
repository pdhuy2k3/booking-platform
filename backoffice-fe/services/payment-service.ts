import { apiClient } from "@/lib/api-client"
import type { 
  Payment, 
  PaymentTransaction, 
  PaymentMethod, 
  PaymentSagaLog,
  PaymentFilters, 
  PaymentStats,
  PaymentProcessRequest,
  PaymentRefundRequest,
  PaginatedResponse,
  ApiResponse
} from "@/types/api"

export class PaymentService {
  private static readonly BASE_URL = "/api/payments/backoffice"

  /**
   * Get paginated list of payments with filters
   */
  static async getPayments(filters?: PaymentFilters): Promise<PaginatedResponse<Payment>> {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append("search", filters.search)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.provider) params.append("provider", filters.provider)
    if (filters?.methodType) params.append("methodType", filters.methodType)
    if (filters?.bookingId) params.append("bookingId", filters.bookingId)
    if (filters?.userId) params.append("userId", filters.userId)
    if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom)
    if (filters?.dateTo) params.append("dateTo", filters.dateTo)
    if (filters?.amountFrom) params.append("amountFrom", filters.amountFrom.toString())
    if (filters?.amountTo) params.append("amountTo", filters.amountTo.toString())
    if (filters?.page) params.append("page", (filters.page - 1).toString()) // Convert to 0-based
    if (filters?.size) params.append("size", filters.size.toString())
    if (filters?.sort) params.append("sort", filters.sort)
    if (filters?.direction) params.append("direction", filters.direction)

    const queryString = params.toString()
    const url = queryString ? `${this.BASE_URL}/payments?${queryString}` : `${this.BASE_URL}/payments`
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Payment>>>(url);
    return response.data;
  }

  /**
   * Get payment by ID with full details
   */
  static async getPaymentById(paymentId: string): Promise<Payment> {
    const response = await apiClient.get<ApiResponse<Payment>>(`${this.BASE_URL}/payments/${paymentId}`);
    return response.data;
  }

  /**
   * Get payment transactions by payment ID
   */
  static async getPaymentTransactions(paymentId: string): Promise<PaymentTransaction[]> {
    const response = await apiClient.get<ApiResponse<PaymentTransaction[]>>(`${this.BASE_URL}/payments/${paymentId}/transactions`);
    return response.data || [];
  }

  /**
   * Get payment saga logs
   */
  static async getPaymentSagaLogs(paymentId: string): Promise<PaymentSagaLog[]> {
    const response = await apiClient.get<ApiResponse<PaymentSagaLog[]>>(`${this.BASE_URL}/payments/${paymentId}/saga-logs`);
    return response.data || [];
  }

  /**
   * Process manual payment (admin initiated)
   */
  static async processManualPayment(request: PaymentProcessRequest): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<Payment>>(`${this.BASE_URL}/payments/manual`, request);
    return response.data;
  }

  /**
   * Update payment status (admin action)
   */
  static async updatePaymentStatus(
    paymentId: string, 
    status: PaymentFilters["status"], 
    reason?: string
  ): Promise<Payment> {
    const response = await apiClient.put<ApiResponse<Payment>>(`${this.BASE_URL}/payments/${paymentId}/status`, {
      status,
      reason
    });
    return response.data;
  }

  /**
   * Process refund
   */
  static async processRefund(request: PaymentRefundRequest): Promise<PaymentTransaction> {
    const response = await apiClient.post<ApiResponse<PaymentTransaction>>(`${this.BASE_URL}/payments/${request.paymentId}/refund`, {
      amount: request.amount,
      reason: request.reason
    });
    return response.data;
  }

  /**
   * Cancel payment
   */
  static async cancelPayment(paymentId: string, reason?: string): Promise<Payment> {
    const response = await apiClient.put<ApiResponse<Payment>>(`${this.BASE_URL}/payments/${paymentId}/cancel`, {
      reason
    });
    return response.data;
  }

  /**
   * Retry failed payment
   */
  static async retryPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<Payment>>(`${this.BASE_URL}/payments/${paymentId}/retry`);
    return response.data;
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats(
    dateFrom?: string, 
    dateTo?: string, 
    provider?: string
  ): Promise<PaymentStats> {
    const params = new URLSearchParams()
    if (dateFrom) params.append("dateFrom", dateFrom)
    if (dateTo) params.append("dateTo", dateTo)
    if (provider) params.append("provider", provider)

    const queryString = params.toString()
    const url = queryString ? `${this.BASE_URL}/payments/stats?${queryString}` : `${this.BASE_URL}/payments/stats`
    
    const response = await apiClient.get<ApiResponse<PaymentStats>>(url);
    return response.data;
  }

  /**
   * Get user payment methods
   */
  static async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const response = await apiClient.get<ApiResponse<PaymentMethod[]>>(`${this.BASE_URL}/users/${userId}/payment-methods`);
    return response.data;
  }

  /**
   * Delete payment method
   */
  static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/payment-methods/${paymentMethodId}`);
  }

  /**
   * Export payments to CSV
   */
  static async exportPayments(filters?: PaymentFilters): Promise<Blob> {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append("search", filters.search)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.provider) params.append("provider", filters.provider)
    if (filters?.methodType) params.append("methodType", filters.methodType)
    if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom)
    if (filters?.dateTo) params.append("dateTo", filters.dateTo)

    const queryString = params.toString()
    const url = queryString ? `${this.BASE_URL}/payments/export?${queryString}` : `${this.BASE_URL}/payments/export`
    
    return apiClient.getBlob(url)
  }

  /**
   * Get payment by booking ID
   */
  static async getPaymentByBookingId(bookingId: string): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<Payment[]>>(`${this.BASE_URL}/bookings/${bookingId}/payments`);
    return response.data;
  }

  /**
   * Reconcile payment with gateway
   */
  static async reconcilePayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<Payment>>(`${this.BASE_URL}/payments/${paymentId}/reconcile`);
    return response.data;
  }

  /**
   * Get payment gateway webhooks
   */
  static async getPaymentWebhooks(
    paymentId?: string,
    provider?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<any[]> {
    const params = new URLSearchParams()
    if (paymentId) params.append("paymentId", paymentId)
    if (provider) params.append("provider", provider)
    if (dateFrom) params.append("dateFrom", dateFrom)
    if (dateTo) params.append("dateTo", dateTo)

    const queryString = params.toString()
    const url = queryString ? `${this.BASE_URL}/webhooks?${queryString}` : `${this.BASE_URL}/webhooks`
    
    const response = await apiClient.get<ApiResponse<any[]>>(url);
    return response.data;
  }
}