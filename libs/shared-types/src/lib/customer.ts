// Customer related types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  nationality?: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  totalBookings: number;
  totalSpent: number;
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  createdAt: string;
  lastLoginAt?: string;
}

export interface CustomerRegistration {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  nationality?: string;
  preferences?: {
    preferredAirline?: string;
    preferredSeatType?: string;
    dietaryRestrictions?: string[];
    newsletterSubscribed?: boolean;
  };
}
