import { apiClient } from "@/lib/api-client";
import type { FlightFare, FlightFareCreateRequest, FlightFareUpdateRequest, PaginatedResponse, ApiResponse } from "@/types/api";

export interface FlightFareListParams {
  page?: number;
  size?: number;
  scheduleId?: string;
  fareClass?: string;
}

export interface FlightFareStatistics {
  totalActiveFares: number;
  averagePrice: number;
  faresByClass: Record<string, number>;
  totalAvailableSeats: number;
}

export interface FlightFareCalculationRequest {
  scheduleIds: string[];
  fareClass: string;
  departureDate: string;
  passengerCount: number;
  basePrice?: number;
  aircraftType?: string;
}

export interface FlightFareCalculationResult {
  scheduleId: string;
  flightNumber: string;
  origin: string;
  destination: string;
  aircraftType: string;
  fareClass: string;
  calculatedPrice: number;
  availableSeats: number;
  currency: string;
  demandMultiplier: number;
  timeMultiplier: number;
  seasonalityMultiplier: number;
  fareClassMultiplier: number;
}

export class FlightFareService {
  private static readonly BASE_PATH = "/api/flights/backoffice/flight-fares";

  /**
   * Get flight fares with pagination and filtering
   */
  static async getFlightFares(params?: FlightFareListParams): Promise<PaginatedResponse<FlightFare>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page !== undefined) searchParams.append("page", params.page.toString());
      if (params?.size !== undefined) searchParams.append("size", params.size.toString());
      if (params?.scheduleId) searchParams.append("scheduleId", params.scheduleId);
      if (params?.fareClass) searchParams.append("fareClass", params.fareClass);

      const url = `${this.BASE_PATH}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      const response: ApiResponse<any> = await apiClient.get(url);

      // Transform the backend response to match PaginatedResponse structure
      return {
        content: response.data.content,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        size: response.data.size,
        number: response.data.page,
        first: response.data.first,
        last: response.data.last,
      };
    } catch (error) {
      console.error("Error fetching flight fares:", error);
      throw error;
    }
  }

  /**
   * Get flight fare by ID
   */
  static async getFlightFareById(fareId: string): Promise<FlightFare> {
    try {
      const response: ApiResponse<FlightFare> = await apiClient.get(`${this.BASE_PATH}/${fareId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching flight fare:", error);
      throw error;
    }
  }

  /**
   * Create a new flight fare
   */
  static async createFlightFare(data: FlightFareCreateRequest): Promise<FlightFare> {
    try {
      const response: ApiResponse<FlightFare> = await apiClient.post(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      console.error("Error creating flight fare:", error);
      throw error;
    }
  }

  /**
   * Update an existing flight fare
   */
  static async updateFlightFare(fareId: string, data: FlightFareUpdateRequest): Promise<FlightFare> {
    try {
      const response: ApiResponse<FlightFare> = await apiClient.put(`${this.BASE_PATH}/${fareId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating flight fare:", error);
      throw error;
    }
  }

  /**
   * Delete a flight fare
   */
  static async deleteFlightFare(fareId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${fareId}`);
    } catch (error) {
      console.error("Error deleting flight fare:", error);
      throw error;
    }
  }

  /**
   * Get flight fare statistics
   */
  static async getFlightFareStatistics(): Promise<FlightFareStatistics> {
    try {
      const response: ApiResponse<FlightFareStatistics> = await apiClient.get(`${this.BASE_PATH}/statistics`);
      return response.data;
    } catch (error) {
      console.error("Error fetching flight fare statistics:", error);
      throw error;
    }
  }

  /**
   * Calculate suggested flight fares based on pricing algorithm
   */
  static async calculateFlightFares(request: FlightFareCalculationRequest): Promise<FlightFareCalculationResult[]> {
    try {
      const response: ApiResponse<FlightFareCalculationResult[]> = await apiClient.post(
        `${this.BASE_PATH}/calculate`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error calculating flight fares:", error);
      throw error;
    }
  }
}
