import { FlightSearchRequest, FlightSearchResult } from "@/modules/booking/types"

// Flight-specific types
export interface FlightFilters {
  minPrice?: number
  maxPrice?: number
  airlines?: string[]
  departureTimeRange?: {
    start: string // HH:mm format
    end: string   // HH:mm format
  }
  arrivalTimeRange?: {
    start: string // HH:mm format  
    end: string   // HH:mm format
  }
  maxStops?: number
  maxDuration?: number // in minutes
}

export interface FlightSearchParams extends FlightSearchRequest {
  filters?: FlightFilters
  sortBy?: 'price' | 'duration' | 'departure' | 'arrival'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface FlightSearchResponse {
  flights: FlightSearchResult[]
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
  filters: {
    priceRange: { min: number; max: number }
    airlines: string[]
    airports: {
      origins: Array<{ code: string; name: string; city: string }>
      destinations: Array<{ code: string; name: string; city: string }>
    }
  }
}

export interface FlightDetails extends FlightSearchResult {
  aircraft: string
  terminal: {
    departure: string
    arrival: string
  }
  baggage: {
    cabin: string
    checked: string
  }
  meals: string[]
  entertainment: string[]
  wifi: boolean
  powerOutlets: boolean
  seatMap?: {
    rows: number
    seatsPerRow: number
    availableSeats: string[]
    premiumSeats: string[]
  }
}

export interface PopularDestination {
  code: string
  name: string
  city: string
  country: string
  image: string
  averagePrice: number
  currency: string
}
