import { apiClient } from "./api-client"
import type { Query } from "./api-client"
import type { Booking, CreateBookingPayload, Hotel, HotelSearchParams } from "./types"

// Re-export apiClient for backward compatibility
export { apiClient } from "./api-client"

// Re-export types
export type { Booking, CreateBookingPayload, Hotel, HotelSearchParams } from "./types"

// Maintain backward compatibility with named exports
export { apiClient as default } from "./api-client"

// Re-export Query type for backward compatibility
export type { Query } from "./api-client"

// Backward compatibility for apiFetch function
export async function apiFetch<T>(path: string, init?: { method?: string; query?: Query; body?: string }): Promise<T> {
  return apiClient.apiFetch<T>(path, init)
}

// Export specific functions for backward compatibility
export async function searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
  return apiClient.searchHotels(params)
}

export async function getHotel(id: string): Promise<Hotel> {
  return apiClient.getHotel(id)
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  return apiClient.createBooking(payload)
}
