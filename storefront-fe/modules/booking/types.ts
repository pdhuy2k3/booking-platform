export enum BookingStep {
  SEARCH = "SEARCH",
  SELECT = "SELECT",
  DETAILS = "DETAILS",
  PAYMENT = "PAYMENT",
  CONFIRMATION = "CONFIRMATION",
}

export enum BookingType {
  FLIGHT = "FLIGHT",
  HOTEL = "HOTEL",
  COMBO = "COMBO",
}

export interface FlightSearchRequest {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
  cabinClass: string
}

export interface HotelSearchRequest {
  destination: string
  checkInDate: string
  checkOutDate: string
  rooms: number
  guests: number
}

export interface FlightSearchResult {
  id: string
  airline: string
  flightNumber: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  seatClass: string
  origin: string
  destination: string
  availableSeats: number
  currency: string
}

export interface HotelSearchResult {
  id: string
  name: string
  rating: number
  pricePerNight: number
  amenities: string[]
  address: string
  city: string
  currency: string
  availableRooms: RoomInfo[]
}

export interface RoomInfo {
  id: string
  type: string
  pricePerNight: number
  beds: number
  maxGuests: number
  roomId: string
  roomType: string
  capacity: number
  amenities: string[]
}

export interface PassengerInfo {
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  passportNumber?: string
}

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

export interface BookingResponse {
  bookingId: string;
  bookingReference: string;
  status: string;
  sagaState: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}


