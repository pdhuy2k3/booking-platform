import { apiClient } from "./api-client"
import type {
  FlightSearchRequest,
  FlightSearchResult,
} from "@/types/booking"

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

export class FlightService {
  // Search flights with advanced filtering and pagination
  static async searchFlights(params: FlightSearchParams): Promise<FlightSearchResponse> {
    const queryParams = apiClient.buildQueryParams({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      passengers: params.passengers,
      seatClass: params.seatClass,
      // Filters
      minPrice: params.filters?.minPrice,
      maxPrice: params.filters?.maxPrice,
      airlines: params.filters?.airlines,
      departureTimeStart: params.filters?.departureTimeRange?.start,
      departureTimeEnd: params.filters?.departureTimeRange?.end,
      arrivalTimeStart: params.filters?.arrivalTimeRange?.start,
      arrivalTimeEnd: params.filters?.arrivalTimeRange?.end,
      maxStops: params.filters?.maxStops,
      maxDuration: params.filters?.maxDuration,
      // Sorting and pagination
      sortBy: params.sortBy || 'price',
      sortOrder: params.sortOrder || 'asc',
      page: params.page || 1,
      limit: params.limit || 20
    })

    return apiClient.get<FlightSearchResponse>(`/api/flights/storefront/search?${queryParams}`)
  }

  // Get detailed flight information
  static async getFlightDetails(flightId: string): Promise<FlightDetails> {
    return apiClient.get<FlightDetails>(`/api/flights/storefront/${flightId}`)
  }

  // Get popular destinations
  static async getPopularDestinations(origin?: string): Promise<PopularDestination[]> {
    const queryParams = origin ? `?origin=${origin}` : ''
    return apiClient.get<PopularDestination[]>(`/api/flights/storefront/popular-destinations${queryParams}`)
  }

  // Get flight price calendar (for flexible date search)
  static async getPriceCalendar(
    origin: string,
    destination: string,
    month: string, // YYYY-MM format
    seatClass: string = 'ECONOMY'
  ): Promise<Array<{ date: string; price: number; available: boolean }>> {
    const queryParams = apiClient.buildQueryParams({
      origin,
      destination,
      month,
      seatClass
    })

    return apiClient.get(`/api/flights/storefront/price-calendar?${queryParams}`)
  }

  // Get available airports for autocomplete
  static async searchAirports(query: string): Promise<Array<{
    code: string
    name: string
    city: string
    country: string
  }>> {
    return apiClient.get(`/api/flights/storefront/airports/search?q=${encodeURIComponent(query)}`)
  }

  // Get flight seat map
  static async getSeatMap(flightId: string): Promise<{
    aircraft: string
    rows: number
    seatsPerRow: number
    seatMap: Array<{
      row: number
      seats: Array<{
        seatNumber: string
        type: 'economy' | 'premium' | 'business' | 'first'
        status: 'available' | 'occupied' | 'selected'
        price?: number
      }>
    }>
  }> {
    return apiClient.get(`/api/flights/storefront/${flightId}/seat-map`)
  }

  // Reserve flight seats (temporary hold)
  static async reserveSeats(flightId: string, seats: string[], holdDuration: number = 15): Promise<{
    reservationId: string
    expiresAt: string
    seats: string[]
  }> {
    return apiClient.post(`/api/flights/storefront/${flightId}/reserve-seats`, {
      seats,
      holdDuration
    })
  }

  // Release seat reservation
  static async releaseSeatReservation(reservationId: string): Promise<void> {
    return apiClient.delete(`/api/flights/storefront/reservations/${reservationId}`)
  }

  // Get flight status
  static async getFlightStatus(flightNumber: string, date: string): Promise<{
    flightNumber: string
    date: string
    status: 'ON_TIME' | 'DELAYED' | 'CANCELLED' | 'BOARDING' | 'DEPARTED' | 'ARRIVED'
    scheduledDeparture: string
    actualDeparture?: string
    scheduledArrival: string
    actualArrival?: string
    gate?: string
    terminal?: string
    delay?: number // in minutes
  }> {
    const queryParams = apiClient.buildQueryParams({ date })
    return apiClient.get(`/api/flights/storefront/status/${flightNumber}?${queryParams}`)
  }

