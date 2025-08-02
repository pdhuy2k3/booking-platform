// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
export const API_TIMEOUT = 30000; // 30 seconds

// Travel Constants
export const PASSENGER_TYPES = {
  ADULT: "adult",
  CHILD: "child",
  INFANT: "infant",
} as const;

export const TRIP_TYPES = {
  ONE_WAY: "one-way",
  ROUND_TRIP: "round-trip",
} as const;

export const TRAVEL_CLASSES = {
  ECONOMY: "economy",
  PREMIUM_ECONOMY: "premium-economy",
  BUSINESS: "business",
  FIRST: "first",
} as const;

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

// UI Constants
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Form Constants
export const MAX_PASSENGERS = {
  ADULTS: 9,
  CHILDREN: 9,
  INFANTS: 9,
  TOTAL: 9,
} as const;

export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  API: "yyyy-MM-dd",
  FULL: "EEEE, MMMM dd, yyyy",
  TIME: "HH:mm",
  DATETIME: "MMM dd, yyyy HH:mm",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  BOOKING_FAILED: "Booking failed. Please try again.",
  PAYMENT_FAILED: "Payment failed. Please try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: "Booking created successfully!",
  PAYMENT_COMPLETED: "Payment completed successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
  EMAIL_SENT: "Email sent successfully!",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  SEARCH_HISTORY: "bookingsmart_search_history",
  USER_PREFERENCES: "bookingsmart_user_preferences",
  BOOKING_DRAFT: "bookingsmart_booking_draft",
  THEME: "bookingsmart_theme",
} as const;

// Query Keys for React Query
export const QUERY_KEYS = {
  // Flight related
  FLIGHTS: "flights",
  FLIGHT_SEARCH: "flight_search",
  FLIGHT_DETAILS: "flight_details",
  FLIGHT_BOOKING: "flight_booking",

  // Hotel related
  HOTELS: "hotels",
  HOTEL_SEARCH: "hotel_search",
  HOTEL_DETAILS: "hotel_details",
  HOTEL_ROOMS: "hotel_rooms",
  HOTEL_BOOKING: "hotel_booking",

  // Package related
  PACKAGES: "packages",
  PACKAGE_SEARCH: "package_search",
  PACKAGE_DETAILS: "package_details",
  PACKAGE_BOOKING: "package_booking",
  POPULAR_PACKAGES: "popular_packages",

  // Booking related
  BOOKINGS: "bookings",
  BOOKING_DETAILS: "booking_details",

  // User related
  USER: "user",
  USER_PROFILE: "user_profile",

  // Location related
  LOCATIONS: "locations",
  AIRPORTS: "airports",
  CITIES: "cities",
} as const;
