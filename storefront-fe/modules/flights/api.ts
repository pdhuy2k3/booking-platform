import { apiClient } from "@/common/api/api-client"
import type {
  FlightSearchParams,
  FlightSearchResponse,
  FlightDetails,
  PopularDestination
} from "./types"

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

// Use real service now that we have populated databases
export const flightService = new FlightService()