  // Get baggage information
  static async getBaggageInfo(flightId: string): Promise<{
    cabin: {
      weight: string
      dimensions: string
      restrictions: string[]
    }
    checked: Array<{
      weight: string
      price: number
      currency: string
    }>
    specialBaggage: Array<{
      type: string
      description: string
      price: number
      currency: string
    }>
  }> {
    return apiClient.get(`/api/flights/storefront/${flightId}/baggage`)
  }

  // Get meal options
  static async getMealOptions(flightId: string): Promise<Array<{
    id: string
    name: string
    description: string
    type: 'regular' | 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'special'
    price: number
    currency: string
    image?: string
  }>> {
    return apiClient.get(`/api/flights/storefront/${flightId}/meals`)
  }

  // Book additional services
  static async bookAdditionalServices(flightId: string, services: {
    extraBaggage?: Array<{ weight: string; quantity: number }>
    meals?: Array<{ mealId: string; passengerIndex: number }>
    seats?: Array<{ seatNumber: string; passengerIndex: number }>
    insurance?: boolean
    lounge?: boolean
    fastTrack?: boolean
  }): Promise<{
    serviceBookingId: string
    totalPrice: number
    currency: string
    services: Array<{
      type: string
      description: string
      price: number
    }>
  }> {
    return apiClient.post(`/api/flights/storefront/${flightId}/services`, services)
  }
}

// Mock service for development
class MockFlightService {
  static async searchFlights(params: FlightSearchParams): Promise<FlightSearchResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const mockFlights: FlightSearchResult[] = [
      {
        flightId: "VN123",
        airline: "Vietnam Airlines",
        flightNumber: "VN123",
        origin: params.origin,
        destination: params.destination,
        departureTime: "08:00",
        arrivalTime: "10:30",
        duration: "2h 30m",
        price: 2500000,
        currency: "VND",
        seatClass: params.seatClass,
        availableSeats: 45
      },
      {
        flightId: "VJ456",
        airline: "VietJet Air",
        flightNumber: "VJ456",
        origin: params.origin,
        destination: params.destination,
        departureTime: "14:15",
        arrivalTime: "16:45",
        duration: "2h 30m",
        price: 1800000,
        currency: "VND",
        seatClass: params.seatClass,
        availableSeats: 23
      },
      {
        flightId: "QH789",
        airline: "Bamboo Airways",
        flightNumber: "QH789",
        origin: params.origin,
        destination: params.destination,
        departureTime: "18:30",
        arrivalTime: "21:00",
        duration: "2h 30m",
        price: 2200000,
        currency: "VND",
        seatClass: params.seatClass,
        availableSeats: 67
      }
    ]

    return {
      flights: mockFlights,
      totalCount: mockFlights.length,
      page: params.page || 1,
      limit: params.limit || 20,
      hasMore: false,
      filters: {
        priceRange: { min: 1800000, max: 2500000 },
        airlines: ["Vietnam Airlines", "VietJet Air", "Bamboo Airways"],
        airports: {
          origins: [{ code: "HAN", name: "Noi Bai International Airport", city: "Hanoi" }],
          destinations: [{ code: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City" }]
        }
      }
    }
  }

  static async getPopularDestinations(): Promise<PopularDestination[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        code: "SGN",
        name: "Tan Son Nhat International Airport",
        city: "Ho Chi Minh City",
        country: "Vietnam",
        image: "/destinations/hcmc.jpg",
        averagePrice: 2200000,
        currency: "VND"
      },
      {
        code: "DAD",
        name: "Da Nang International Airport", 
        city: "Da Nang",
        country: "Vietnam",
        image: "/destinations/danang.jpg",
        averagePrice: 1800000,
        currency: "VND"
      }
    ]
  }
}

// Use real service now that we have populated databases
export const flightService = FlightService

// Keep mock service available for testing if needed
export { MockFlightService }
