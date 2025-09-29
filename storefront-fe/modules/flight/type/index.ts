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

export type Flight = {
  id: ID
  airline: string
  flightNumber?: string
  origin: string
  destination: string
  departAt: string // ISO
  arriveAt: string // ISO
  durationMinutes?: number
  price: number
  currency: string
  stops?: number
  cabinClass?: "economy" | "premium_economy" | "business" | "first"
}

export type FareClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"

export type FlightSearchParams = {
  origin: string
  destination: string
  departureDate: string // YYYY-MM-DD
  returnDate?: string // YYYY-MM-DD
  passengers?: number
  seatClass?: FareClass
  sortBy?: string
  airlineId?: number
  departureAirportId?: number
  page?: number // 1-based
  limit?: number
}

// Matches FlightController.convertSearchResultToResponse fields
export type FlightSearchResult = {
  flightId: string
  airline: string
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  departureDateTime?: string
  arrivalDateTime?: string
  duration: string
  durationMinutes?: number
  price: number
  currency: string
  formattedPrice: string
  seatClass: string
  availableSeats: number
  aircraft: string
  airlineLogo?: string
}

export type FlightSearchResponse = {
  flights: FlightSearchResult[]
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
  filters?: Record<string, unknown>
  // Optional fields for initial data
  popularDestinations?: Array<{
    code: string
    name: string
    city: string
    country: string
    image: string
    averagePrice: number
    currency: string
  }>
  origins?: Array<{
    code: string
    name: string
    type: string
  }>
  destinations?: Array<{
    code: string
    name: string
    type: string
  }>
}

export type FlightDetails = {
  flightId: string
  airline: string
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  departureDateTime?: string
  arrivalDateTime?: string
  duration: string
  price: number
  currency: string
  seatClass: string
  availableSeats: number
}

export interface FlightFareDetails {
  fareId: string
  scheduleId: string
  seatClass: string
  price: number | string
  currency: string
  availableSeats: number | null
  departureTime: string
  arrivalTime: string
  flightNumber?: string
  airline?: string
  originAirport?: string
  destinationAirport?: string
  aircraftType?: string
}

// Initial flight data response from /flights/storefront/flights
export type InitialFlightData = {
  flights: FlightSearchResult[]
  popularDestinations: Array<{
    code: string
    name: string
    city: string
    country: string
    image: string
    averagePrice: number
    currency: string
  }>
  origins: Array<{
    code: string
    name: string
    type: string
  }>
  destinations: Array<{
    code: string
    name: string
    type: string
  }>
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
}
