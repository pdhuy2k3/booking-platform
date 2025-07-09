import { filterFlights } from "@/lib/mock-data"
import type { Flight, PaginatedResponse } from "@/types/api"

export class FlightService {
  private static readonly BASE_PATH = "/api/flights" // Updated base path

  static async getFlights(params?: {
    page?: number
    size?: number
    search?: string
    status?: string
  }): Promise<PaginatedResponse<Flight>> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay
    return filterFlights(params || {})
  }

  static async getFlight(id: string): Promise<Flight> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500))
    const flights = filterFlights({})
    const flight = flights.content.find((f) => f.id === id)
    if (!flight) throw new Error("Flight not found")
    return flight
  }

  static async createFlight(flight: Omit<Flight, "id" | "createdAt" | "updatedAt">): Promise<Flight> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newFlight: Flight = {
      ...flight,
      id: `FL${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    console.log("Mock: Created flight", newFlight)
    return newFlight
  }

  static async updateFlight(id: string, flight: Partial<Flight>): Promise<Flight> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 800))
    const existingFlight = await this.getFlight(id)
    const updatedFlight = { ...existingFlight, ...flight, updatedAt: new Date().toISOString() }
    console.log("Mock: Updated flight", updatedFlight)
    return updatedFlight
  }

  static async deleteFlight(id: string): Promise<void> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 600))
    console.log("Mock: Deleted flight", id)
  }

  static async updateFlightStatus(id: string, status: Flight["status"]): Promise<Flight> {
    // Mock implementation
    return this.updateFlight(id, { status })
  }
}
