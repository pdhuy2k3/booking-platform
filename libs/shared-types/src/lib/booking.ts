import { PassengerInfo } from './flight';
import { GuestInfo } from './hotel';
import { ContactInfo, PaymentMethod } from './common';

// Booking related types
export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  type: "FLIGHT" | "HOTEL" | "COMBO";
  flightId?: string;
  hotelId?: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  passengers?: number;
  totalAmount: number;
  currency: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  type: "FLIGHT" | "HOTEL" | "COMBO";
  flightBooking?: {
    flightId: string;
    passengers: PassengerInfo[];
  };
  hotelBooking?: {
    hotelId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: GuestInfo[];
  };
  contactInfo: ContactInfo;
  paymentMethod: PaymentMethod;
}

export interface BookingResponse {
  bookingId: string;
  confirmationNumber: string;
  totalAmount: number;
  paymentStatus: string;
  bookingDetails: Booking;
}
