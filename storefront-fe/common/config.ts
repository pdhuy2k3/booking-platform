// Application Configuration
// Centralized configuration for the storefront application

export const APP_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_BFF_BASE_URL || "http://storefront",
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },

  // Service Configuration
  SERVICES: {
    // Now using real database-backed services
    USE_REAL_DATA: true,
    ENABLE_MOCK_FALLBACK: false,
    
    // Database connections (via BFF)
    FLIGHT_DB_ENABLED: true,
    HOTEL_DB_ENABLED: true,
    
    // Service endpoints
    ENDPOINTS: {
      FLIGHTS: "/api/flights/storefront",
      HOTELS: "/api/hotels/storefront", 
      BOOKINGS: "/api/bookings/storefront",
      PAYMENTS: "/api/payments/storefront",
      CUSTOMERS: "/api/customers/storefront",
    }
  },

  // Feature Flags
  FEATURES: {
    REAL_TIME_SEARCH: true,
    ADVANCED_FILTERING: true,
    SEAT_SELECTION: true,
    LOYALTY_PROGRAM: true,
    PAYMENT_PROCESSING: true,
    NOTIFICATIONS: true,
  },

  // Environment Settings
  ENVIRONMENT: {
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    ENABLE_LOGGING: process.env.NODE_ENV === 'development',
    ENABLE_DEBUG: process.env.NODE_ENV === 'development',
  },

  // UI Configuration
  UI: {
    DEFAULT_CURRENCY: 'VND',
    DEFAULT_LANGUAGE: 'vi',
    ITEMS_PER_PAGE: 20,
    SEARCH_DEBOUNCE_MS: 300,
    AUTO_REFRESH_INTERVAL: 30000,
  },

  // Search Configuration
  SEARCH: {
    FLIGHT: {
      DEFAULT_PASSENGERS: 1,
      DEFAULT_CLASS: 'ECONOMY',
      MAX_PASSENGERS: 9,
      ADVANCE_BOOKING_DAYS: 365,
    },
    HOTEL: {
      DEFAULT_GUESTS: 2,
      DEFAULT_ROOMS: 1,
      MAX_GUESTS: 8,
      MAX_ROOMS: 4,
      ADVANCE_BOOKING_DAYS: 365,
    }
  },

  // Booking Configuration
  BOOKING: {
    RESERVATION_TIMEOUT_MINUTES: 15,
    PAYMENT_TIMEOUT_MINUTES: 30,
    CANCELLATION_WINDOW_HOURS: 24,
    MODIFICATION_WINDOW_HOURS: 2,
  },

  // Error Handling
  ERROR_HANDLING: {
    SHOW_DETAILED_ERRORS: process.env.NODE_ENV === 'development',
    AUTO_RETRY_ON_NETWORK_ERROR: true,
    FALLBACK_TO_CACHE: false, // Disabled since we're using real data
  }
} as const



// Export default configuration
export default APP_CONFIG
