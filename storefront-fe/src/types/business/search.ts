// Search-related types for the storefront
export interface SearchCriteria {
  type: 'flights' | 'hotels' | 'packages';
  origin?: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  checkIn?: Date;
  checkOut?: Date;
  passengers: PassengerCounts;
  rooms?: RoomConfiguration[];
  class?: string;
  tripType?: 'one-way' | 'round-trip';
}

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface RoomConfiguration {
  adults: number;
  children: number;
}

export interface SearchResults {
  flights?: FlightResult[];
  hotels?: HotelResult[];
  packages?: PackageResult[];
  totalCount: number;
  hasMore: boolean;
  searchId: string;
  timestamp: Date;
}

export interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  price: number;
  currency: string;
  stops: number;
  aircraft: string;
  class: string;
}

export interface HotelResult {
  id: string;
  name: string;
  rating: number;
  price: number;
  currency: string;
  location: string;
  amenities: string[];
  images: string[];
  description: string;
}

export interface PackageResult {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  includes: string[];
  flight?: FlightResult;
  hotel?: HotelResult;
}

export interface FilterState {
  priceRange?: PriceRange;
  durationRange?: DurationRange;
  airlines?: string[];
  stops?: number[];
  departureTimeRanges?: Record<string, TimeRange>;
  hotelAmenities?: string[];
  hotelRating?: number;
  accommodationType?: string[];
  hotelStars?: number[];
  amenities?: string[];
  mealTypes?: string[];
  baggageTypes?: string[];
  departureTimeRange?: TimeRange;
  flightClass?: string;
  location?: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface RatingRange {
  min: number;
  max: number;
}

export interface DurationRange {
  min: number;
  max: number;
}

export interface SearchFilters {
  price?: PriceRange;
  airlines?: string[];
  stars?: number[];
  amenities?: string[];
  rating?: RatingRange;
  duration?: DurationRange;
  departureTime?: TimeRange;
  class?: string;
  location?: string;
}
