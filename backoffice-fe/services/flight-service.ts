import type { Flight, PaginatedResponse } from "@/types/api"

interface FlightCreateRequest {
  flightNumber: string
  airlineId: number
  departureAirportId: number
  arrivalAirportId: number
  baseDurationMinutes?: number
  aircraftType?: string
  status?: string
  basePrice?: number
}

interface FlightUpdateRequest {
  flightNumber?: string
  airlineId?: number
  departureAirportId?: number
  arrivalAirportId?: number
  baseDurationMinutes?: number
  aircraftType?: string
  status?: string
  basePrice?: number
}

interface FlightStatistics {
  totalFlights: number
  activeFlights: number
  cancelledFlights: number
  delayedFlights: number
  totalAirlines: number
  totalAirports: number
}

export class FlightService {
  private static readonly BASE_PATH = "/api/flights/backoffice/flights"

  /**
   * Get flights with pagination and filtering
   */
  static async getFlights(params?: {
    page?: number
    size?: number
    search?: string
    origin?: string
    destination?: string
    status?: string
  }): Promise<PaginatedResponse<Flight>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.page !== undefined) searchParams.append("page", params.page.toString())
      if (params?.size !== undefined) searchParams.append("size", params.size.toString())
      if (params?.search) searchParams.append("search", params.search)
      if (params?.origin) searchParams.append("origin", params.origin)
      if (params?.destination) searchParams.append("destination", params.destination)
      if (params?.status) searchParams.append("status", params.status)

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
      console.error("Error fetching flights:", error)
      throw error
    }
  }

  /**
   * Get single flight by ID
   */
  static async getFlight(id: string | number): Promise<Flight> {
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
      console.error(`Error fetching flight ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new flight
   */
  static async createFlight(flight: FlightCreateRequest): Promise<Flight> {
    try {
      const response = await fetch(this.BASE_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flight),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating flight:", error)
      throw error
    }
  }

  /**
   * Update an existing flight
   */
  static async updateFlight(id: string | number, flight: FlightUpdateRequest): Promise<Flight> {
    try {
      const response = await fetch(`${this.BASE_PATH}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flight),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error updating flight ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a flight
   */
  static async deleteFlight(id: string | number): Promise<void> {
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
      console.error(`Error deleting flight ${id}:`, error)
      throw error
    }
  }

  /**
   * Update flight status
   */
  static async updateFlightStatus(id: string | number, status: string): Promise<Flight> {
    return this.updateFlight(id, { status })
  }

  /**
   * Get flight statistics
   */
  static async getFlightStatistics(): Promise<FlightStatistics> {
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

      return await response.json()
    } catch (error) {
      console.error("Error fetching flight statistics:", error)
      throw error
    }
  }
}
