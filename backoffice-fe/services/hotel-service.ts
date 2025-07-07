import { filterHotels } from "@/lib/mock-data"
import type { Hotel, PaginatedResponse } from "@/types/api"

export class HotelService {
  private static readonly BASE_PATH = "/api/hotels" // vẫn giữ cho future API

  static async getHotels(params?: {
    page?: number
    size?: number
    search?: string
    city?: string
    status?: string
  }): Promise<PaginatedResponse<Hotel>> {
    // Mock implementation
    await new Promise((r) => setTimeout(r, 700))
    return filterHotels(params || {})
  }

  static async getHotel(id: string): Promise<Hotel> {
    await new Promise((r) => setTimeout(r, 500))
    const hotels = filterHotels({})
    const hotel = hotels.content.find((h) => h.id === id)
    if (!hotel) throw new Error("Hotel not found")
    return hotel
  }

  static async createHotel(hotel: Omit<Hotel, "id" | "createdAt" | "updatedAt">): Promise<Hotel> {
    await new Promise((r) => setTimeout(r, 1000))
    const newHotel: Hotel = {
      ...hotel,
      id: `HT${Date.now()}`,
      status: "ACTIVE",
      rating: hotel.rating || 0,
      rooms: hotel.rooms || [],
      images: hotel.images || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    console.log("Mock: Created hotel", newHotel)
    return newHotel
  }

  static async updateHotel(id: string, hotel: Partial<Hotel>): Promise<Hotel> {
    await new Promise((r) => setTimeout(r, 800))
    const existing = await this.getHotel(id)
    const updated = { ...existing, ...hotel, updatedAt: new Date().toISOString() }
    console.log("Mock: Updated hotel", updated)
    return updated
  }

  static async deleteHotel(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 600))
    console.log("Mock: Deleted hotel", id)
  }
}
