import type { Amenity, PaginatedResponse } from "@/types/api"
import { apiClient } from "@/lib/api-client"

export class AmenityService {
  private static readonly BASE_PATH = "/api/hotels/backoffice/amenities"

  /**
   * Get all amenities with pagination
   */
  static async getAmenities(params?: {
    page?: number
    size?: number
    search?: string
    sortBy?: string
    sortDirection?: string
  }): Promise<PaginatedResponse<Amenity>> {
    const queryParams = new URLSearchParams()
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString())
    if (params?.size !== undefined) queryParams.append('size', params.size.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection)
    
    const queryString = queryParams.toString()
    const url = `${this.BASE_PATH}${queryString ? `?${queryString}` : ''}`
    
    return await apiClient.get<PaginatedResponse<Amenity>>(url)
  }

  /**
   * Get all active amenities (no pagination)
   */
  static async getActiveAmenities(): Promise<Amenity[]> {
    try {
      const response = await apiClient.get<{ amenities: Amenity[], total: number }>(
        `${this.BASE_PATH}/active`
      )
      return response?.amenities || []
    } catch (error) {
      console.error("Error fetching active amenities:", error)
      return []
    }
  }

  /**
   * Get amenity by ID
   */
  static async getAmenity(id: number): Promise<Amenity> {
    return await apiClient.get<Amenity>(`${this.BASE_PATH}/${id}`)
  }

  /**
   * Create a new amenity
   */
  static async createAmenity(
    amenity: Omit<Amenity, "id" | "createdAt" | "updatedAt"> & { images?: string[] }
  ): Promise<Amenity> {
    const response = await apiClient.post<{ amenity: Amenity }>(
      this.BASE_PATH,
      amenity
    )
    return response.amenity
  }

  /**
   * Update an existing amenity
   */
  static async updateAmenity(
    id: number,
    amenity: Partial<Amenity> & { images?: string[] }
  ): Promise<Amenity> {
    const response = await apiClient.put<{ amenity: Amenity }>(
      `${this.BASE_PATH}/${id}`,
      amenity
    )
    return response.amenity
  }

  /**
   * Delete an amenity
   */
  static async deleteAmenity(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`)
  }

  /**
   * Toggle amenity status
   */
  static async toggleAmenityStatus(
    id: number,
    isActive: boolean
  ): Promise<Amenity> {
    const response = await apiClient.patch<{ amenity: Amenity }>(
      `${this.BASE_PATH}/${id}/status?isActive=${isActive}`,
      {}
    )
    return response.amenity
  }

  /**
   * Update display order for multiple amenities
   */
  static async updateDisplayOrder(amenityIds: number[]): Promise<void> {
    await apiClient.patch(
      `${this.BASE_PATH}/reorder`,
      { amenityIds }
    )
  }

  /**
   * Get amenities by IDs
   */
  static async getAmenitiesByIds(ids: number[]): Promise<Amenity[]> {
    const response = await apiClient.post<{ amenities: Amenity[], total: number }>(
      `${this.BASE_PATH}/by-ids`,
      { ids }
    )
    return response.amenities
  }
}
