import { Money, Location } from "./common";
import { FlightOffer } from "./flight";
import { HotelOffer } from "./hotel";
import { PackageOffer } from "./package";

// Booking types
export type BookingType = "flight" | "hotel" | "package";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "failed";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Passenger information
export interface PassengerInfo {
  id?: string;
  type: "adult" | "child" | "infant";
  title: "mr" | "mrs" | "ms" | "dr";
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string; // YYYY-MM-DD
  specialRequests?: string[];
}

// Contact information
export interface ContactInfo {
  email: string;
  phone: string;
  countryCode: string;
  alternatePhone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Billing information
export interface BillingInfo {
  firstName: string;
  lastName: string;
  company?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
}

// Booking request
export interface BookingRequest {
  bookingType: BookingType;
  
  // Selected items
  flightOffer?: FlightOffer;
  hotelOffer?: HotelOffer;
  packageOffer?: PackageOffer;
  
  // Passenger and contact details
  passengers: PassengerInfo[];
  contactInfo: ContactInfo;
  billingInfo?: BillingInfo;
  
  // Special requests
  specialRequests?: string[];
  
  // Payment information
  paymentMethod: {
    type: "stripe" | "paypal" | "bank_transfer";
    stripePaymentMethodId?: string;
    paypalOrderId?: string;
  };
  
  // Pricing
  totalAmount: number;
  currency: string;
  
  // Additional data
  promoCode?: string;
  marketingConsent?: boolean;
  termsAccepted: boolean;
}

// Booking response
export interface BookingResponse {
  bookingId: string;
  bookingReference: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  
  // Booking details
  bookingType: BookingType;
  createdAt: string;
  updatedAt: string;
  
  // Items
  flight?: FlightOffer;
  hotel?: HotelOffer;
  package?: PackageOffer;
  
  // Customer details
  passengers: PassengerInfo[];
  contactInfo: ContactInfo;
  billingInfo?: BillingInfo;
  
  // Pricing breakdown
  pricing: {
    subtotal: Money;
    taxes: Money;
    fees: Money;
    discounts: Money;
    total: Money;
    breakdown: {
      item: string;
      amount: Money;
    }[];
  };
  
  // Payment details
  payment?: {
    paymentId: string;
    method: string;
    status: PaymentStatus;
    paidAt?: string;
    transactionId?: string;
  };
  
  // Confirmation details
  confirmationNumber?: string;
  ticketNumbers?: string[];
  vouchers?: {
    type: string;
    number: string;
    downloadUrl: string;
  }[];
  
  // Cancellation policy
  cancellationPolicy?: {
    refundable: boolean;
    cancellationDeadline?: string;
    cancellationFee?: Money;
    terms: string;
  };
}

// Booking history item
export interface BookingHistoryItem {
  bookingId: string;
  bookingReference: string;
  bookingType: BookingType;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  
  // Basic details
  title: string;
  description: string;
  createdAt: string;
  travelDate?: string;
  
  // Pricing
  totalAmount: Money;
  
  // Quick actions
  canCancel: boolean;
  canModify: boolean;
  canDownload: boolean;
  
  // Thumbnail info
  thumbnail?: {
    image?: string;
    icon: string;
    location?: string;
  };
}

// Booking modification request
export interface BookingModificationRequest {
  bookingId: string;
  modificationType: "passenger_details" | "dates" | "seats" | "special_requests";
  changes: Record<string, any>;
  reason?: string;
}

// Booking cancellation request
export interface BookingCancellationRequest {
  bookingId: string;
  reason: string;
  refundMethod?: "original_payment" | "credit" | "bank_transfer";
}

// Payment intent for Stripe
export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

// Booking flow state
export interface BookingFlowState {
  step: "selection" | "details" | "payment" | "confirmation";
  selectedItem?: FlightOffer | HotelOffer | PackageOffer;
  passengers: PassengerInfo[];
  contactInfo?: ContactInfo;
  billingInfo?: BillingInfo;
  paymentMethod?: {
    type: string;
    details?: any;
  };
  specialRequests: string[];
  promoCode?: string;
  totalAmount: number;
  currency: string;
  errors: Record<string, string>;
  isLoading: boolean;
}

// Search to booking conversion
export interface SearchToBookingData {
  searchType: BookingType;
  selectedItemId: string;
  searchParams: Record<string, any>;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  rooms?: {
    adults: number;
    children: number;
    childrenAges: number[];
  }[];
}
