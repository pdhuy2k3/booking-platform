import type { Airport, PaginatedResponse } from "@/types/api"

interface AirportCreateRequest {
  name: string
  code: string
  city: string
  country: string
  timezone?: string
  images?: string[] // Array of publicIds from MediaSelector
}

interface AirportUpdateRequest {
  name?: string
  code?: string
  city?: string
  country?: string
  timezone?: string
  images?: string[] // Array of publicIds from MediaSelector
}

export class AirportService {
  private static readonly BASE_PATH = "/api/flights/backoffice/airports"

  /**
   * Get airports with pagination and filtering
   */
  static async getAirports(params?: {
    page?: number
    size?: number
    search?: string
    city?: string
    country?: string
  }): Promise<PaginatedResponse<Airport>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.page !== undefined) searchParams.append("page", params.page.toString())
      if (params?.size !== undefined) searchParams.append("size", params.size.toString())
      if (params?.search) searchParams.append("search", params.search)
      if (params?.city) searchParams.append("city", params.city)
      if (params?.country) searchParams.append("country", params.country)

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

      return await response.json()
    } catch (error) {
      console.error("Error fetching airports:", error)
      throw error
    }
  }

  /**
   * Get all active airports for dropdown
   */
  static async getActiveAirports(): Promise<Airport[]> {
    try {
      const response = await fetch(`${this.BASE_PATH}/active`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching active airports:", error)
      throw error
    }
  }

  /**
   * Get single airport by ID
   */
  static async getAirport(id: string | number): Promise<Airport> {
    try {
      const response = await fetch(`${this.BASE_PATH}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error fetching airport ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new airport
   */
  static async createAirport(airport: AirportCreateRequest): Promise<Airport> {
    try {
      const response = await fetch(this.BASE_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(airport),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating airport:", error)
      throw error
    }
  }

  /**
   * Update an existing airport
   */
  static async updateAirport(id: string | number, airport: AirportUpdateRequest): Promise<Airport> {
    try {
      const response = await fetch(`${this.BASE_PATH}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(airport),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error updating airport ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete an airport
   */
  static async deleteAirport(id: string | number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_PATH}/${id}`, {
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
      console.error(`Error deleting airport ${id}:`, error)
      throw error
    }
  }
}
