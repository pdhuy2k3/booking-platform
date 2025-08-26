import type { RoomType } from "@/types/api"
import { apiClient } from "@/lib/api-client"

export class RoomTypeService {
  private static readonly BASE_PATH = "/api/hotels/backoffice"

  /**
   * Get all room types for a hotel
   */
  static async getRoomTypesByHotel(hotelId: number): Promise<RoomType[]> {
    const response = await apiClient.get<{ roomTypes: RoomType[] }>(
      `${this.BASE_PATH}/room-types/${hotelId}/hotel`
    )
    return response.roomTypes
  }

  /**
   * Get room type details by ID
   */
  static async getRoomType(id: number): Promise<RoomType> {
    const response = await apiClient.get<{ roomType: RoomType }>(
      `${this.BASE_PATH}/room-types/${id}`
    )
    return response.roomType
  }

  /**
   * Get suitable room types for a specific number of guests
   */
  static async getSuitableRoomTypes(
    hotelId: number, 
    guestCount: number
  ): Promise<RoomType[]> {
    const response = await apiClient.get<{ roomTypes: RoomType[] }>(
      `${this.BASE_PATH}/room-types/${hotelId}/suitable?guestCount=${guestCount}`
    )
    return response.roomTypes
  }

  /**
   * Create a new room type for a hotel
   */
  static async createRoomType(
    hotelId: number,
    roomType: Omit<RoomType, "id" | "createdAt" | "updatedAt">
  ): Promise<RoomType> {
    const response = await apiClient.post<{ roomType: RoomType }>(
      `${this.BASE_PATH}/room-types/${hotelId}`,
      roomType
    )
    return response.roomType
  }

  /**
   * Update an existing room type
   */
  static async updateRoomType(
    id: number,
    roomType: Partial<RoomType>
  ): Promise<RoomType> {
    const response = await apiClient.put<{ roomType: RoomType }>(
      `${this.BASE_PATH}/room-types/${id}`,
      roomType
    )
    return response.roomType
  }

  /**
   * Delete a room type
   */
  static async deleteRoomType(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/room-types/${id}`)
  }
}
