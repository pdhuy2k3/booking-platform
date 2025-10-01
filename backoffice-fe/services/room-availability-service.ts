import { apiClient } from "@/lib/api-client"
import type { ApiResponse, RoomAvailabilityResponse, RoomAvailabilityUpdate } from "@/types/api"

const BASE_PATH = "/api/hotels/backoffice"

export class RoomAvailabilityService {
  static async getAvailability(
    hotelId: number,
    roomTypeId: number,
    params?: { startDate?: string; endDate?: string }
  ): Promise<RoomAvailabilityResponse> {
    const queryParams = new URLSearchParams()

    if (params?.startDate) {
      queryParams.append("startDate", params.startDate)
    }
    if (params?.endDate) {
      queryParams.append("endDate", params.endDate)
    }

    const queryString = queryParams.toString()
    const url = `${BASE_PATH}/hotels/${hotelId}/room-types/${roomTypeId}/availability${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.get<ApiResponse<RoomAvailabilityResponse>>(url)
    return response.data
  }

  static async updateAvailability(
    hotelId: number,
    roomTypeId: number,
    payload: RoomAvailabilityUpdate[]
  ): Promise<RoomAvailabilityResponse> {
    const url = `${BASE_PATH}/hotels/${hotelId}/room-types/${roomTypeId}/availability`
    const response = await apiClient.put<ApiResponse<RoomAvailabilityResponse>>(url, payload)
    return response.data
  }

  static async generateRandomAvailability(
    hotelId: number,
    roomTypeId: number,
    params?: {
      startDate?: string
      endDate?: string
      minInventory?: number
      maxInventory?: number
      minReserved?: number
      maxReserved?: number
    }
  ): Promise<RoomAvailabilityResponse> {
    const queryParams = new URLSearchParams()

    if (params?.startDate) {
      queryParams.append('startDate', params.startDate)
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate)
    }
    if (params?.minInventory != null) {
      queryParams.append('minInventory', params.minInventory.toString())
    }
    if (params?.maxInventory != null) {
      queryParams.append('maxInventory', params.maxInventory.toString())
    }
    if (params?.minReserved != null) {
      queryParams.append('minReserved', params.minReserved.toString())
    }
    if (params?.maxReserved != null) {
      queryParams.append('maxReserved', params.maxReserved.toString())
    }

    const queryString = queryParams.toString()
    const url = `${BASE_PATH}/hotels/${hotelId}/room-types/${roomTypeId}/availability/generate${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.post<ApiResponse<RoomAvailabilityResponse>>(url)
    return response.data
  }
}
