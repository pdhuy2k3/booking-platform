import type { Hotel, PaginatedResponse } from "@/types/api"
import { apiClient } from "@/lib/api-client"

export class HotelService {
  private static readonly BASE_PATH = "/api/hotels/backoffice/hotels"

  static async getHotels(params?: {
    page?: number
    size?: number
    search?: string
    city?: string
  }): Promise<PaginatedResponse<Hotel>> {
    const queryParams = new URLSearchParams()
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString())
    if (params?.size !== undefined) queryParams.append('size', params.size.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.city) queryParams.append('city', params.city)
    
    const queryString = queryParams.toString()
    const url = `${this.BASE_PATH}${queryString ? `?${queryString}` : ''}`
    
    return await apiClient.get<PaginatedResponse<Hotel>>(url)

  }

  static async getHotel(id: number): Promise<Hotel> {
    return  await apiClient.get<Hotel>(`${this.BASE_PATH}/${id}`)

  }

  static async createHotel(hotel: Omit<Hotel, "id" | "createdAt" | "updatedAt" | "availableRooms" | "minPrice"> & { images?: string[] }): Promise<Hotel> {
    return  await apiClient.post<Hotel>(this.BASE_PATH, hotel)

  }

  static async updateHotel(id: number, hotel: Partial<Hotel> & { images?: string[] }): Promise<Hotel> {
    return await apiClient.put<Hotel>(`${this.BASE_PATH}/${id}`, hotel)

  }

  static async deleteHotel(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`)
  }

  static async updateHotelAmenities(hotelId: number, amenityIds: number[]): Promise<Hotel> {
    return await apiClient.put<Hotel>(`${this.BASE_PATH}/${hotelId}/amenities`, {
      amenityIds
    })
  }
}
