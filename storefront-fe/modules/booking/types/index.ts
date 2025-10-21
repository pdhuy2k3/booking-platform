// Booking types for the frontend

export interface FlightBookingDetails {
  flightId: number;
  flightNumber: string;
  airline: string;
  originAirport: string;
  destinationAirport: string;
  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  departureDateTime: string; // ISO format
  arrivalDateTime: string; // ISO format
  seatClass: string;
  scheduleId?: string;
  fareId?: string;
  passengerCount: number;
  passengers: PassengerDetails[];
  selectedSeats?: string[];
  pricePerPassenger: number;
  totalFlightPrice: number;
  returnFlight?: ReturnFlightDetails;
  additionalServices?: FlightService[];
  specialRequests?: string;
  airlineLogo?: string;
  originAirportName?: string;
  destinationAirportName?: string;
  originAirportImage?: string;
  destinationAirportImage?: string;
}

export interface HotelBookingDetails {
  hotelId: string;
  hotelName: string;
  hotelAddress: string;
  city: string;
  country: string;
  hotelLatitude?: number;
  hotelLongitude?: number;
  starRating?: number;
  roomTypeId?: string;
  roomAvailabilityId?: string;
  roomType: string;
  roomName: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numberOfNights: number;
  numberOfRooms: number;
  numberOfGuests: number;
  guests: GuestDetails[];
  pricePerNight: number;
  totalRoomPrice: number;
  bedType?: string;
  amenities?: string[];
  additionalServices?: HotelService[];
  specialRequests?: string;
  cancellationPolicy?: string;
  hotelImage?: string;
  roomImage?: string;
  roomImages?: string[];
}

export interface ComboBookingDetails {
  flightDetails: FlightBookingDetails;
  hotelDetails: HotelBookingDetails;
  comboDiscount?: number;
  packageName?: string;
  comboOffers?: string;
}

export interface PassengerDetails {
  passengerType: 'ADULT' | 'CHILD' | 'INFANT';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'M' | 'F';
  nationality: string;
  passportNumber?: string;
  passportExpiryDate?: string; // YYYY-MM-DD
  passportIssuingCountry?: string;
  email?: string;
  phoneNumber?: string;
  frequentFlyerNumber?: string;
  specialAssistance?: string;
  mealPreference?: string;
  seatPreference?: string;
}

export interface GuestDetails {
  guestType: 'PRIMARY' | 'ADDITIONAL';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'M' | 'F';
  nationality: string;
  idNumber?: string;
  email?: string;
  phoneNumber?: string;
  loyaltyNumber?: string;
  specialRequests?: string;
}

export interface ReturnFlightDetails {
  flightId: string;
  flightNumber: string;
  departureDateTime: string; // ISO format
  arrivalDateTime: string; // ISO format
  pricePerPassenger: number;
  selectedSeats?: string[];
}

export interface FlightService {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  description?: string;
  price: number;
  quantity: number;
  passengerId?: string;
}

export interface HotelService {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  description?: string;
  price: number;
  quantity: number;
  guestId?: string;
  serviceDateTime?: string; // ISO format
}

export interface CreateBookingRequest {
  bookingType: 'FLIGHT' | 'HOTEL' | 'COMBO';
  totalAmount: number;
  currency?: string;
  productDetails: FlightBookingDetails | HotelBookingDetails | ComboBookingDetails;
  notes?: string;
}

export interface BookingResponse {
  bookingId: string;
  bookingReference: string;
  sagaId: string;
  status: string;
  totalAmount: number;
  currency: string;
  bookingType: 'FLIGHT' | 'HOTEL' | 'COMBO';
  createdAt: string;
  updatedAt: string;
  reservationLockedAt?: string | null;
  reservationExpiresAt?: string | null;
}

export interface BookingStatusResponse {
  bookingId: string;
  bookingReference: string;
  status: string;
  lastUpdated: string;
  message?: string;
  estimatedCompletion?: string;
  reservationLockedAt?: string | null;
  reservationExpiresAt?: string | null;
}

export interface BookingItem {
  type: 'FLIGHT' | 'HOTEL';
  referenceId: string;
  price: number;
  currency: string;
  meta?: Record<string, unknown>;
}

export interface BookingSummary {
  bookingId?: string;
  bookingReference?: string;
  sagaId?: string;
  totalAmount: number;
  currency: string;
  items: BookingItem[];
  status?: string;
  error?: string;
}

export interface BookingHistoryItemDto {
  bookingId: string;
  bookingReference: string;
  bookingType: 'FLIGHT' | 'HOTEL' | 'COMBO';
  status: string;
  sagaState?: string | null;
  sagaId?: string | null;
  totalAmount?: number | string | null;
  currency?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  productSummary?: string | null;
  confirmationNumber?: string | null;
  productDetailsJson?: string | null;
  originLatitude?: number | null;
  originLongitude?: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  hotelLatitude?: number | null;
  hotelLongitude?: number | null;
  originAirportCode?: string | null;
  originCity?: string | null;
  destinationAirportCode?: string | null;
  destinationCity?: string | null;
  airlineLogo?: string | null;
  hotelImage?: string | null;
  roomImage?: string | null;
  roomImages?: string[] | null;
  reservationLockedAt?: string | null;
  reservationExpiresAt?: string | null;
}

export interface BookingHistoryResponseDto {
  items: BookingHistoryItemDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
