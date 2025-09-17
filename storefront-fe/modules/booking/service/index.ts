import type { Booking, BookingItem, CreateBookingPayload, Traveler } from "@/lib/types"
import { bookingApiService, type StorefrontBookingRequest, type StorefrontBookingResponse } from './booking-api'
import type { 
  FlightBookingDetails, 
  HotelBookingDetails, 
  ComboBookingDetails,
  BookingStatusResponse,
  CreateBookingRequest
} from '../types'

export const bookingService = {
  create: bookingApiService.createBooking,
  getStatus: bookingApiService.getBookingStatus,
  cancel: bookingApiService.cancelBooking,
}

export type { 
  Booking, 
  BookingItem, 
  CreateBookingPayload, 
  Traveler,
  FlightBookingDetails,
  HotelBookingDetails,
  ComboBookingDetails,
  StorefrontBookingRequest,
  StorefrontBookingResponse,
  BookingStatusResponse,
  CreateBookingRequest
}