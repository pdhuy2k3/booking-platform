import { apiClient } from "@/lib/api-client";
import type { Aircraft, PaginatedResponse, ApiResponse } from "@/types/api";

interface AircraftCreateRequest {
  model: string;
  manufacturer?: string;
  capacityEconomy?: number;
  capacityBusiness?: number;
  capacityFirst?: number;
  totalCapacity?: number;
  registrationNumber?: string;
  mediaPublicIds?: string[];
}

interface AircraftUpdateRequest {
  model?: string;
  manufacturer?: string;
  capacityEconomy?: number;
  capacityBusiness?: number;
  capacityFirst?: number;
  totalCapacity?: number;
  registrationNumber?: string;
  mediaPublicIds?: string[];
}

interface AircraftListParams {
  page?: number;
  size?: number;
  search?: string;
}

export class AircraftService {
  private static readonly BASE_PATH = "/api/flights/backoffice/aircraft";

  /**
   * Get aircraft with pagination and filtering
   */
  static async getAircraft(params?: AircraftListParams): Promise<PaginatedResponse<Aircraft>> {
    try {
      const searchParams = new URLSearchParams();

      if (params?.page !== undefined) searchParams.append("page", params.page.toString());
      if (params?.size !== undefined) searchParams.append("size", params.size.toString());
      if (params?.search) searchParams.append("search", params.search);

      const url = `${this.BASE_PATH}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      const response: ApiResponse<any> = await apiClient.get(url);

      // Transform the backend response to match PaginatedResponse structure
      return {
        content: response.data.content || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0,
        size: response.data.pageSize || 0,
        number: response.data.currentPage || 0,
        first: !response.data.hasPrevious,
        last: !response.data.hasNext,
      };
    } catch (error) {
      console.error("Error fetching aircraft:", error);
      throw error;
    }
  }

  /**
   * Get single aircraft by ID
   */
  static async getAircraftById(id: string | number): Promise<Aircraft> {
    try {
      const response: ApiResponse<any> = await apiClient.get(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching aircraft ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new aircraft
   */
  static async createAircraft(aircraft: AircraftCreateRequest): Promise<Aircraft> {
    try {
      const response: ApiResponse<any> = await apiClient.post(this.BASE_PATH, aircraft);
      return response.data;
    } catch (error) {
      console.error("Error creating aircraft:", error);
      throw error;
    }
  }

  /**
   * Update an existing aircraft
   */
  static async updateAircraft(id: string | number, aircraft: AircraftUpdateRequest): Promise<Aircraft> {
    try {
      const response: ApiResponse<any> = await apiClient.put(`${this.BASE_PATH}/${id}`, aircraft);
      return response.data;
    } catch (error) {
      console.error(`Error updating aircraft ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an aircraft
   */
  static async deleteAircraft(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Error deleting aircraft ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search aircraft for autocomplete
   */
  static async searchAircraft(query: string): Promise<any[]> {
    try {
      const response: ApiResponse<any[]> = await apiClient.get(`${this.BASE_PATH}/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Error searching aircraft:", error);
      return [];
    }
  }
}