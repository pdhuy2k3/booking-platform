import { filterBookings } from "@/lib/mock-data"
import type { Booking, PaginatedResponse } from "@/types/api"

export class BookingService {
  private static readonly BASE_PATH = "/api/bookings" // TODO: Update when BFF is ready

  static async getBookings(params?: {
    page?: number
    size?: number
    search?: string
    status?: string
    type?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<PaginatedResponse<Booking>> {
    // TODO: Replace with real API call
    // const searchParams = new URLSearchParams()
    // if (params?.page) searchParams.append("page", params.page.toString())
    // if (params?.size) searchParams.append("size", params.size.toString())
    // if (params?.search) searchParams.append("search", params.search)
    // if (params?.status) searchParams.append("status", params.status)
    // if (params?.type) searchParams.append("type", params.type)
    // if (params?.dateFrom) searchParams.append("dateFrom", params.dateFrom)
    // if (params?.dateTo) searchParams.append("dateTo", params.dateTo)
    // return apiClient.get<PaginatedResponse<Booking>>(`${this.BASE_PATH}?${searchParams.toString()}`)

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 600))
    return filterBookings(params || {})
  }

  static async getBooking(id: string): Promise<Booking> {
    // TODO: Replace with real API call
    // return apiClient.get<Booking>(`${this.BASE_PATH}/${id}`)

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500))
    const bookings = filterBookings({})
    const booking = bookings.content.find((b) => b.id === id)
    if (!booking) throw new Error("Booking not found")
    return booking
  }

  static async updateBookingStatus(id: string, status: Booking["status"]): Promise<Booking> {
    // TODO: Replace with real API call
    // return apiClient.put<Booking>(`${this.BASE_PATH}/${id}/status`, { status })

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 800))
    const booking = await this.getBooking(id)
    const updatedBooking = { ...booking, status, updatedAt: new Date().toISOString() }
    console.log("Mock: Updated booking status", updatedBooking)
    return updatedBooking
  }

  static async cancelBooking(id: string, reason?: string): Promise<Booking> {
    // TODO: Replace with real API call
    // return apiClient.put<Booking>(`${this.BASE_PATH}/${id}/cancel`, { reason })

    // Mock implementation
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
