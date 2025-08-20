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

export interface Flight {
  id: string
  flightNumber: string
  airline: string
  departure: {
    airport: string
    city: string
    time: string
    date: string
  }
  arrival: {
    airport: string
    city: string
    time: string
    date: string
  }
  price: number
  currency: string
  totalSeats: number
  availableSeats: number
  status: "ACTIVE" | "CANCELLED" | "DELAYED"
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
  amenities?: Amenity[]
  images?: string[]
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
