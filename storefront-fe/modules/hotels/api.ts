import { apiClient } from "@/common/api/api-client"
import type {
  HotelSearchParams,
  HotelSearchResponse,
  HotelDetails,
  RoomDetails,
  PopularDestination
} from "./types"

export class HotelService {
  // Search hotels with advanced filtering and pagination
  static async searchHotels(params: HotelSearchParams): Promise<HotelSearchResponse> {
    const queryParams = apiClient.buildQueryParams({
      destination: params.destination,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      guests: params.guests,
      rooms: params.rooms,
      // Filters
      minPrice: params.filters?.minPrice,
      maxPrice: params.filters?.maxPrice,
      starRating: params.filters?.starRating,
      amenities: params.filters?.amenities,
      propertyTypes: params.filters?.propertyTypes,
      distanceFromCenter: params.filters?.distanceFromCenter,
      guestRating: params.filters?.guestRating,
      freeCancellation: params.filters?.freeCancellation,
      breakfastIncluded: params.filters?.breakfastIncluded,
      // Sorting and pagination
      sortBy: params.sortBy || 'price',
      sortOrder: params.sortOrder || 'asc',
      page: params.page || 1,
      limit: params.limit || 20
    })

    return apiClient.get<HotelSearchResponse>(`/api/hotels/storefront/search?${queryParams}`)
  }

  // Get detailed hotel information
  static async getHotelDetails(hotelId: string): Promise<HotelDetails> {
    return apiClient.get<HotelDetails>(`/api/hotels/storefront/${hotelId}`)
  }

  // Get available rooms for specific dates
  static async getHotelRooms(
    hotelId: string,
    checkInDate: string,
    checkOutDate: string,
    guests: number = 2,
    rooms: number = 1
  ): Promise<RoomDetails[]> {
    const queryParams = apiClient.buildQueryParams({
      checkInDate,
      checkOutDate,
      guests,
      rooms
    })

    return apiClient.get<RoomDetails[]>(`/api/hotels/storefront/${hotelId}/rooms?${queryParams}`)
  }

  // Get room details
  static async getRoomDetails(hotelId: string, roomId: string): Promise<RoomDetails> {
    return apiClient.get<RoomDetails>(`/api/hotels/storefront/${hotelId}/rooms/${roomId}`)
  }

  // Get popular destinations
  static async getPopularDestinations(): Promise<PopularDestination[]> {
    return apiClient.get<PopularDestination[]>('/api/hotels/storefront/popular-destinations')
  }

  // Search destinations for autocomplete
  static async searchDestinations(query: string): Promise<Array<{
    type: 'city' | 'hotel' | 'landmark' | 'airport'
    name: string
    description: string
    country: string
    region?: string
  }>> {
    return apiClient.get(`/api/hotels/storefront/destinations/search?q=${encodeURIComponent(query)}`)
  }

  // Get hotel availability calendar
  static async getAvailabilityCalendar(
    hotelId: string,
    month: string, // YYYY-MM format
    guests: number = 2,
    rooms: number = 1
  ): Promise<Array<{
    date: string
    available: boolean
    minPrice?: number
    maxPrice?: number
    currency: string
  }>> {
    const queryParams = apiClient.buildQueryParams({
      month,
      guests,
      rooms
    })

    return apiClient.get(`/api/hotels/storefront/${hotelId}/availability?${queryParams}`)
  }

  // Reserve hotel room (temporary hold)
  static async reserveRoom(
    hotelId: string,
    roomId: string,
    checkInDate: string,
    checkOutDate: string,
    guests: number,
    holdDuration: number = 15
  ): Promise<{
    reservationId: string
    expiresAt: string
    hotelId: string
    roomId: string
    totalPrice: number
    currency: string
  }> {
    return apiClient.post(`/api/hotels/storefront/${hotelId}/rooms/${roomId}/reserve`, {
      checkInDate,
      checkOutDate,
      guests,
      holdDuration
    })
  }

  // Release room reservation
  static async releaseRoomReservation(reservationId: string): Promise<void> {
    return apiClient.delete(`/api/hotels/storefront/reservations/${reservationId}`)
  }

  // Get hotel reviews
  static async getHotelReviews(
    hotelId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'date' | 'rating' = 'date'
  ): Promise<{
    reviews: Array<{
      id: string
      guestName: string
      rating: number
      title: string
      comment: string
      date: string
      roomType: string
      stayDuration: number
      helpful: number
      verified: boolean
    }>
    totalCount: number
    averageRating: number
    ratingBreakdown: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }> {
    const queryParams = apiClient.buildQueryParams({
      page,
      limit,
      sortBy
    })

    return apiClient.get(`/api/hotels/storefront/${hotelId}/reviews?${queryParams}`)
  }

  // Get hotel amenities
  static async getHotelAmenities(hotelId: string): Promise<{
    general: string[]
    room: string[]
    bathroom: string[]
    kitchen: string[]
    entertainment: string[]
    business: string[]
    wellness: string[]
    transport: string[]
    accessibility: string[]
  }> {
    return apiClient.get(`/api/hotels/storefront/${hotelId}/amenities`)
  }

  // Get nearby attractions
  static async getNearbyAttractions(
    hotelId: string,
    radius: number = 5 // km
  ): Promise<Array<{
    name: string
    type: 'restaurant' | 'attraction' | 'shopping' | 'transport' | 'entertainment'
    distance: number
    rating?: number
    description: string
    image?: string
    walkingTime?: number
  }>> {
    const queryParams = apiClient.buildQueryParams({ radius })
    return apiClient.get(`/api/hotels/storefront/${hotelId}/nearby?${queryParams}`)
  }

  // Book additional services
  static async bookAdditionalServices(hotelId: string, services: {
    earlyCheckIn?: boolean
    lateCheckOut?: boolean
    airportTransfer?: {
      type: 'pickup' | 'dropoff' | 'both'
      flightDetails: string
    }
    spa?: Array<{
      serviceId: string
      date: string
      time: string
    }>
    dining?: Array<{
      restaurantId: string
      date: string
      time: string
      guests: number
    }>
    tours?: Array<{
      tourId: string
      date: string
      participants: number
    }>
  }): Promise<{
    serviceBookingId: string
    totalPrice: number
    currency: string
    services: Array<{
      type: string
      description: string
      price: number
      date?: string
      time?: string
    }>
  }> {
    return apiClient.post(`/api/hotels/storefront/${hotelId}/services`, services)
  }
}

// Use real service now that we have populated databases
export const hotelService = new HotelService()
