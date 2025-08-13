import { ContactInfo } from './common';

// Hotel related types
export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  amenities: string[];
  rooms: Room[];
  images: string[];
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  type: string;
  price: number;
  currency: string;
  capacity: number;
  amenities: string[];
  available: boolean;
  images?: string[];
}

export interface HotelSearchRequest {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  minRating?: number;
  maxPrice?: number;
  amenities?: string[];
}

export interface HotelSearchResponse {
  hotels: Hotel[];
  total: number;
}

export interface HotelBookingRequest {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: GuestInfo[];
  contactInfo: ContactInfo;
  specialRequests?: string;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  age?: number;
}
