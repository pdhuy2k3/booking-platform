"use client"

import { useAuth } from "@/hooks/use-auth"
import type { PartnerPermissions } from "@/types/auth"

export function usePartnerPermissions(): PartnerPermissions {
  const { user } = useAuth()

  if (!user || !user.roles.includes("partner")) {
    return {
      canManageHotels: false,
      canManageFlights: false,
      canManageTransport: false,
      canViewAllBookings: false,
      canViewOwnBookings: false,
      canManagePayments: false,
      canViewReports: false,
    }
  }

  const partnerType = user.partnerType || "ALL"
  const services = user.partnerServices || []

  return {
    canManageHotels: partnerType === "ALL" || partnerType === "HOTEL" || services.includes("hotels"),
    canManageFlights: partnerType === "ALL" || partnerType === "FLIGHT" || services.includes("flights"),
    canManageTransport: partnerType === "ALL" || partnerType === "TRANSPORT" || services.includes("transport"),
    canViewAllBookings: partnerType === "ALL",
    canViewOwnBookings: true, // Tất cả partner đều xem được booking của mình
    canManagePayments: user.permissions.includes("manage:payments"),
    canViewReports: user.permissions.includes("view:reports"),
  }
}
