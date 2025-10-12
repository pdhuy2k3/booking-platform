import type { Airline, PaginatedResponse, ApiResponse } from "@/types/api"
import { apiClient } from "@/lib/api-client"

interface AirlineCreateRequest {
  name: string
  iataCode: string
  country?: string
  mediaPublicIds?: string[] // Array of publicIds from MediaSelector
  featuredMediaUrl?: string | null
}

interface AirlineUpdateRequest {
  name?: string
  iataCode?: string
  country?: string
  mediaPublicIds?: string[] // Array of publicIds from MediaSelector
  featuredMediaUrl?: string | null
}

export class AirlineService {
  private static readonly BASE_PATH = "/api/flights/backoffice/airlines"

  /**
   * Get airlines with pagination and filtering
   */
  static async getAirlines(params?: {
    page?: number
    size?: number
    search?: string
    country?: string
  }): Promise<PaginatedResponse<Airline>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.page !== undefined) searchParams.append("page", params.page.toString())
      if (params?.size !== undefined) searchParams.append("size", params.size.toString())
      if (params?.search) searchParams.append("search", params.search)
      if (params?.country) searchParams.append("country", params.country)

      const url = `${this.BASE_PATH}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
      const response: ApiResponse<any> = await apiClient.get(url)
      
      // Transform only the pagination structure to match PaginatedResponse
      return {
        content: response.data?.content || [],
        totalElements: response.data?.totalElements || 0,
        totalPages: response.data?.totalPages || 0,
        size: response.data?.pageSize || 0,
        number: response.data?.currentPage || 0,
        first: !response.data?.hasPrevious,
        last: !response.data?.hasNext,
      }
    } catch (error) {
      console.error("Error fetching airlines:", error)
      throw error
    }
  }

  /**
   * Get all active airlines for dropdown
   */
  static async getActiveAirlines(): Promise<Airline[]> {
    try {
      const response: ApiResponse<Airline[]> = await apiClient.get(`${this.BASE_PATH}/active`)
      return response.data || []
    } catch (error) {
      console.error("Error fetching active airlines:", error)
      throw error
    }
  }

  /**
   * Get single airline by ID
   */
  static async getAirline(id: string | number): Promise<Airline> {
    try {
      const response: ApiResponse<Airline> = await apiClient.get(`${this.BASE_PATH}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching airline ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new airline
   */
  static async createAirline(airline: AirlineCreateRequest): Promise<Airline> {
    try {
      const response: ApiResponse<Airline> = await apiClient.post(this.BASE_PATH, airline)
      return response.data
    } catch (error) {
      console.error("Error creating airline:", error)
      throw error
    }
  }

  /**
   * Update an existing airline
   */
  static async updateAirline(id: string | number, airline: AirlineUpdateRequest): Promise<Airline> {
    try {
      const response: ApiResponse<Airline> = await apiClient.put(`${this.BASE_PATH}/${id}`, airline)
      return response.data
    } catch (error) {
      console.error(`Error updating airline ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete an airline
   */
  static async deleteAirline(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`)
    } catch (error) {
      console.error(`Error deleting airline ${id}:`, error)
      throw error
    }
  }
}
