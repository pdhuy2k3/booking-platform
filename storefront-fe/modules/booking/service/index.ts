import { createBooking } from "@/lib/api"
import type { Booking, BookingItem, CreateBookingPayload, Traveler } from "@/lib/types"

export const bookingService = {
  create(payload: CreateBookingPayload) {
    return createBooking(payload)
  },
}

export type { Booking, BookingItem, CreateBookingPayload, Traveler }

