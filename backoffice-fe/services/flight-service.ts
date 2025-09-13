import { apiClient } from "@/lib/api-client";
import type { Flight, PaginatedResponse, ApiResponse } from "@/types/api";

interface FlightCreateRequest {
  flightNumber: string;
  airlineId: number;
  departureAirportId: number;
  arrivalAirportId: number;
  aircraftType?: string;
  status?: string;
  mediaPublicIds?: string[]; // Array of publicIds from MediaSelector
}

interface FlightUpdateRequest {
  flightNumber?: string;
  airlineId?: number;
  departureAirportId?: number;
  arrivalAirportId?: number;
  aircraftType?: string;
  status?: string;
  mediaPublicIds?: string[]; // Array of publicIds from MediaSelector
}

interface FlightStatistics {
  totalFlights: number;
  activeFlights: number;
  cancelledFlights: number;
  delayedFlights: number;
  totalAirlines: number;
  totalAirports: number;
}

export class FlightService {
  private static readonly BASE_PATH = "/api/flights/backoffice/flights";

  /**
   * Get flights with pagination and filtering
   */
  static async getFlights(params?: {
    page?: number;
    size?: number;
    search?: string;
    origin?: string;
    destination?: string;
    status?: string;
    includeRelated?: boolean; // Add parameter to include related data
  }): Promise<PaginatedResponse<Flight>> {
    try {
      const searchParams = new URLSearchParams();

      if (params?.page !== undefined) searchParams.append("page", params.page.toString());
      if (params?.size !== undefined) searchParams.append("size", params.size.toString());
      if (params?.search) searchParams.append("search", params.search);
      if (params?.origin) searchParams.append("origin", params.origin);
      if (params?.destination) searchParams.append("destination", params.destination);
      if (params?.status) searchParams.append("status", params.status);
      if (params?.includeRelated) searchParams.append("includeRelated", "true");

      const url = `${this.BASE_PATH}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      console.log("Fetching flights from URL:", url);
      const response: ApiResponse<any> = await apiClient.get(url);
      console.log("Flight API response:", response);

      // Transform the backend response to match PaginatedResponse structure
      return {
        content: response.data.content || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0,
        size: response.data.size || 0,
        number: response.data.number || 0,
        first: response.data.first || false,
        last: response.data.last || false,
      };
    } catch (error) {
      console.error("Error fetching flights:", error);
      throw error;
    }
  }

  /**
   * Get single flight by ID
   */
  static async getFlight(id: string | number): Promise<Flight> {
    try {
      const response: ApiResponse<Flight> = await apiClient.get(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching flight ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new flight
   */
  static async createFlight(flight: FlightCreateRequest): Promise<Flight> {
    try {
      const response: ApiResponse<Flight> = await apiClient.post(this.BASE_PATH, flight);
      return response.data;
    } catch (error) {
      console.error("Error creating flight:", error);
      throw error;
    }
  }

  /**
   * Update an existing flight
   */
  static async updateFlight(id: string | number, flight: FlightUpdateRequest): Promise<Flight> {
    try {
      const response: ApiResponse<Flight> = await apiClient.put(`${this.BASE_PATH}/${id}`, flight);
      return response.data;
    } catch (error) {
      console.error(`Error updating flight ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a flight
   */
  static async deleteFlight(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Error deleting flight ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update flight status
   */
  static async updateFlightStatus(id: string | number, status: string): Promise<Flight> {
    return this.updateFlight(id, { status });
  }

  /**
   * Get flight statistics
   */
  static async getFlightStatistics(): Promise<FlightStatistics> {
    try {
      const response: ApiResponse<FlightStatistics> = await apiClient.get(`${this.BASE_PATH}/statistics`);
      return response.data;
    } catch (error) {
      console.error("Error fetching flight statistics:", error);
      throw error;
    }
  }
}