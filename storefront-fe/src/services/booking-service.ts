import { api } from "@/lib/api/client";
import { 
  BookingRequest, 
  BookingResponse, 
  BookingHistoryItem,
  BookingModificationRequest,
  BookingCancellationRequest,
  PaymentIntent
} from "@/types/api/booking";
import { ApiResponse } from "@/types/api/common";

export class BookingService {
  private static readonly BASE_PATH = "/api/bookings";

  /**
   * Create a new booking
   */
  static async createBooking(bookingData: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await api.post<ApiResponse<BookingResponse>>(
        `${this.BASE_PATH}/storefront`,
        bookingData
      );
      return response.data;
    } catch (error) {
      console.error("Booking creation failed:", error);
      throw error;
    }
  }

  /**
   * Get booking details by ID
   */
  static async getBookingDetails(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await api.get<ApiResponse<BookingResponse>>(
        `${this.BASE_PATH}/${bookingId}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get booking details:", error);
      throw error;
    }
  }

  /**
   * Get booking by reference number
   */
  static async getBookingByReference(reference: string): Promise<BookingResponse> {
    try {
      const response = await api.get<ApiResponse<BookingResponse>>(
        `${this.BASE_PATH}/reference/${reference}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get booking by reference:", error);
      throw error;
    }
  }

  /**
   * Get user's booking history
   */
  static async getBookingHistory(
    page = 1,
    limit = 10,
    status?: string
  ): Promise<{
    bookings: BookingHistoryItem[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const params = { page, limit, ...(status && { status }) };
      const response = await api.get<ApiResponse<{
        bookings: BookingHistoryItem[];
        totalCount: number;
        hasMore: boolean;
      }>>(
        `${this.BASE_PATH}/history`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get booking history:", error);
      throw error;
    }
  }

  /**
   * Modify an existing booking
   */
  static async modifyBooking(
    modificationData: BookingModificationRequest
  ): Promise<BookingResponse> {
    try {
      const response = await api.put<ApiResponse<BookingResponse>>(
        `${this.BASE_PATH}/${modificationData.bookingId}/modify`,
        modificationData
      );
      return response.data;
    } catch (error) {
      console.error("Booking modification failed:", error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(
    cancellationData: BookingCancellationRequest
  ): Promise<BookingResponse> {
    try {
      const response = await api.post<ApiResponse<BookingResponse>>(
        `${this.BASE_PATH}/${cancellationData.bookingId}/cancel`,
        cancellationData
      );
      return response.data;
    } catch (error) {
      console.error("Booking cancellation failed:", error);
      throw error;
    }
  }

  /**
   * Create payment intent for Stripe
   */
  static async createPaymentIntent(
    bookingData: Partial<BookingRequest>
  ): Promise<PaymentIntent> {
    try {
      const response = await api.post<ApiResponse<PaymentIntent>>(
        `${this.BASE_PATH}/payment-intent`,
        {
          amount: bookingData.totalAmount,
          currency: bookingData.currency || "VND",
          bookingType: bookingData.bookingType,
          metadata: {
            passengers: bookingData.passengers?.length || 1,
            contactEmail: bookingData.contactInfo?.email
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      throw error;
    }
  }

  /**
   * Confirm payment and complete booking
   */
  static async confirmPayment(
    paymentIntentId: string,
    bookingData: BookingRequest
  ): Promise<BookingResponse> {
    try {
      const response = await api.post<ApiResponse<BookingResponse>>(
        `${this.BASE_PATH}/confirm-payment`,
        {
          paymentIntentId,
          bookingData
        }
      );
      return response.data;
    } catch (error) {
      console.error("Payment confirmation failed:", error);
      throw error;
    }
  }

  /**
   * Download booking documents (tickets, vouchers, etc.)
   */
  static async downloadBookingDocuments(
    bookingId: string,
    documentType: "ticket" | "voucher" | "invoice" | "all"
  ): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.BASE_PATH}/${bookingId}/documents/${documentType}`,
        { responseType: "blob" }
      );
      return response;
    } catch (error) {
      console.error("Failed to download booking documents:", error);
      throw error;
    }
  }

  /**
   * Send booking confirmation email
   */
  static async resendConfirmationEmail(bookingId: string): Promise<void> {
    try {
      await api.post(`${this.BASE_PATH}/${bookingId}/resend-confirmation`);
    } catch (error) {
      console.error("Failed to resend confirmation email:", error);
      throw error;
    }
  }

  /**
   * Validate promo code
   */
  static async validatePromoCode(
    promoCode: string,
    bookingData: Partial<BookingRequest>
  ): Promise<{
    valid: boolean;
    discount: {
      type: "percentage" | "fixed";
      value: number;
      maxDiscount?: number;
    };
    message: string;
  }> {
    try {
      const response = await api.post<ApiResponse<{
        valid: boolean;
        discount: {
          type: "percentage" | "fixed";
          value: number;
          maxDiscount?: number;
        };
        message: string;
      }>>(
        `${this.BASE_PATH}/validate-promo`,
        {
          promoCode,
          bookingType: bookingData.bookingType,
          totalAmount: bookingData.totalAmount,
          currency: bookingData.currency
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to validate promo code:", error);
      throw error;
    }
  }

  /**
   * Get booking pricing breakdown
   */
  static async getPricingBreakdown(
    bookingData: Partial<BookingRequest>
  ): Promise<{
    subtotal: number;
    taxes: number;
    fees: number;
    discounts: number;
    total: number;
    breakdown: { item: string; amount: number }[];
  }> {
    try {
      const response = await api.post<ApiResponse<{
        subtotal: number;
        taxes: number;
        fees: number;
        discounts: number;
        total: number;
        breakdown: { item: string; amount: number }[];
      }>>(
        `${this.BASE_PATH}/pricing-breakdown`,
        bookingData
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get pricing breakdown:", error);
      throw error;
    }
  }
}
