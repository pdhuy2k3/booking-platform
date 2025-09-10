import type { Room, PaginatedResponse, MediaResponse, ApiResponse } from "@/types/api"
import { apiClient } from "@/lib/api-client"

export class RoomService {
  private static readonly BASE_PATH = "/api/hotels/backoffice"

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
    const url = `${this.BASE_PATH}/rooms/${hotelId}/rooms${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get<ApiResponse<{
      rooms: Room[]
      totalElements: number
      totalPages: number
      size: number
      number: number
      first: boolean
      last: boolean
    }>>(url)
    
    return {
      content: response?.data?.rooms || [],
      totalElements: response?.data?.totalElements || 0,
      totalPages: response?.data?.totalPages || 0,
      size: response?.data?.size || 0,
      number: response?.data?.number || 0,
      first: response?.data?.first || false,
      last: response?.data?.last || false
    }
  }

  /**
   * Get room details by ID
   */
  static async getRoom(id: number): Promise<Room> {
    const response = await apiClient.get<ApiResponse<{ room: Room }>>(`${this.BASE_PATH}/rooms/${id}`)
    return response.data.room
  }

  /**
   * Create a new room for a hotel
   */
  static async createRoom(
    hotelId: number,
    room: Omit<Room, "id" | "hotelId" | "hotelName" | "createdAt" | "updatedAt"> & { media?: MediaResponse[] }
  ): Promise<Room> {
    // Prepare the room data, ensuring media is sent instead of images
    const roomData = {
      ...room,
      // Remove images field if present, use media instead
      images: undefined
    }

    const response = await apiClient.post<ApiResponse<{ room: Room; message: string }>>(
      `${this.BASE_PATH}/rooms/${hotelId}/rooms`,
      roomData
    )
    return response.data.room
  }

  /**
   * Update an existing room
   */
  static async updateRoom(
    id: number,
    room: Partial<Room> & { media?: MediaResponse[] }
  ): Promise<Room> {
    // Prepare the room data, ensuring media is sent instead of images
    const roomData = {
      ...room,
      // Remove images field if present, use media instead
      images: undefined
    }

    const response = await apiClient.put<ApiResponse<{ room: Room; message: string }>>(
      `${this.BASE_PATH}/rooms/${id}`,
      roomData
    )
    return response.data.room
  }

  /**
   * Delete a room
   */
  static async deleteRoom(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/rooms/${id}`)
  }

  /**
   * Toggle room availability
   */
  static async toggleRoomAvailability(
    id: number,
    isAvailable: boolean
  ): Promise<Room> {
    const response = await apiClient.patch<ApiResponse<{ room: Room; message: string }>>(
      `${this.BASE_PATH}/rooms/${id}/availability?isAvailable=${isAvailable}`,
      {}
    )
    return response.data.room
  }

  /**
   * Bulk update room availability
   */
  static async bulkUpdateAvailability(
    roomIds: number[],
    isAvailable: boolean
  ): Promise<void> {
    await apiClient.patch(
      `${this.BASE_PATH}/rooms/bulk-availability`,
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
      `${this.BASE_PATH}/hotels/${hotelId}/rooms/count`
    )
    return response.availableRooms
  }
}
