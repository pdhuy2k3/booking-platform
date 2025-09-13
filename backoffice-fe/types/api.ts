export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface MediaResponse {
  id: number
  mediaId: number
  publicId: string
  url: string
  secureUrl: string
  isPrimary: boolean
  displayOrder: number
}

export interface Aircraft {
  aircraftId: number
  model: string
  manufacturer?: string
  capacityEconomy?: number
  capacityBusiness?: number
  capacityFirst?: number
  totalCapacity?: number
  registrationNumber?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  media?: MediaResponse[]     // For creating/updating aircraft - complete media info
}

export interface Airline {
  airlineId: number
  name: string
  iataCode: string
  country?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  images?: string[]     // Array of image URLs/IDs from backend
  totalFlights?: number
  activeFlights?: number
  totalRoutes?: number
  status?: string
}

export interface Airport {
  airportId: number
  name: string
  iataCode: string
  city: string
  country: string
  timezone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  media?: MediaResponse[]     // For creating/updating airports - complete media info
}

export interface Flight {
  id?: number
  flightId?: number
  flightNumber: string
  airline?: Airline
  airlineId?: number
  airlineName?: string
  airlineIataCode?: string
  departureAirport?: Airport
  departureAirportId?: number
  departureAirportName?: string
  departureAirportIataCode?: string
  departureAirportCity?: string
  departureAirportCountry?: string
  arrivalAirport?: Airport
  arrivalAirportId?: number
  arrivalAirportName?: string
  arrivalAirportIataCode?: string
  arrivalAirportCity?: string
  arrivalAirportCountry?: string
  aircraftType?: string
  aircraft?: Aircraft
  status?: "ACTIVE" | "CANCELLED" | "DELAYED" | "ON_TIME" | "SCHEDULED"
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  // Note: schedules array intentionally omitted to prevent circular references
  schedules?: FlightSchedule[]  // Only include when specifically needed
  fares?: FlightFare[]
  totalSchedules?: number
  activeSchedules?: number
  totalBookings?: number
  images?: string[]
  primaryImage?: string
  hasMedia?: boolean
  mediaCount?: number
  media?: MediaResponse[]     // For creating/updating flights - complete media info
}

export interface Hotel {
  id: number
  name: string
  description: string
  address: string
  city: string
  country: string
  starRating: number
  availableRooms: number
  minPrice: number
  maxPrice?: number
  averageRating?: number
  totalReviews?: number
  amenities?: Amenity[]
  media?: MediaResponse[]     // For creating/updating hotels - complete media info
  latitude?: number
  longitude?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface HotelDetails extends Hotel {
  rooms: Room[]
}

export interface RoomType {
  id: number
  name: string
  description: string
  capacityAdults?: number
  basePrice?: number
  media?: MediaResponse[]     // For creating/updating room types - complete media info
  createdAt?: string
  updatedAt?: string
}

export interface RoomTypeInheritance {
  id: number
  name: string
  description: string
  basePrice?: number
  media?: MediaResponse[]
  primaryImage?: MediaResponse
  hasMedia: boolean
  mediaCount: number
}

export interface Amenity {
  id: number
  name: string
  iconUrl?: string
  isActive: boolean
  displayOrder: number
  createdAt?: string
  updatedAt?: string
}

export interface Room {
  id: number
  hotelId: number
  hotelName?: string
  roomNumber: string
  description: string
  price: number
  maxOccupancy: number
  bedType: string
  roomSize: number
  isAvailable: boolean
  roomType?: RoomType
  roomTypeId?: number | null  // For creating/updating rooms
  amenities?: Amenity[]
  amenityIds?: number[]       // For creating/updating rooms
  media?: MediaResponse[]     // For creating/updating rooms - complete media info
  createdAt?: string
  updatedAt?: string
}

export interface Booking {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  type: "FLIGHT" | "HOTEL" | "COMBO"
  flightId?: string
  hotelId?: string
  roomId?: string
  checkIn?: string
  checkOut?: string
  passengers?: number
  totalAmount: number
  currency: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  nationality?: string
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  totalBookings: number
  totalSpent: number
  status: "ACTIVE" | "INACTIVE" | "BANNED"
  createdAt: string
  lastLoginAt?: string
}

export interface FlightFare {
  fareId: string
  scheduleId: string
  fareClass: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"
  price: number
  availableSeats: number
}

export interface FlightFareCreateRequest {
  scheduleId: string
  fareClass: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"
  price: number
  availableSeats: number
}

export interface FlightFareUpdateRequest {
  fareClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"
  price?: number
  availableSeats?: number
}

export interface FlightFareCalculationRequest {
  scheduleIds: string[]
  fareClass: string
  departureDate: string
  passengerCount: number
  basePrice?: number
  aircraftType?: string
}

export interface FlightFareCalculationResult {
  scheduleId: string
  flightNumber: string
  origin: string
  destination: string
  aircraftType: string
  fareClass: string
  calculatedPrice: number
  availableSeats: number
  currency: string
  demandMultiplier: number
  timeMultiplier: number
  seasonalityMultiplier: number
  fareClassMultiplier: number
}

export interface FlightSchedule {
  scheduleId: string
  flightId: number
  departureTime: string
  arrivalTime: string
  aircraftType?: string
  aircraftId?: number
  status: "SCHEDULED" | "ACTIVE" | "DELAYED" | "CANCELLED" | "COMPLETED"
  flight?: Flight
  aircraft?: Aircraft
  durationMinutes?: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface FlightScheduleCreateRequest {
  flightId: number
  departureTime: string
  arrivalTime: string
  aircraftId: number
  status?: "SCHEDULED" | "ACTIVE" | "DELAYED" | "CANCELLED" | "COMPLETED"
}

export interface FlightScheduleUpdateRequest {
  departureTime?: string
  arrivalTime?: string
  aircraftId?: number
  status?: "SCHEDULED" | "ACTIVE" | "DELAYED" | "CANCELLED" | "COMPLETED"
}