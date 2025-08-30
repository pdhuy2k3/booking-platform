import type { Room, PaginatedResponse } from "@/types/api"
import { apiClient } from "@/lib/api-client"

export class RoomService {
  private static readonly BASE_PATH = "/api/hotels"

  /**
   * Get all rooms for a hotel with pagination
   */
  static async getRoomsByHotel(
    hotelId: number,
    params?: {
      page?: number
      size?: number
      sortBy?: string
      sortDirection?: string
    }
  ): Promise<PaginatedResponse<Room>> {
    const queryParams = new URLSearchParams()
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString())
    if (params?.size !== undefined) queryParams.append('size', params.size.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection)
    
    const queryString = queryParams.toString()
    const url = `${this.BASE_PATH}/backoffice/rooms/${hotelId}/rooms${queryString ? `?${queryString}` : ''}`
    
    return await apiClient.get<PaginatedResponse<Room>>(url)
  }

  /**
   * Get room details by ID
   */
  static async getRoom(id: number): Promise<Room> {
    return await apiClient.get<Room>(`${this.BASE_PATH}/backoffice/rooms/${id}`)
  }

  /**
   * Create a new room for a hotel
   */
  static async createRoom(
    hotelId: number,
    room: Omit<Room, "id" | "hotelId" | "hotelName" | "createdAt" | "updatedAt">
  ): Promise<Room> {
    const response = await apiClient.post<{ room: Room }>(
      `${this.BASE_PATH}/backoffice/rooms/${hotelId}/rooms`,
      room
    )
    return response.room
  }

  /**
   * Update an existing room
   */
  static async updateRoom(
    id: number,
    room: Partial<Room>
  ): Promise<Room> {
    const response = await apiClient.put<{ room: Room }>(
      `${this.BASE_PATH}/backoffice/rooms/${id}`,
      room
    )
    return response.room
  }

  /**
   * Delete a room
   */
  static async deleteRoom(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/backoffice/rooms/${id}`)
  }

  /**
   * Toggle room availability
   */
  static async toggleRoomAvailability(
    id: number,
    isAvailable: boolean
  ): Promise<Room> {
    const response = await apiClient.patch<{ room: Room }>(
      `${this.BASE_PATH}/backoffice/rooms/${id}/availability?isAvailable=${isAvailable}`,
      {}
    )
    return response.room
  }

  /**
   * Bulk update room availability
   */
  static async bulkUpdateAvailability(
    roomIds: number[],
    isAvailable: boolean
  ): Promise<void> {
    await apiClient.patch(
      `${this.BASE_PATH}/backoffice/rooms/bulk-availability`,
      {
        roomIds,
        isAvailable
      }
    )
  }

  /**
   * Get available rooms count for a hotel
   */
  static async getAvailableRoomsCount(hotelId: number): Promise<number> {
    const response = await apiClient.get<{ availableRooms: number }>(
      `${this.BASE_PATH}/backoffice/hotels/${hotelId}/rooms/count`
    )
    return response.availableRooms
  }
}
