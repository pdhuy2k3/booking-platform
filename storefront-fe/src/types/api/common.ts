// Common API types used across all services

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  timestamp?: string;
}

// Location types
export interface Location {
  id: string;
  name: string;
  code: string; // Airport/city code
  type: "airport" | "city" | "country";
  country: string;
  countryCode: string;
  timezone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Money/Currency types
export interface Money {
  amount: number;
  currency: string;
}

// Date range
export interface DateRange {
  startDate: string;
  endDate: string;
}

// Passenger types
export interface Passenger {
  id?: string;
  type: "adult" | "child" | "infant";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
}

// Contact information
export interface ContactInfo {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

// Address
export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Base search filters
export interface BaseSearchFilters {
  priceRange?: {
    min?: number;
    max?: number;
  };
}

// Flight-specific filters
export interface FlightFilters extends BaseSearchFilters {
  duration?: {
    min?: number; // in minutes
    max?: number;
  };
  stops?: number[];
  airlines?: string[];
  departureTime?: {
    earliest?: string; // HH:mm format
    latest?: string;
  };
  arrivalTime?: {
    earliest?: string;
    latest?: string;
  };
  airports?: {
    departure?: string[];
    arrival?: string[];
  };
  aircraft?: string[];
  class?: ("economy" | "premium-economy" | "business" | "first")[];
}

// Hotel-specific filters
export interface HotelFilters extends BaseSearchFilters {
  starRating?: number[];
  amenities?: string[];
  hotelChains?: string[];
  neighborhoods?: string[];
  propertyTypes?: ("hotel" | "resort" | "apartment" | "villa" | "hostel")[];
  boardTypes?: ("room_only" | "breakfast" | "half_board" | "full_board" | "all_inclusive")[];
  guestRating?: {
    min?: number; // 1-10 scale
  };
  distanceFromCenter?: {
    max?: number; // in km
  };
}

// Package-specific filters
export interface PackageFilters extends BaseSearchFilters {
  packageTypes?: ("flight_hotel" | "flight_hotel_car" | "all_inclusive")[];
  hotelStarRating?: number[];
  flightClass?: ("economy" | "premium-economy" | "business" | "first")[];
  activities?: string[];
  mealPlans?: ("none" | "breakfast" | "half_board" | "full_board" | "all_inclusive")[];
  duration?: {
    min?: number; // nights
    max?: number;
  };
}

// Union type for all search filters
export type SearchFilters = FlightFilters | HotelFilters | PackageFilters;

// Sort options
export type SortOption = 
  | "price_asc"
  | "price_desc"
  | "duration_asc"
  | "duration_desc"
  | "departure_asc"
  | "departure_desc"
  | "arrival_asc"
  | "arrival_desc"
  | "popularity"
  | "rating";

export interface SearchParams {
  page?: number;
  limit?: number;
  sort?: SortOption;
  filters?: SearchFilters;
}
