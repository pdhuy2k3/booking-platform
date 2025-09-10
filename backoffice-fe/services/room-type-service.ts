import type { RoomType, MediaResponse, ApiResponse } from "@/types/api"
import { apiClient } from "@/lib/api-client"

export class RoomTypeService {
  private static readonly BASE_PATH = "/api/hotels/backoffice"

  /**
   * Get all room types for a hotel
   */
  static async getRoomTypesByHotel(hotelId: number): Promise<RoomType[]> {
    try {
      const response = await apiClient.get<ApiResponse<{
        roomTypes: RoomType[];
        total: number;
      }>>(
        `${this.BASE_PATH}/room-types/${hotelId}/hotel`
      )
      return response?.data?.roomTypes || []
    } catch (error) {
      console.error("Error fetching room types:", error)
      return []
    }
  }

  /**
   * Get room type details by ID
   */
  static async getRoomType(id: number): Promise<RoomType> {
    try {
      const response = await apiClient.get<ApiResponse<{ roomType: RoomType }>>(
        `${this.BASE_PATH}/room-types/${id}`
      )
      return response?.data?.roomType || ({} as RoomType)
    } catch (error) {
      console.error("Error fetching room type:", error)
      return {} as RoomType
    }
  }

  /**
   * Get suitable room types for a specific number of guests
   */
  static async getSuitableRoomTypes(
    hotelId: number, 
    guestCount: number
  ): Promise<RoomType[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ roomTypes: RoomType[] }>>(
        `${this.BASE_PATH}/room-types/${hotelId}/suitable?guestCount=${guestCount}`
      )
      return response?.data?.roomTypes || []
    } catch (error) {
      console.error("Error fetching suitable room types:", error)
      return []
    }
  }

  /**
   * Create a new room type for a hotel
   */
  static async createRoomType(
    hotelId: number,
    roomType: Omit<RoomType, "id" | "createdAt" | "updatedAt"> & { media?: MediaResponse[] }
  ): Promise<RoomType> {
    try {
      const response = await apiClient.post<ApiResponse<{ roomType: RoomType }>>(
        `${this.BASE_PATH}/room-types/${hotelId}`,
        roomType
      )
      return response?.data?.roomType || ({} as RoomType)
    } catch (error) {
      console.error("Error creating room type:", error)
      return {} as RoomType
    }
  }

  /**
   * Update an existing room type
   */
  static async updateRoomType(
    id: number,
    roomType: Partial<RoomType> & { media?: MediaResponse[] }
  ): Promise<RoomType> {
    try {
      const response = await apiClient.put<ApiResponse<{ roomType: RoomType }>>(
        `${this.BASE_PATH}/room-types/${id}`,
        roomType
      )
      return response?.data?.roomType || ({} as RoomType)
    } catch (error) {
      console.error("Error updating room type:", error)
      return {} as RoomType
    }
  }

  /**
   * Delete a room type
   */
  static async deleteRoomType(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/room-types/${id}`)
  }
}
