import { HotelSearchRequest, HotelSearchResult, RoomInfo } from "@/modules/booking/types"

// Hotel-specific types
export interface HotelFilters {
  minPrice?: number
  maxPrice?: number
  starRating?: number[]
  amenities?: string[]
  propertyTypes?: string[]
  distanceFromCenter?: number // in km
  guestRating?: number // minimum rating
  freeCancellation?: boolean
  breakfastIncluded?: boolean
}

export interface HotelSearchParams extends HotelSearchRequest {
  filters?: HotelFilters
  sortBy?: 'price' | 'rating' | 'distance' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface HotelSearchResponse {
  hotels: HotelSearchResult[]
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
  filters: {
    priceRange: { min: number; max: number }
    starRatings: number[]
    amenities: string[]
    propertyTypes: string[]
    neighborhoods: string[]
  }
}

export interface HotelDetails extends HotelSearchResult {
  description: string
  checkInTime: string
  checkOutTime: string
  policies: {
    cancellation: string
    children: string
    pets: string
    smoking: string
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  location: {
    latitude: number
    longitude: number
    neighborhood: string
    landmarks: Array<{
      name: string
      distance: number
      type: 'airport' | 'attraction' | 'transport' | 'shopping' | 'restaurant'
    }>
  }
  facilities: Array<{
    category: string
    items: string[]
  }>
  reviews: {
    overall: number
    totalReviews: number
    breakdown: {
      cleanliness: number
      comfort: number
      location: number
      service: number
      value: number
    }
    recent: Array<{
      id: string
      guestName: string
      rating: number
      comment: string
      date: string
      roomType: string
    }>
  }
}

export interface RoomDetails extends RoomInfo {
  description: string
  images: string[]
  bedTypes: Array<{
    type: string
    count: number
  }>
  roomSize: number // in sqm
  maxOccupancy: number
  facilities: string[]
  policies: {
    cancellation: string
    prepayment: string
    modifications: string
  }
  rateDetails: {
    baseRate: number
    taxes: number
    fees: number
    totalRate: number
    currency: string
    breakdown: Array<{
      description: string
      amount: number
    }>
  }
}

export interface PopularDestination {
  city: string
  country: string
  image: string
  hotelCount: number
  averagePrice: number
  currency: string
  description: string
}
