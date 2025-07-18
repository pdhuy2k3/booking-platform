// Booking Types based on backend models

export enum BookingType {
  FLIGHT = "FLIGHT",
  HOTEL = "HOTEL", 
  COMBO = "COMBO",
  BUS = "BUS",
  TRAIN = "TRAIN"
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED", 
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}

export enum SagaState {
  BOOKING_INITIATED = "BOOKING_INITIATED",
  FLIGHT_RESERVATION_PENDING = "FLIGHT_RESERVATION_PENDING",
  FLIGHT_RESERVED = "FLIGHT_RESERVED",
  HOTEL_RESERVATION_PENDING = "HOTEL_RESERVATION_PENDING", 
  HOTEL_RESERVED = "HOTEL_RESERVED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_PROCESSED = "PAYMENT_PROCESSED",
  COMPLETED = "COMPLETED",
  COMPENSATION_INITIATED = "COMPENSATION_INITIATED",
  COMPENSATED = "COMPENSATED",
  FAILED = "FAILED"
}

// Request DTOs
export interface CreateBookingRequest {
  userId: string
  bookingType: BookingType
  totalAmount: number
  currency?: string
  flightDetails?: FlightBookingDetails
  hotelDetails?: HotelBookingDetails
}

export interface FlightBookingDetails {
  flightId: string
  departureDate: string
  returnDate?: string
  passengers: PassengerInfo[]
  seatClass: string
}

export interface HotelBookingDetails {
  hotelId: string
  roomId: string
  checkInDate: string
  checkOutDate: string
  guests: number
  rooms: number
}

export interface PassengerInfo {
  firstName: string
  lastName: string
  dateOfBirth: string
  passportNumber?: string
  nationality: string
}

// Response DTOs
export interface BookingResponse {
  bookingId: string
  bookingReference: string
  sagaId: string
  status: BookingStatus
  sagaState: SagaState
  confirmationNumber?: string
  totalAmount: number
  currency: string
  bookingType: BookingType
  createdAt: string
  updatedAt: string
}

export interface BookingDetails extends BookingResponse {
  userId: string
  flightDetails?: FlightBookingDetails
  hotelDetails?: HotelBookingDetails
  paymentDetails?: PaymentDetails
  cancellationReason?: string
  compensationReason?: string
}

export interface PaymentDetails {
  paymentId: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  transactionId?: string
}

// Flight and Hotel search types
export interface FlightSearchRequest {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
  seatClass: string
}

export interface FlightSearchResult {
  flightId: string
  airline: string
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  currency: string
  seatClass: string
  availableSeats: number
}

export interface HotelSearchRequest {
  destination: string
  checkInDate: string
  checkOutDate: string
  guests: number
  rooms: number
}

export interface HotelSearchResult {
  hotelId: string
  name: string
  address: string
  city: string
  rating: number
  pricePerNight: number
  currency: string
  availableRooms: RoomInfo[]
  amenities: string[]
  images: string[]
}

export interface RoomInfo {
  roomId: string
  roomType: string
  capacity: number
  pricePerNight: number
  amenities: string[]
  available: boolean
}

// Booking flow state
export interface BookingFlowState {
  step: BookingStep
  bookingType: BookingType
  flightSearch?: FlightSearchRequest
  hotelSearch?: HotelSearchRequest
  selectedFlight?: FlightSearchResult
  selectedHotel?: HotelSearchResult
  selectedRoom?: RoomInfo
  passengers?: PassengerInfo[]
  totalAmount: number
  currency: string
}

export enum BookingStep {
  SEARCH = "SEARCH",
  SELECT = "SELECT", 
  DETAILS = "DETAILS",
  PAYMENT = "PAYMENT",
  CONFIRMATION = "CONFIRMATION"
}
