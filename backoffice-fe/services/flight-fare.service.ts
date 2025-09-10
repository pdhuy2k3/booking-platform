import type { FlightFare, FlightFareCreateRequest, FlightFareUpdateRequest, PaginatedResponse, ApiResponse } from "@/types/api"

export interface FlightFareListParams {
  page?: number
  size?: number
  scheduleId?: string
  fareClass?: string
}

export interface FlightFareStatistics {
  totalActiveFares: number
  averagePrice: number
  faresByClass: Record<string, number>
  totalAvailableSeats: number
}

export class FlightFareService {
  private static readonly BASE_PATH = "/api/backoffice/flight-fares"

  /**
   * Get flight fares with pagination and filtering
   */
  static async getFlightFares(params?: FlightFareListParams): Promise<PaginatedResponse<FlightFare>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.page !== undefined) searchParams.append("page", params.page.toString())
      if (params?.size !== undefined) searchParams.append("size", params.size.toString())
      if (params?.scheduleId) searchParams.append("scheduleId", params.scheduleId)
      if (params?.fareClass) searchParams.append("fareClass", params.fareClass)

      const url = `${this.BASE_PATH}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const apiResponse: ApiResponse<any> = await response.json()
      
      // Transform the backend response to match PaginatedResponse structure
      return {
        content: apiResponse.data.content,
        totalElements: apiResponse.data.totalElements,
        totalPages: apiResponse.data.totalPages,
        size: apiResponse.data.size,
        number: apiResponse.data.page,
        first: apiResponse.data.first,
        last: apiResponse.data.last,
      }
    } catch (error) {
      console.error("Error fetching flight fares:", error)
      throw error
    }
  }

  /**
   * Get flight fare by ID
   */
  static async getFlightFareById(fareId: string): Promise<FlightFare> {
    try {
      const response = await fetch(`${this.BASE_PATH}/${fareId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const apiResponse: ApiResponse<FlightFare> = await response.json()
      return apiResponse.data
    } catch (error) {
      console.error("Error fetching flight fare:", error)
      throw error
    }
  }

  /**
   * Create a new flight fare
   */
  static async createFlightFare(data: FlightFareCreateRequest): Promise<FlightFare> {
    try {
      const response = await fetch(this.BASE_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const apiResponse: ApiResponse<FlightFare> = await response.json()
      return apiResponse.data
    } catch (error) {
      console.error("Error creating flight fare:", error)
      throw error
    }
  }

  /**
   * Update an existing flight fare
   */
  static async updateFlightFare(fareId: string, data: FlightFareUpdateRequest): Promise<FlightFare> {
    try {
      const response = await fetch(`${this.BASE_PATH}/${fareId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const apiResponse: ApiResponse<FlightFare> = await response.json()
      return apiResponse.data
    } catch (error) {
      console.error("Error updating flight fare:", error)
      throw error
    }
  }

  /**
   * Delete a flight fare
   */
  static async deleteFlightFare(fareId: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_PATH}/${fareId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error deleting flight fare:", error)
      throw error
    }
  }

  /**
   * Get flight fare statistics
   */
  static async getFlightFareStatistics(): Promise<FlightFareStatistics> {
    try {
      const response = await fetch(`${this.BASE_PATH}/statistics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const apiResponse: ApiResponse<FlightFareStatistics> = await response.json()
      return apiResponse.data
    } catch (error) {
      console.error("Error fetching flight fare statistics:", error)
      throw error
    }
  }
}
