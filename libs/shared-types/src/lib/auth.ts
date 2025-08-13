// Authentication and User Types
export interface UserInfo {
  sub: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  partnerType?: "HOTEL" | "FLIGHT" | "TRANSPORT" | "ALL";
  partnerServices?: string[];
}

export interface PartnerPermissions {
  canManageHotels: boolean;
  canManageFlights: boolean;
  canManageTransport: boolean;
  canViewAllBookings: boolean;
  canViewOwnBookings: boolean;
  canManagePayments: boolean;
  canViewReports: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: UserInfo;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}
