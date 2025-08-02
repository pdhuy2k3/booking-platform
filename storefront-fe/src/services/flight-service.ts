import { api } from "@/lib/api/client";
import { 
  FlightSearchRequest, 
  FlightSearchResponse, 
  FlightBookingRequest, 
  FlightBookingResponse,
  FlightOffer 
} from "@/types/api/flight";
import { ApiResponse } from "@/types/api/common";

export class FlightService {
  private static readonly BASE_PATH = "/api/flights";

  /**
   * Search for flights based on criteria
   */
  static async searchFlights(
    searchParams: FlightSearchRequest
  ): Promise<FlightSearchResponse> {
    try {
      const response = await api.post<ApiResponse<FlightSearchResponse>>(
        `${this.BASE_PATH}/search`,
        searchParams
      );
      return response.data;
    } catch (error) {
      console.error("Flight search failed:", error);
      throw error;
    }
  }

  /**
   * Get flight details by offer ID
   */
  static async getFlightDetails(offerId: string): Promise<FlightOffer> {
    try {
      const response = await api.get<ApiResponse<FlightOffer>>(
        `${this.BASE_PATH}/offers/${offerId}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get flight details:", error);
      throw error;
    }
  }

  /**
   * Book a flight
   */
  static async bookFlight(
    bookingData: FlightBookingRequest
  ): Promise<FlightBookingResponse> {
    try {
      const response = await api.post<ApiResponse<FlightBookingResponse>>(
        `${this.BASE_PATH}/book`,
        bookingData
      );
      return response.data;
    } catch (error) {
      console.error("Flight booking failed:", error);
      throw error;
    }
  }

  /**
   * Get booking details
   */
  static async getBooking(bookingId: string): Promise<FlightBookingResponse> {
    try {
      const response = await api.get<ApiResponse<FlightBookingResponse>>(
        `${this.BASE_PATH}/bookings/${bookingId}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get booking details:", error);
      throw error;
    }
  }

  /**
   * Cancel a flight booking
   */
  static async cancelBooking(bookingId: string): Promise<{ success: boolean; refundAmount?: number }> {
    try {
      const response = await api.post<ApiResponse<{ success: boolean; refundAmount?: number }>>(
        `${this.BASE_PATH}/bookings/${bookingId}/cancel`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      throw error;
    }
  }

  /**
   * Get popular destinations
   */
  static async getPopularDestinations(origin?: string): Promise<{ destination: string; price: number; image?: string }[]> {
    try {
      const params = origin ? { origin } : {};
      const response = await api.get<ApiResponse<{ destination: string; price: number; image?: string }[]>>(
        `${this.BASE_PATH}/popular-destinations`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get popular destinations:", error);
      throw error;
    }
  }

  /**
   * Get flight price alerts
   */
  static async createPriceAlert(alertData: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    email: string;
    targetPrice: number;
  }): Promise<{ alertId: string }> {
    try {
      const response = await api.post<ApiResponse<{ alertId: string }>>(
        `${this.BASE_PATH}/price-alerts`,
        alertData
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create price alert:", error);
      throw error;
    }
  }

  /**
   * Get seat map for a flight
   */
  static async getSeatMap(offerId: string, segmentId: string): Promise<{
    aircraft: string;
    seats: {
      number: string;
      type: "economy" | "premium-economy" | "business" | "first";
      status: "available" | "occupied" | "blocked";
      price?: number;
      features: string[];
    }[];
  }> {
    try {
      const response = await api.get<ApiResponse<{
        aircraft: string;
        seats: {
          number: string;
          type: "economy" | "premium-economy" | "business" | "first";
          status: "available" | "occupied" | "blocked";
          price?: number;
          features: string[];
        }[];
      }>>(
        `${this.BASE_PATH}/offers/${offerId}/segments/${segmentId}/seats`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get seat map:", error);
      throw error;
    }
  }
}
