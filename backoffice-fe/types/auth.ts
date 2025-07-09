export interface UserInfo {
  sub: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
  partnerType?: "HOTEL" | "FLIGHT" | "TRANSPORT" | "ALL" // Loại đối tác
  partnerServices?: string[] // Các dịch vụ được phép quản lý
}

export interface PartnerPermissions {
  canManageHotels: boolean
  canManageFlights: boolean
  canManageTransport: boolean
  canViewAllBookings: boolean
  canViewOwnBookings: boolean
  canManagePayments: boolean
  canViewReports: boolean
}
