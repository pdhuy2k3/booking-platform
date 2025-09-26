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
}
