import { Location, Money } from "./common";
import { FlightOffer } from "./flight";
import { HotelOffer } from "./hotel";

// Package search request
export interface PackageSearchRequest {
  origin: string; // Departure city/airport
  destination: string; // Destination city
  departureDate: string; // YYYY-MM-DD
  returnDate: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  rooms: {
    adults: number;
    children: number;
    childrenAges?: number[];
  }[];
  preferences?: {
    flightClass?: "economy" | "premium-economy" | "business" | "first";
    hotelCategory?: number[]; // Star ratings
    packageType?: "flight_hotel" | "flight_hotel_car" | "all_inclusive";
  };
}

// Activity/Excursion
export interface Activity {
  id: string;
  name: string;
  description: string;
  category: "sightseeing" | "adventure" | "cultural" | "food" | "entertainment" | "relaxation";
  duration: number; // in hours
  location: Location;
  images: string[];
  price: Money;
  rating: {
    overall: number;
    reviews: number;
  };
  availability: {
    dates: string[]; // Available dates
    times: string[]; // Available times
  };
  included: string[];
  requirements: {
    minAge?: number;
    maxAge?: number;
    fitnessLevel?: "low" | "moderate" | "high";
    restrictions?: string[];
  };
  cancellationPolicy: {
    refundable: boolean;
    deadline?: string;
    fee?: Money;
  };
}

// Car rental
export interface CarRental {
  id: string;
  vendor: {
    name: string;
    logo?: string;
  };
  vehicle: {
    category: "economy" | "compact" | "midsize" | "fullsize" | "luxury" | "suv" | "van";
    make: string;
    model: string;
    year: number;
    transmission: "manual" | "automatic";
    fuelType: "gasoline" | "diesel" | "electric" | "hybrid";
    seats: number;
    doors: number;
    airConditioning: boolean;
    image?: string;
  };
  pickup: {
    location: Location;
    dateTime: string;
  };
  dropoff: {
    location: Location;
    dateTime: string;
  };
  price: {
    total: Money;
    perDay: Money;
    taxes: Money;
    fees: Money[];
  };
  mileage: {
    included: number; // miles/km per day
    unlimited: boolean;
    extraFee?: Money; // per mile/km
  };
  insurance: {
    basic: boolean;
    collision?: Money;
    theft?: Money;
    liability?: Money;
  };
  requirements: {
    minAge: number;
    licenseRequired: boolean;
    creditCardRequired: boolean;
  };
}

// Package offer
export interface PackageOffer {
  id: string;
  name: string;
  description: string;
  type: "flight_hotel" | "flight_hotel_car" | "all_inclusive";
  destination: Location;
  duration: number; // nights
  images: string[];
  
  components: {
    flights: FlightOffer;
    hotel: HotelOffer;
    car?: CarRental;
    activities?: Activity[];
    transfers?: {
      airport: boolean;
      local: boolean;
      description: string;
    };
    meals?: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
      allInclusive: boolean;
      description: string;
    };
  };
  
  price: {
    total: Money;
    savings: Money; // vs booking separately
    breakdown: {
      flights: Money;
      hotel: Money;
      car?: Money;
      activities?: Money;
      transfers?: Money;
      meals?: Money;
    };
  };
  
  inclusions: string[];
  exclusions: string[];
  
  rating: {
    overall: number;
    reviews: number;
  };
  
  cancellationPolicy: {
    refundable: boolean;
    deadline?: string;
    fee?: Money;
    componentPolicies: {
      flights: string;
      hotel: string;
      car?: string;
    };
  };
  
  availability: {
    available: boolean;
    spotsLeft?: number;
    lastBookingDate?: string;
  };
}

// Package search response
export interface PackageSearchResponse {
  offers: PackageOffer[];
  meta: {
    count: number;
    searchId: string;
    currency: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    nights: number;
  };
  filters: {
    priceRange: { min: number; max: number };
    packageTypes: string[];
    hotelCategories: number[];
    activities: string[];
    mealPlans: string[];
  };
}

// Package booking request
export interface PackageBookingRequest {
  offerId: string;
  passengers: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    type: "adult" | "child" | "infant";
    passportNumber?: string;
    passportExpiry?: string;
  }[];
  hotelGuests: {
    roomNumber: number;
    adults: {
      firstName: string;
      lastName: string;
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
  preferences?: {
    seatPreferences?: string[];
    mealPreferences?: string[];
    specialRequests?: string[];
  };
}

// Package booking response
export interface PackageBookingResponse {
  bookingId: string;
  confirmationNumber: string;
  status: "confirmed" | "pending" | "failed";
  package: PackageOffer;
  passengers: PackageBookingRequest["passengers"];
  totalPrice: Money;
  paymentStatus: "paid" | "pending" | "failed";
  bookingDate: string;
  vouchers: {
    type: "flight" | "hotel" | "car" | "activity";
    confirmationNumber: string;
    voucherUrl: string;
  }[];
}
