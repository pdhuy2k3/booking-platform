import type { Airline, PaginatedResponse } from "@/types/api"

interface AirlineCreateRequest {
  name: string
  code: string
  country?: string
  images?: string[] // Array of publicIds from MediaSelector
}

interface AirlineUpdateRequest {
  name?: string
  code?: string
  country?: string
  images?: string[] // Array of publicIds from MediaSelector
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
      console.error("Error fetching airlines:", error)
      throw error
    }
  }

  /**
   * Get all active airlines for dropdown
   */
  static async getActiveAirlines(): Promise<Airline[]> {
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
      console.error("Error fetching active airlines:", error)
      throw error
    }
  }

  /**
   * Get single airline by ID
   */
  static async getAirline(id: string | number): Promise<Airline> {
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
      console.error(`Error fetching airline ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new airline
   */
  static async createAirline(airline: AirlineCreateRequest): Promise<Airline> {
    try {
      const response = await fetch(this.BASE_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(airline),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
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
      const response = await fetch(`${this.BASE_PATH}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(airline),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
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
      console.error(`Error deleting airline ${id}:`, error)
      throw error
    }
  }
}
