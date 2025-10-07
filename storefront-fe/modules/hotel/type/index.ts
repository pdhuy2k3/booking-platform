// Import common types
import type {
  ID,
  DestinationSearchResult,
  SearchResponse,
  ErrorResponse
} from '../../../types/common'

// Re-export common types
export type {
  ID,
  DestinationSearchResult,
  SearchResponse,
  ErrorResponse
}

export type HotelSearchParams = {
  destination: string
  checkInDate: string // YYYY-MM-DD
  checkOutDate: string // YYYY-MM-DD
  guests?: number
  rooms?: number
  page?: number // 1-based
  limit?: number
}

// Matches HotelController.convertHotelToResponse fields
export type HotelSearchResult = {
  hotelId: string
  name: string
  address: string
  city: string
  rating: number
  pricePerNight: number
  currency: string
  availableRooms: Array<{
    roomTypeId?: string
    roomId: string
    roomType: string
    capacity: number
    pricePerNight: number
    amenities: string[]
    available: boolean
  }>
  amenities: string[]
  images: string[]
  primaryImage?: string
  latitude?: number
  longitude?: number
}

export type HotelSearchResponse = {
  hotels: HotelSearchResult[]
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
  filters?: Record<string, unknown>
  // Optional fields for initial data
  popularDestinations?: Array<{
    code: string
    name: string
    country: string
    image: string
    averagePrice: number
    currency: string
    hotelCount: number
  }>
  cities?: Array<{
    code: string
    name: string
    type: string
    country: string
  }>
}

// Initial hotel data response from /hotels/storefront/hotels
export type InitialHotelData = {
  hotels: HotelSearchResult[]
  popularDestinations: Array<{
    code: string
    name: string
    country: string
    image: string
    averagePrice: number
    currency: string
    hotelCount: number
  }>
  cities: Array<{
    code: string
    name: string
    type: string
    country: string
  }>
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
}

export type HotelDetails = {
  hotelId: string
  name: string
  address: string
  city: string
  country: string
  rating: number
  starRating: number
  description: string
  pricePerNight: number
  currency: string
  availableRooms: Array<{
    roomId: string
    roomType: string
    capacity: number
    pricePerNight: number
    amenities: string[]
    available: boolean
  }>
  roomTypes: Array<{
    id: string
    name: string
    description?: string
    capacityAdults?: number
    basePrice: number
    features: string[]
    image: string
  }>
  amenities: string[]
  images: string[]
  primaryImage?: string
  checkInTime: string
  checkOutTime: string
  policies: {
    cancellation: string
    children: string
    pets: string
    smoking: string
  }
  latitude?: number
  longitude?: number
}

export interface RoomDetails {
  id: number
  hotelId: number
  hotelName: string
  roomNumber: string
  description?: string
  price?: number | string
  maxOccupancy?: number
  bedType?: string
  roomSize?: number
  isAvailable?: boolean
  roomType?: {
    id?: number
    name?: string
    description?: string
  }
  amenities?: Array<{
    amenityId?: number
    name?: string
    description?: string
  }>
  media?: Array<{ id?: string; url?: string; [key: string]: any }>
  primaryImage?: { id?: string; url?: string; [key: string]: any }
  hasMedia?: boolean
  mediaCount?: number
  createdAt?: string
  updatedAt?: string
}
