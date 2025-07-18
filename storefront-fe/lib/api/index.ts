// API Services Index
// Centralized export for all API services

// Core API client
export { apiClient } from "../api-client"
export type { AxiosRequestConfig, AxiosResponse } from "../api-client"

// Booking services
export { BookingService, bookingService } from "../booking-service"

// Flight services
export { FlightService, flightService } from "../flight-service"
export type {
  FlightFilters,
  FlightSearchParams,
  FlightSearchResponse,
  FlightDetails,
  PopularDestination as FlightDestination
} from "../flight-service"

// Hotel services
export { HotelService, hotelService } from "../hotel-service"
export type {
  HotelFilters,
  HotelSearchParams,
  HotelSearchResponse,
  HotelDetails,
  RoomDetails,
  PopularDestination as HotelDestination
} from "../hotel-service"

// Payment services
export { PaymentService, paymentService } from "../payment-service"
export type {
  PaymentMethod,
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
  RefundRequest,
  RefundResponse
} from "../payment-service"

// Customer services
export { CustomerService, customerService } from "../customer-service"
export type {
  CustomerProfile,
  UpdateProfileRequest,
  TravelDocument,
  SavedTraveler,
  LoyaltyTransaction
} from "../customer-service"

// Booking types
export type {
  BookingType,
  BookingStatus,
  SagaState,
  CreateBookingRequest,
  BookingResponse,
  BookingDetails,
  FlightBookingDetails,
  HotelBookingDetails,
  PassengerInfo,
  PaymentDetails,
  FlightSearchRequest,
  FlightSearchResult,
  HotelSearchRequest,
  HotelSearchResult,
  RoomInfo,
  BookingFlowState,
  BookingStep
} from "../../types/booking"

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BFF_BASE_URL || "http://storefront",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    USERINFO: "/api/auth/userinfo",
  },
  
  // Bookings
  BOOKINGS: {
    BASE: "/api/bookings/storefront",
    CREATE: "/api/bookings/storefront",
    GET_BY_ID: (id: string) => `/api/bookings/storefront/${id}`,
    GET_BY_SAGA: (sagaId: string) => `/api/bookings/storefront/saga/${sagaId}`,
    USER_BOOKINGS: (userId: string) => `/api/bookings/storefront/user/${userId}`,
    USER_HISTORY: (userId: string) => `/api/bookings/storefront/user/${userId}/history`,
    CANCEL: (id: string) => `/api/bookings/storefront/${id}`,
  },
  
  // Flights
  FLIGHTS: {
    BASE: "/api/flights/storefront",
    SEARCH: "/api/flights/storefront/search",
    DETAILS: (id: string) => `/api/flights/storefront/${id}`,
    POPULAR_DESTINATIONS: "/api/flights/storefront/popular-destinations",
    PRICE_CALENDAR: "/api/flights/storefront/price-calendar",
    AIRPORTS_SEARCH: "/api/flights/storefront/airports/search",
    SEAT_MAP: (id: string) => `/api/flights/storefront/${id}/seat-map`,
    RESERVE_SEATS: (id: string) => `/api/flights/storefront/${id}/reserve-seats`,
    RESERVATIONS: (id: string) => `/api/flights/storefront/reservations/${id}`,
    STATUS: (flightNumber: string) => `/api/flights/storefront/status/${flightNumber}`,
    BAGGAGE: (id: string) => `/api/flights/storefront/${id}/baggage`,
    MEALS: (id: string) => `/api/flights/storefront/${id}/meals`,
    SERVICES: (id: string) => `/api/flights/storefront/${id}/services`,
  },
  
  // Hotels
  HOTELS: {
    BASE: "/api/hotels/storefront",
    SEARCH: "/api/hotels/storefront/search",
    DETAILS: (id: string) => `/api/hotels/storefront/${id}`,
    ROOMS: (id: string) => `/api/hotels/storefront/${id}/rooms`,
    ROOM_DETAILS: (hotelId: string, roomId: string) => `/api/hotels/storefront/${hotelId}/rooms/${roomId}`,
    POPULAR_DESTINATIONS: "/api/hotels/storefront/popular-destinations",
    DESTINATIONS_SEARCH: "/api/hotels/storefront/destinations/search",
    AVAILABILITY: (id: string) => `/api/hotels/storefront/${id}/availability`,
    RESERVE_ROOM: (hotelId: string, roomId: string) => `/api/hotels/storefront/${hotelId}/rooms/${roomId}/reserve`,
    RESERVATIONS: (id: string) => `/api/hotels/storefront/reservations/${id}`,
    REVIEWS: (id: string) => `/api/hotels/storefront/${id}/reviews`,
    AMENITIES: (id: string) => `/api/hotels/storefront/${id}/amenities`,
    NEARBY: (id: string) => `/api/hotels/storefront/${id}/nearby`,
    SERVICES: (id: string) => `/api/hotels/storefront/${id}/services`,
  },
  
  // Payments
  PAYMENTS: {
    BASE: "/api/payments/storefront",
    METHODS: (userId: string) => `/api/payments/storefront/methods/${userId}`,
    METHOD_DETAILS: (userId: string, methodId: string) => `/api/payments/storefront/methods/${userId}/${methodId}`,
    PROCESS: "/api/payments/storefront/process",
    STATUS: (id: string) => `/api/payments/storefront/${id}/status`,
    HISTORY: (userId: string) => `/api/payments/storefront/history/${userId}`,
    REFUND: "/api/payments/storefront/refund",
    REFUND_STATUS: (id: string) => `/api/payments/storefront/refunds/${id}`,
    PROVIDERS: "/api/payments/storefront/providers",
    VERIFY: (id: string) => `/api/payments/storefront/${id}/verify`,
    CANCEL: (id: string) => `/api/payments/storefront/${id}/cancel`,
    RECEIPT: (id: string) => `/api/payments/storefront/${id}/receipt`,
  },
  
  // Customers
  CUSTOMERS: {
    BASE: "/api/customers/storefront",
    PROFILE: (userId: string) => `/api/customers/storefront/${userId}`,
    PHOTO: (userId: string) => `/api/customers/storefront/${userId}/photo`,
    DOCUMENTS: (userId: string) => `/api/customers/storefront/${userId}/documents`,
    DOCUMENT_DETAILS: (userId: string, docId: string) => `/api/customers/storefront/${userId}/documents/${docId}`,
    TRAVELERS: (userId: string) => `/api/customers/storefront/${userId}/travelers`,
    TRAVELER_DETAILS: (userId: string, travelerId: string) => `/api/customers/storefront/${userId}/travelers/${travelerId}`,
    LOYALTY_BALANCE: (userId: string) => `/api/customers/storefront/${userId}/loyalty/balance`,
    LOYALTY_HISTORY: (userId: string) => `/api/customers/storefront/${userId}/loyalty/history`,
    LOYALTY_REDEEM: (userId: string) => `/api/customers/storefront/${userId}/loyalty/redeem`,
    NOTIFICATIONS: (userId: string) => `/api/customers/storefront/${userId}/preferences/notifications`,
    CHANGE_PASSWORD: (userId: string) => `/api/customers/storefront/${userId}/change-password`,
    TWO_FA_ENABLE: (userId: string) => `/api/customers/storefront/${userId}/2fa/enable`,
    TWO_FA_VERIFY: (userId: string) => `/api/customers/storefront/${userId}/2fa/verify`,
    TWO_FA_DISABLE: (userId: string) => `/api/customers/storefront/${userId}/2fa/disable`,
    LOGIN_HISTORY: (userId: string) => `/api/customers/storefront/${userId}/login-history`,
    SESSIONS: (userId: string) => `/api/customers/storefront/${userId}/sessions`,
    SESSION_DETAILS: (userId: string, sessionId: string) => `/api/customers/storefront/${userId}/sessions/${sessionId}`,
  },
  
  // Health and System
  SYSTEM: {
    HEALTH: "/actuator/health",
    INFO: "/actuator/info",
  },
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// Error types
export interface ApiError {
  status: number
  message: string
  code?: string
  details?: any
  timestamp: string
}

// Response wrapper types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
  totalPages: number
}

// Utility functions
export const createApiError = (status: number, message: string, code?: string, details?: any): ApiError => ({
  status,
  message,
  code,
  details,
  timestamp: new Date().toISOString()
})

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.status === 'number' && typeof error.message === 'string'
}

// Request/Response interceptor helpers
export const withAuth = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
})

export const withFormData = () => ({
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

// Environment-based service selection
export const getServiceMode = (): 'development' | 'production' => {
  return process.env.NODE_ENV === 'development' ? 'development' : 'production'
}

export const isDevelopment = (): boolean => {
  return getServiceMode() === 'development'
}

export const isProduction = (): boolean => {
  return getServiceMode() === 'production'
}

// Service configuration
export const SERVICE_CONFIG = {
  USE_REAL_DATA: true, // Now using real database data
  ENABLE_MOCK_FALLBACK: false, // Disable mock fallback
  API_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  ENABLE_REQUEST_LOGGING: process.env.NODE_ENV === 'development',
} as const

// Default export with all services
export default {
  apiClient,
  bookingService,
  flightService,
  hotelService,
  paymentService,
  customerService,
  API_CONFIG,
  API_ENDPOINTS,
  HTTP_STATUS,
}
