export type ID = string

// Hotels
export interface Hotel {
  id: ID
  name: string
  location: string
  rating?: number
  pricePerNight: number
  currency: string
  amenities?: string[]
  images?: string[]
}

export interface HotelSearchParams {
  location: string
  checkIn: string // YYYY-MM-DD
  checkOut: string // YYYY-MM-DD
  guests?: number
  rooms?: number
  minPrice?: number
  maxPrice?: number
}

// Booking
export type BookingItemType = "FLIGHT" | "HOTEL"

export interface BookingItem {
  type: BookingItemType
  referenceId: ID // flight.id or hotel.id
  price: number
  currency: string
  meta?: Record<string, unknown>
}

export interface Traveler {
  firstName: string
  lastName: string
  email: string
}

export interface CreateBookingPayload {
  items: BookingItem[]
  traveler: Traveler
  notes?: string
}

export interface Booking {
  id: ID
  status: "PENDING" | "CONFIRMED" | "CANCELLED"
  total: number
  currency: string
  items: BookingItem[]
  createdAt: string
}
