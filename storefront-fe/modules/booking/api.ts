import { apiClient } from "@/common/api/api-client"
import type {
  BookingFlowState, 
  BookingStep, 
  BookingType, 
  FlightSearchRequest, 
  HotelSearchRequest, 
  FlightSearchResult, 
  HotelSearchResult, 
  RoomInfo, 
  PassengerInfo 
} from "./types"

export interface CreateBookingRequest {
  bookingType: BookingType;
  totalAmount: number;
  currency: string;
  productDetails: any;
  notes?: string;
  paymentMethodType?: string;
  paymentGateway?: string;
}

export interface BookingResponse {
  bookingId: string;
  bookingReference: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

export interface BookingDetails extends BookingResponse {
  flightDetails?: FlightSearchResult;
  hotelDetails?: HotelSearchResult;
  roomDetails?: RoomInfo;
  passengers: PassengerInfo[];
}

export class BookingService {
  // Booking Management
  static async createBooking(request: CreateBookingRequest): Promise<BookingResponse> {
    return apiClient.post<BookingResponse>("/api/bookings/storefront", request)
  }

  static async getBooking(bookingId: string): Promise<BookingDetails> {
    return apiClient.get<BookingDetails>(`/api/bookings/storefront/${bookingId}`)
  }

  static async getBookingBySaga(sagaId: string): Promise<BookingDetails> {
    return apiClient.get<BookingDetails>(`/api/bookings/storefront/saga/${sagaId}`)
  }

  static async getUserBookings(userId: string): Promise<BookingResponse[]> {
    return apiClient.get<BookingResponse[]>(`/api/bookings/storefront/user/${userId}`)
  }

  static async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    return apiClient.delete(`/api/bookings/storefront/${bookingId}`, {
      data: { reason }
    })
  }

  static async getBookingHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{
    bookings: BookingResponse[]
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

    return apiClient.get(`/api/bookings/storefront/user/${userId}/history?${queryParams}`)
  }
}

// Use real service now that we have populated databases
export const bookingService = new BookingService()
