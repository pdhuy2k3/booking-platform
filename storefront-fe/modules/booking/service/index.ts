import type { Booking, BookingItem, CreateBookingPayload, Traveler } from "@/lib/types"
import {
  bookingApiService,
  type StorefrontBookingRequest,
  type StorefrontBookingResponse,
  type StorefrontFlightSelection,
  type StorefrontHotelSelection,
} from './booking-api'
import type { 
  FlightBookingDetails, 
  HotelBookingDetails, 
  ComboBookingDetails,
  BookingStatusResponse,
  CreateBookingRequest,
  BookingHistoryResponseDto,
  BookingHistoryItemDto
} from '../types'

export const bookingService = {
  create: bookingApiService.createBooking,
  getStatus: bookingApiService.getBookingStatus,
  cancel: bookingApiService.cancelBooking,
  confirm: bookingApiService.confirmBooking,
  requestPaymentInitiation: bookingApiService.initiatePayment,
  history: bookingApiService.getBookingHistory,
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
  StorefrontFlightSelection,
  StorefrontHotelSelection,
  StorefrontBookingResponse,
  BookingStatusResponse,
  CreateBookingRequest,
  BookingHistoryResponseDto,
  BookingHistoryItemDto
}
