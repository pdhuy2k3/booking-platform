
import type { HotelDetails, RoomDetails, HotelSearchParams, HotelSearchResponse, InitialHotelData, SearchResponse, DestinationSearchResult } from "../type"
import { apiClient } from '@/lib/api-client';
import { destinationService } from '../../destination/service';

export const hotelService = {
  search(params: HotelSearchParams) {
    return apiClient.get<HotelSearchResponse>('/hotels/storefront/search', { params })
  },
  getRoomDetails(id: string | number) {
    return apiClient.get<RoomDetails>(`/hotels/storefront/rooms/${encodeURIComponent(String(id))}`)
  },
  get(id: string | number) {
    return apiClient.get<HotelDetails>(`/hotels/storefront/${encodeURIComponent(String(id))}`)
  },
  
  // Use the new destination service for better Vietnamese administrative units integration
  async searchDestinations(search?: string) {
    try {
      // Use the Vietnamese Administrative Units API for better accuracy
      return await destinationService.searchDestinations(search, 20);
    } catch (error) {
      console.error('Error searching destinations with new service, falling back to backend:', error);
      // Fallback to backend API if the new service fails
      const response = await apiClient.get<SearchResponse<DestinationSearchResult>>('/hotels/storefront/destinations/search', {
        params: { q: search }
      });
      return response;
    }
  },
  
  async getPopularDestinations() {
    try {
      // Use the Vietnamese Administrative Units API for better accuracy
      return await destinationService.getPopularDestinations();
    } catch (error) {
      console.error('Error getting popular destinations with new service, falling back to backend:', error);
      // Fallback to backend API if the new service fails
      const response = await apiClient.get<SearchResponse<DestinationSearchResult>>('/hotels/storefront/destinations/popular');
      return response;
    }
  }
}

export type { HotelSearchParams, HotelSearchResponse, HotelDetails, RoomDetails, InitialHotelData }

// Export components
export { HotelCard } from "../component/HotelCard"
export { HotelCardCompact } from "../component/HotelCardCompact"
export { HotelCardSkeleton } from "../component/HotelCardSkeleton"
export { default as HotelDetailsModal } from "../component/HotelDetailsModal"
