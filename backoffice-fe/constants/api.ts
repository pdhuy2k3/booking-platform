export const API_ENDPOINTS = {
  // Authentication
  AUTH_USERINFO: "/api/auth/userinfo",
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/logout",

  // Business APIs
  FLIGHTS: "/api/flights",
  HOTELS: "/api/hotels",
  BOOKINGS: "/api/bookings",
  CUSTOMERS: "/api/customers",
  REPORTS: "/api/reports",
  ANALYTICS: "/api/analytics",

  // Admin APIs
  STAFF: "/api/staff",
  SETTINGS: "/api/settings",
  PROMOTIONS: "/api/promotions",
  PAYMENTS: "/api/payments",
} as const

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

export const STATUS_OPTIONS = {
  FLIGHT: ["ACTIVE", "CANCELLED", "DELAYED"],
  HOTEL: ["ACTIVE", "INACTIVE"],
  BOOKING: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
  CUSTOMER: ["ACTIVE", "INACTIVE", "BANNED"],
} as const

// Mock configuration - set to true to use mock data
export const USE_MOCK_DATA = true

// BFF Base URL - update this when your BFF is ready
export const BFF_BASE_URL = process.env.NEXT_PUBLIC_BFF_BASE_URL || "http://localhost:8080"
