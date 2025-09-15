export type ID = string

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
  duration: string
  price: number
  currency: string
  formattedPrice: string
  seatClass: string
  availableSeats: number
  aircraft: string
}

export type FlightSearchResponse = {
  flights: FlightSearchResult[]
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
  filters?: Record<string, unknown>
}

export type FlightDetails = {
  flightId: string
  airline: string
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  currency: string
  seatClass: string
  availableSeats: number
}
