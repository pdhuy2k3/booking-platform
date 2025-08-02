import { Location, Money, Passenger } from "./common";

// Flight search request
export interface FlightSearchRequest {
  origin: string; // Airport/city code
  destination: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // For round-trip
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  class: "economy" | "premium-economy" | "business" | "first";
  tripType: "one-way" | "round-trip";
}

// Flight segment
export interface FlightSegment {
  id: string;
  airline: {
    code: string;
    name: string;
    logo?: string;
  };
  flightNumber: string;
  aircraft: {
    type: string;
    name: string;
  };
  departure: {
    airport: Location;
    dateTime: string; // ISO 8601
    terminal?: string;
    gate?: string;
  };
  arrival: {
    airport: Location;
    dateTime: string;
    terminal?: string;
    gate?: string;
  };
  duration: number; // in minutes
  stops: number;
  stopDetails?: {
    airport: Location;
    duration: number; // layover duration in minutes
  }[];
  class: "economy" | "premium-economy" | "business" | "first";
  bookingClass: string; // Y, M, B, F, etc.
  availableSeats: number;
  baggage: {
    carry: {
      weight: number;
      dimensions: string;
    };
    checked: {
      weight: number;
      pieces: number;
      fee?: Money;
    };
  };
  amenities: string[]; // WiFi, meals, entertainment, etc.
  cancellationPolicy: {
    refundable: boolean;
    fee?: Money;
    deadline?: string;
  };
}

// Flight offer (can contain multiple segments for connecting flights)
export interface FlightOffer {
  id: string;
  type: "one-way" | "round-trip";
  outbound: FlightSegment[];
  inbound?: FlightSegment[]; // For round-trip
  price: {
    total: Money;
    base: Money;
    taxes: Money;
    fees: Money[];
    breakdown: {
      adults: Money;
      children: Money;
      infants: Money;
    };
  };
  validatingCarrier: string; // Main airline code
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  pricingOptions: {
    fareType: "published" | "private" | "negotiated";
    includedCheckedBags: number;
    refundable: boolean;
    exchangeable: boolean;
    lastTicketingDateTime: string;
  };
  travelerPricings: {
    travelerId: string;
    fareOption: string;
    travelerType: "adult" | "child" | "infant";
    price: Money;
    fareDetailsBySegment: {
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      includedCheckedBags: {
        quantity: number;
        weight?: number;
        weightUnit?: string;
      };
    }[];
  }[];
}

// Flight search response
export interface FlightSearchResponse {
  offers: FlightOffer[];
  meta: {
    count: number;
    searchId: string;
    currency: string;
  };
  dictionaries: {
    locations: Record<string, Location>;
    aircraft: Record<string, { name: string }>;
    carriers: Record<string, { name: string; logo?: string }>;
  };
}

// Flight booking request
export interface FlightBookingRequest {
  offerId: string;
  passengers: Passenger[];
  contactInfo: {
    email: string;
    phone: string;
  };
  paymentInfo: {
    method: "credit_card" | "debit_card" | "paypal";
    token: string; // Payment token from Stripe
  };
  specialRequests?: string[];
  seatPreferences?: {
    passengerId: string;
    seatNumber?: string;
    preferences: ("aisle" | "window" | "middle")[];
  }[];
}

// Flight booking response
export interface FlightBookingResponse {
  bookingId: string;
  pnr: string; // Passenger Name Record
  status: "confirmed" | "pending" | "failed";
  flights: FlightOffer;
  passengers: Passenger[];
  totalPrice: Money;
  paymentStatus: "paid" | "pending" | "failed";
  tickets: {
    passengerId: string;
    ticketNumber: string;
    eTicketUrl: string;
  }[];
  bookingDate: string;
  expiryDate?: string;
}
