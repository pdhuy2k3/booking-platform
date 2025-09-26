import { apiClient } from "@/lib/api-client"
import { filterBookings } from "@/lib/mock-data"
import type { Booking, PaginatedResponse } from "@/types/api"

export class BookingService {
  private static readonly BASE_PATH = "/api/bookings/backoffice/bookings"

  static async getBookings(params?: {
    page?: number
    size?: number
    search?: string
    status?: string
    type?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<PaginatedResponse<Booking>> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.page !== undefined) searchParams.append("page", (params.page - 1).toString()) // API uses 0-based indexing
      if (params?.size) searchParams.append("size", params.size.toString())
      if (params?.status && params.status !== "all") searchParams.append("status", params.status)
      if (params?.type && params.type !== "all") searchParams.append("bookingType", params.type)
      if (params?.dateFrom) searchParams.append("startDate", params.dateFrom)
      if (params?.dateTo) searchParams.append("endDate", params.dateTo)
      
      const url = `${this.BASE_PATH}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      
      const response = await apiClient.get<PaginatedResponse<Booking>>(url)
      
      // Transform Spring Boot Page to our PaginatedResponse format
      return {
        content: response.content,
        number: response.number + 1, // Convert from 0-based to 1-based
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        first: response.first,
        last: response.last
      }
    } catch (error) {
      console.warn("Failed to fetch bookings from API, falling back to mock data:", error)
      // Fallback to mock implementation
      await new Promise((resolve) => setTimeout(resolve, 600))
      return filterBookings(params || {})
    }
  }

  static async searchBookings(searchTerm: string, params?: {
    page?: number
    size?: number
  }): Promise<PaginatedResponse<Booking>> {
    try {
      const searchParams = new URLSearchParams()
      searchParams.append("q", searchTerm)
      if (params?.page !== undefined) searchParams.append("page", (params.page - 1).toString())
      if (params?.size) searchParams.append("size", params.size.toString())
      
      const response = await apiClient.get<PaginatedResponse<Booking>>(`${this.BASE_PATH}/search?${searchParams.toString()}`)
      
      return {
        content: response.content,
        number: response.number + 1,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        first: response.first,
        last: response.last
      }
    } catch (error) {
      console.warn("Failed to search bookings from API, falling back to mock data:", error)
      await new Promise((resolve) => setTimeout(resolve, 600))
      return filterBookings({ search: searchTerm, ...params })
    }
  }

  static async getBooking(id: string): Promise<Booking> {
    try {
      const response = await apiClient.get<Booking>(`${this.BASE_PATH}/${id}`)
      return response
    } catch (error) {
      console.warn("Failed to fetch booking from API, falling back to mock data:", error)
      // Fallback to mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500))
      const bookings = filterBookings({})
      const booking = bookings.content.find((b) => b.id === id)
      if (!booking) throw new Error("Booking not found")
      return booking
    }
  }

  static async updateBookingStatus(id: string, status: Booking["status"], reason?: string): Promise<Booking> {
    try {
      const params = new URLSearchParams()
      params.append("status", status)
      if (reason) params.append("reason", reason)
      
      const response = await apiClient.put<Booking>(`${this.BASE_PATH}/${id}/status?${params.toString()}`)
      return response
    } catch (error) {
      console.warn("Failed to update booking status via API, using mock response:", error)
      // Fallback to mock implementation
      await new Promise((resolve) => setTimeout(resolve, 800))
      const booking = await this.getBooking(id)
      const updatedBooking = { ...booking, status, updatedAt: new Date().toISOString() }
      console.log("Mock: Updated booking status", updatedBooking)
      return updatedBooking
    }
  }

  static async cancelBooking(id: string, reason?: string): Promise<Booking> {
    try {
      const params = new URLSearchParams()
      if (reason) params.append("reason", reason)
      
      const response = await apiClient.put<Booking>(`${this.BASE_PATH}/${id}/cancel?${params.toString()}`)
      return response
    } catch (error) {
      console.warn("Failed to cancel booking via API, using mock response:", error)
      // Fallback to mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const booking = await this.getBooking(id)
      const cancelledBooking = {
        ...booking,
        status: "CANCELLED" as const,
        paymentStatus: "REFUNDED" as const,
        updatedAt: new Date().toISOString(),
      }
      console.log("Mock: Cancelled booking", cancelledBooking, "Reason:", reason)
      return cancelledBooking
    }
  }

  static async getBookingSummary(startDate?: string, endDate?: string): Promise<BookingSummary> {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      
      const response = await apiClient.get<BookingSummary>(`${this.BASE_PATH}/summary?${params.toString()}`)
      return response
    } catch (error) {
      console.warn("Failed to fetch booking summary from API, using mock data:", error)
      // Fallback to mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500))
      const bookings = filterBookings({})
      
      return {
        totalBookings: bookings.totalElements,
        confirmedBookings: bookings.content.filter(b => b.status === "CONFIRMED").length,
        pendingBookings: bookings.content.filter(b => b.status === "PENDING").length,
        cancelledBookings: bookings.content.filter(b => b.status === "CANCELLED").length,
        totalRevenue: bookings.content.reduce((sum, b) => sum + b.totalAmount, 0),
        typeBreakdown: {
          FLIGHT: bookings.content.filter(b => b.type === "FLIGHT").length,
          HOTEL: bookings.content.filter(b => b.type === "HOTEL").length,
          COMBO: bookings.content.filter(b => b.type === "COMBO").length,
        }
      }
    }
  }
}

// Helper types for Spring Boot Page response


interface BookingSummary {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  totalRevenue: number
  typeBreakdown: {
    FLIGHT: number
    HOTEL: number
    COMBO: number
  }
}
