export type ID = string

export type HotelSearchParams = {
  destination: string
  checkInDate: string // YYYY-MM-DD
  checkOutDate: string // YYYY-MM-DD
  guests?: number
  rooms?: number
  page?: number // 1-based
  limit?: number
}

export type HotelSearchResult = {
  id: string
  name: string
  address?: string
  city?: string
  country?: string
  starRating?: number
  description?: string
  minPrice?: number
  currency?: string
  availableRooms?: number
  mediaIds?: number[]
}

export type HotelSearchResponse = {
  hotels: HotelSearchResult[]
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
  filters?: Record<string, unknown>
}

export type HotelDetails = {
  id: number | string
  name: string
  address: string
  city: string
  country: string
  starRating: number
  description: string
  isActive: boolean
  availableRooms: number
  minPrice: number
  currency?: string
  amenities?: string[]
  mediaIds?: number[]
}
