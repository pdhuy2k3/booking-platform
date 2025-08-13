import { ContactInfo } from './common';

// Flight related types
export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  price: number;
  currency: string;
  totalSeats: number;
  availableSeats: number;
  status: "ACTIVE" | "CANCELLED" | "DELAYED";
  createdAt: string;
  updatedAt: string;
}

export interface FlightSearchRequest {
  departure: string;
  arrival: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  class?: "ECONOMY" | "BUSINESS" | "FIRST";
}

export interface FlightSearchResponse {
  flights: Flight[];
  total: number;
}

export interface FlightBookingRequest {
  flightId: string;
  passengers: PassengerInfo[];
  contactInfo: ContactInfo;
}

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "M" | "F";
  nationality: string;
  passportNumber?: string;
  seatPreference?: string;
}
