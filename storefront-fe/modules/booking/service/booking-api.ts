import { apiClient } from '@/lib/api-client';
import { 
  FlightBookingDetails, 
  HotelBookingDetails, 
  ComboBookingDetails,
  BookingResponse,
  BookingStatusResponse,
  CreateBookingRequest
} from '../types';

// Type definitions for booking API
export interface StorefrontBookingRequest {
  bookingType: 'FLIGHT' | 'HOTEL' | 'COMBO';
  totalAmount: number;
  currency?: string;
  productDetails: FlightBookingDetails | HotelBookingDetails | ComboBookingDetails;
  notes?: string;
}

export interface StorefrontBookingResponse {
  bookingId?: string;
  bookingReference?: string;
  sagaId?: string;
  status?: string;
  message?: string;
  error?: string;
  errorCode?: string;
}

export interface BookingStatusPollResponse {
  bookingId: string;
  bookingReference: string;
  status: string;
  lastUpdated: string;
  message?: string;
  estimatedCompletion?: string;
}

class BookingApiService {
  /**
   * Create a new booking using the saga orchestration
   */
  async createBooking(request: StorefrontBookingRequest): Promise<StorefrontBookingResponse> {
    try {
      const response = await apiClient.post<StorefrontBookingResponse>(
        '/bookings/storefront',
        request
      );
      return response;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      throw new Error(error.response?.data?.error || 'Failed to create booking');
    }
  }

  /**
   * Get booking status for polling
   */
  async getBookingStatus(bookingId: string): Promise<BookingStatusPollResponse> {
    try {
      const response = await apiClient.get<BookingStatusPollResponse>(
        `/bookings/storefront/${bookingId}/status`
      );
      return response;
    } catch (error: any) {
      console.error('Error getting booking status:', error);
      throw new Error('Failed to get booking status');
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, reason: string): Promise<any> {
    try {
      const response = await apiClient.post(
        `/bookings/commands/${bookingId}/cancel`,
        {},
        { params: { reason } }
      );
      return response;
    } catch (error: any) {
      console.error('Error canceling booking:', error);
      throw new Error('Failed to cancel booking');
    }
  }
}

export const bookingApiService = new BookingApiService();