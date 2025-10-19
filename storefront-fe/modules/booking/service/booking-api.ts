import { apiClient } from '@/lib/api-client';
import {
  BookingHistoryResponseDto,
  GuestDetails,
  PassengerDetails,
  FlightService,
  HotelService,
} from '../types';

export interface StorefrontFlightSelection {
  flightId: string;
  scheduleId?: string | null;
  fareId?: string | null;
  seatClass?: string | null;
  departureDateTime?: string | null;
  arrivalDateTime?: string | null;
  passengerCount: number;
  passengers: PassengerDetails[];
  selectedSeats?: string[];
  additionalServices?: FlightService[];
  specialRequests?: string | null;
  pricePerPassenger?: number | null;
  totalFlightPrice: number;
}

export interface StorefrontHotelSelection {
  hotelId: string;
  roomTypeId: string;
  roomId?: string | null;
  roomAvailabilityId?: string | null;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfRooms: number;
  numberOfGuests: number;
  guests: GuestDetails[];
  pricePerNight: number;
  totalRoomPrice: number;
  bedType?: string | null;
  amenities?: string[];
  additionalServices?: HotelService[];
  specialRequests?: string | null;
  cancellationPolicy?: string | null;
}

// Type definitions for booking API
export interface StorefrontBookingRequest {
  bookingType: 'FLIGHT' | 'HOTEL' | 'COMBO';
  totalAmount: number;
  currency?: string;
  flightSelection?: StorefrontFlightSelection;
  hotelSelection?: StorefrontHotelSelection;
  comboDiscount?: number;
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
  reservationLockedAt?: string | null;
  reservationExpiresAt?: string | null;
}

export interface BookingStatusPollResponse {
  bookingId: string;
  bookingReference: string;
  status: string;
  lastUpdated: string;
  message?: string;
  estimatedCompletion?: string;
  reservationLockedAt?: string | null;
  reservationExpiresAt?: string | null;
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
        undefined,
        { params: { reason } }
      );
      return response;
    } catch (error: any) {
      console.error('Error canceling booking:', error);
      throw new Error('Failed to cancel booking');
    }
  }

  async confirmBooking(bookingId: string): Promise<BookingStatusPollResponse> {
    try {
      return await apiClient.post<BookingStatusPollResponse>(
        `/bookings/storefront/${bookingId}/confirm`
      )
    } catch (error: any) {
      console.error('Error confirming booking:', error)
      throw new Error('Failed to confirm booking')
    }
  }

  async initiatePayment(bookingId: string, payload?: { paymentMethodId?: string }): Promise<BookingStatusPollResponse> {
    try {
      return await apiClient.post<BookingStatusPollResponse>(
        `/bookings/storefront/${bookingId}/payment/initiate`,
        payload ?? {}
      )
    } catch (error: any) {
      console.error('Error initiating payment:', error)
      throw new Error(error?.response?.data?.message || 'Failed to initiate payment')
    }
  }

  async getBookingHistory(page = 0, size = 10): Promise<BookingHistoryResponseDto> {
    try {
      return await apiClient.get<BookingHistoryResponseDto>(
        '/bookings/storefront/history',
        { params: { page, size } }
      )
    } catch (error: any) {
      console.error('Error fetching booking history:', error)
      throw new Error('Failed to fetch booking history')
    }
  }
}

export const bookingApiService = new BookingApiService();
