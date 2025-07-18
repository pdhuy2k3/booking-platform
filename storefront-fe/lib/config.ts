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

  // Database Configuration (informational)
  DATABASES: {
    FLIGHT_DB: {
      NAME: 'flight_db',
      DESCRIPTION: 'PostgreSQL database containing flight data',
      TABLES: ['flights', 'airlines', 'airports', 'routes'],
    },
    HOTEL_DB: {
      NAME: 'hotel_db', 
      DESCRIPTION: 'PostgreSQL database containing hotel data',
      TABLES: ['hotels', 'rooms', 'amenities', 'locations'],
    }
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

// Service Status
export const SERVICE_STATUS = {
  FLIGHT_SERVICE: 'REAL_DATA', // Connected to flight_db
  HOTEL_SERVICE: 'REAL_DATA',  // Connected to hotel_db
  BOOKING_SERVICE: 'REAL_DATA',
  PAYMENT_SERVICE: 'REAL_DATA',
  CUSTOMER_SERVICE: 'REAL_DATA',
} as const

// API Endpoints with full URLs
export const getApiEndpoint = (service: keyof typeof APP_CONFIG.SERVICES.ENDPOINTS, path: string = '') => {
  const baseEndpoint = APP_CONFIG.SERVICES.ENDPOINTS[service]
  return `${baseEndpoint}${path}`
}

// Validation functions
export const validateConfig = () => {
  const errors: string[] = []

  if (!APP_CONFIG.API.BASE_URL) {
    errors.push('API Base URL is not configured')
  }

  if (!APP_CONFIG.SERVICES.USE_REAL_DATA) {
    console.warn('⚠️ Application is configured to use mock data instead of real databases')
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`)
  }

  return true
}

// Environment helpers
export const isRealDataEnabled = () => APP_CONFIG.SERVICES.USE_REAL_DATA
export const isDevelopment = () => APP_CONFIG.ENVIRONMENT.IS_DEVELOPMENT
export const isProduction = () => APP_CONFIG.ENVIRONMENT.IS_PRODUCTION
export const shouldLog = () => APP_CONFIG.ENVIRONMENT.ENABLE_LOGGING

// Database connection status
export const getDatabaseStatus = () => ({
  flightDb: {
    connected: APP_CONFIG.SERVICES.FLIGHT_DB_ENABLED,
    status: SERVICE_STATUS.FLIGHT_SERVICE,
    database: APP_CONFIG.DATABASES.FLIGHT_DB.NAME
  },
  hotelDb: {
    connected: APP_CONFIG.SERVICES.HOTEL_DB_ENABLED,
    status: SERVICE_STATUS.HOTEL_SERVICE,
    database: APP_CONFIG.DATABASES.HOTEL_DB.NAME
  }
})

// Initialize configuration
export const initializeConfig = () => {
  try {
    validateConfig()
    
    if (shouldLog()) {
      console.log('🔧 Application Configuration Initialized')
      console.log('📊 Database Status:', getDatabaseStatus())
      console.log('🌐 API Base URL:', APP_CONFIG.API.BASE_URL)
      console.log('✅ Real Data Enabled:', isRealDataEnabled())
    }
    
    return true
  } catch (error) {
    console.error('❌ Configuration initialization failed:', error)
    return false
  }
}

// Export default configuration
export default APP_CONFIG
