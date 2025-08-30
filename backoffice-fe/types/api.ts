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

export interface Airline {
  id: number
  name: string
  code: string
  country?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Airport {
  id: number
  name: string
  code: string
  city: string
  country: string
  timezone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Flight {
  id: number
  flightNumber: string
  airline: Airline
  departureAirport: Airport
  arrivalAirport: Airport
  baseDurationMinutes?: number
  aircraftType?: string
  status: "ACTIVE" | "CANCELLED" | "DELAYED" | "ON_TIME"
  basePrice?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
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
  images?: string[]
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
  createdAt?: string
  updatedAt?: string
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
  images?: string[]
  imageUrls?: string[]        // For creating/updating rooms
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
