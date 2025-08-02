import { Location, Money, DateRange } from "./common";

// Hotel search request
export interface HotelSearchRequest {
  destination: string; // City or hotel name
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  rooms: {
    adults: number;
    children: number;
    childrenAges?: number[];
  }[];
  currency?: string;
}

// Hotel amenity
export interface HotelAmenity {
  id: string;
  name: string;
  category: "room" | "hotel" | "business" | "wellness" | "dining" | "entertainment";
  icon?: string;
  description?: string;
}

// Room type
export interface RoomType {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  bedType: string;
  size: number; // in square meters
  amenities: HotelAmenity[];
  images: string[];
  cancellationPolicy: {
    refundable: boolean;
    deadline?: string;
    fee?: Money;
  };
}

// Hotel offer
export interface HotelOffer {
  id: string;
  hotel: {
    id: string;
    name: string;
    description: string;
    category: number; // Star rating
    location: Location;
    address: string;
    images: string[];
    amenities: HotelAmenity[];
    rating: {
      overall: number;
      reviews: number;
      breakdown: {
        cleanliness: number;
        comfort: number;
        location: number;
        service: number;
        value: number;
      };
    };
    policies: {
      checkIn: string; // HH:mm
      checkOut: string;
      cancellation: string;
      children: string;
      pets: boolean;
    };
  };
  room: RoomType;
  price: {
    total: Money;
    perNight: Money;
    taxes: Money;
    fees: Money[];
    breakdown: {
      baseRate: Money;
      taxes: Money;
      fees: Money;
    };
  };
  availability: {
    available: boolean;
    roomsLeft: number;
  };
  rateType: "public" | "member" | "corporate" | "package";
  boardType: "room_only" | "breakfast" | "half_board" | "full_board" | "all_inclusive";
  lastCancellationDate?: string;
}

// Hotel search response
export interface HotelSearchResponse {
  offers: HotelOffer[];
  meta: {
    count: number;
    searchId: string;
    currency: string;
    checkIn: string;
    checkOut: string;
    nights: number;
  };
  filters: {
    priceRange: { min: number; max: number };
    starRatings: number[];
    amenities: HotelAmenity[];
    neighborhoods: string[];
    hotelChains: string[];
  };
}

// Hotel booking request
export interface HotelBookingRequest {
  offerId: string;
  guests: {
    roomNumber: number;
    adults: {
      firstName: string;
      lastName: string;
      email?: string;
    }[];
    children?: {
      firstName: string;
      lastName: string;
      age: number;
    }[];
  }[];
  contactInfo: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
  paymentInfo: {
    method: "credit_card" | "debit_card" | "paypal";
    token: string;
  };
  specialRequests?: string[];
}

// Hotel booking response
export interface HotelBookingResponse {
  bookingId: string;
  confirmationNumber: string;
  status: "confirmed" | "pending" | "failed";
  hotel: HotelOffer;
  guests: HotelBookingRequest["guests"];
  totalPrice: Money;
  paymentStatus: "paid" | "pending" | "failed";
  bookingDate: string;
  cancellationDeadline?: string;
}
