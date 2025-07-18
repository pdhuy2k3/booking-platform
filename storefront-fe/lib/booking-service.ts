import { apiClient } from "./api-client"
import type {
  CreateBookingRequest,
  BookingResponse,
  BookingDetails,
  FlightSearchRequest,
  FlightSearchResult,
  HotelSearchRequest,
  HotelSearchResult
} from "@/types/booking"

export class BookingService {
  // Booking Management
  static async createBooking(request: CreateBookingRequest): Promise<BookingResponse> {
    return apiClient.post<BookingResponse>("/api/bookings/storefront", request)
  }

  static async getBooking(bookingId: string): Promise<BookingDetails> {
    return apiClient.get<BookingDetails>(`/api/bookings/storefront/${bookingId}`)
  }

  static async getBookingBySaga(sagaId: string): Promise<BookingDetails> {
    return apiClient.get<BookingDetails>(`/api/bookings/storefront/saga/${sagaId}`)
  }

  static async getUserBookings(userId: string): Promise<BookingResponse[]> {
    return apiClient.get<BookingResponse[]>(`/api/bookings/storefront/user/${userId}`)
  }

  static async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    return apiClient.delete(`/api/bookings/storefront/${bookingId}`, {
      data: { reason }
    })
  }

  static async getBookingHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{
    bookings: BookingResponse[]
    totalCount: number
    page: number
    limit: number
    hasMore: boolean
  }> {
    const queryParams = apiClient.buildQueryParams({
      page,
      limit,
      status
    })

    return apiClient.get(`/api/bookings/storefront/user/${userId}/history?${queryParams}`)
  }

  // Flight Search and Booking (delegated to FlightService)
  static async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResult[]> {
    const queryParams = apiClient.buildQueryParams({
      origin: request.origin,
      destination: request.destination,
      departureDate: request.departureDate,
      returnDate: request.returnDate,
      passengers: request.passengers,
      seatClass: request.seatClass
    })

    const response = await apiClient.get<{
      flights: FlightSearchResult[]
      totalCount: number
      page: number
      limit: number
      hasMore: boolean
    }>(`/api/flights/storefront/search?${queryParams}`)

    // Extract flights array from nested response
    return response.flights || []
  }

  static async getFlightDetails(flightId: string): Promise<FlightSearchResult> {
    return apiClient.get<FlightSearchResult>(`/api/flights/storefront/${flightId}`)
  }

  // Hotel Search and Booking (delegated to HotelService)
  static async searchHotels(request: HotelSearchRequest): Promise<HotelSearchResult[]> {
    const queryParams = apiClient.buildQueryParams({
      destination: request.destination,
      checkInDate: request.checkInDate,
      checkOutDate: request.checkOutDate,
      guests: request.guests,
      rooms: request.rooms
    })

    const response = await apiClient.get<{
      hotels: HotelSearchResult[]
      totalCount: number
      page: number
      limit: number
      hasMore: boolean
    }>(`/api/hotels/storefront/search?${queryParams}`)

    // Extract hotels array from nested response
    return response.hotels || []
  }

  static async getHotelDetails(hotelId: string): Promise<HotelSearchResult> {
    return apiClient.get<HotelSearchResult>(`/api/hotels/storefront/${hotelId}`)
  }

  static async getHotelRooms(hotelId: string, checkInDate: string, checkOutDate: string): Promise<any[]> {
    const queryParams = apiClient.buildQueryParams({
      checkInDate,
      checkOutDate
    })

    return apiClient.get<any[]>(`/api/hotels/storefront/${hotelId}/rooms?${queryParams}`)
  }
}

// Mock data for development/testing
class MockBookingService {
  static async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return [
      {
        flightId: "VN123",
        airline: "Vietnam Airlines",
        flightNumber: "VN123",
        origin: request.origin,
        destination: request.destination,
        departureTime: "08:00",
        arrivalTime: "10:30",
        duration: "2h 30m",
        price: 2500000,
        currency: "VND",
        seatClass: request.seatClass,
        availableSeats: 45
      },
      {
        flightId: "VJ456",
        airline: "VietJet Air",
        flightNumber: "VJ456", 
        origin: request.origin,
        destination: request.destination,
        departureTime: "14:15",
        arrivalTime: "16:45",
        duration: "2h 30m",
        price: 1800000,
        currency: "VND",
        seatClass: request.seatClass,
        availableSeats: 23
      }
    ]
  }

  static async searchHotels(request: HotelSearchRequest): Promise<HotelSearchResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    return [
      {
        hotelId: "hotel-1",
        name: "Grand Hotel Saigon",
        address: "8 Dong Khoi Street, District 1",
        city: request.destination,
        rating: 5,
        pricePerNight: 3500000,
        currency: "VND",
        availableRooms: [
          {
            roomId: "deluxe-1",
            roomType: "Deluxe Room",
            capacity: 2,
            pricePerNight: 3500000,
            amenities: ["WiFi", "Air Conditioning", "Mini Bar"],
            available: true
          },
          {
            roomId: "suite-1", 
            roomType: "Executive Suite",
            capacity: 4,
            pricePerNight: 6500000,
            amenities: ["WiFi", "Air Conditioning", "Mini Bar", "Living Room"],
            available: true
          }
        ],
        amenities: ["Pool", "Spa", "Gym", "Restaurant"],
        images: ["/hotel-1.jpg", "/hotel-1-room.jpg"]
      },
      {
        hotelId: "hotel-2",
        name: "Riverside Hotel",
        address: "15 Nguyen Hue Boulevard, District 1", 
        city: request.destination,
        rating: 4,
        pricePerNight: 2200000,
        currency: "VND",
        availableRooms: [
          {
            roomId: "standard-1",
            roomType: "Standard Room",
            capacity: 2,
            pricePerNight: 2200000,
            amenities: ["WiFi", "Air Conditioning"],
            available: true
          }
        ],
        amenities: ["Restaurant", "Bar", "WiFi"],
        images: ["/hotel-2.jpg"]
      }
    ]
  }

  static async createBooking(request: CreateBookingRequest): Promise<BookingResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    return {
      bookingId: `booking-${Date.now()}`,
      bookingReference: `BK${Date.now()}`,
      sagaId: `saga-${Date.now()}`,
      status: "PENDING" as any,
      sagaState: "BOOKING_INITIATED" as any,
      totalAmount: request.totalAmount,
      currency: request.currency || "VND",
      bookingType: request.bookingType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
}

// Use real service now that we have populated databases
export const bookingService = BookingService

// Keep mock service available for testing if needed
export { MockBookingService }
