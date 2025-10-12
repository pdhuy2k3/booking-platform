import type { HotelDetails, RoomDetails, HotelSearchParams, HotelSearchResponse, InitialHotelData, SearchResponse, DestinationSearchResult } from "../type"
import { apiClient } from '@/lib/api-client';
import { mapboxService } from '../../mapbox';

const HOTEL_API_BASE = "/hotels/storefront";

export const hotelService = {
  search(params: HotelSearchParams) {
    return apiClient.get<HotelSearchResponse>('/hotels/storefront/search', { params })
  },
  getRoomDetails(id: string | number) {
    return apiClient.get<RoomDetails>(`/hotels/storefront/rooms/${encodeURIComponent(String(id))}`)
  },
  get(id: string | number, checkInDate?: string, checkOutDate?: string) {
    const params = new URLSearchParams()
    if (checkInDate) {
      params.append('checkInDate', checkInDate)
    }
    if (checkOutDate) {
      params.append('checkOutDate', checkOutDate)
    }
    const queryString = params.toString()
    return apiClient.get<HotelDetails>(`/hotels/storefront/${encodeURIComponent(String(id))}${queryString ? `?${queryString}` : ''}`)
  },
  
  async searchDestinations(search: string): Promise<SearchResponse<DestinationSearchResult>> {
    try {
      // Use mapbox client service (calls API route)
      const response = await mapboxService.searchDestinations(search, 20);

      return {
        results: response.results.map(dest => ({
          name: dest.name,
          type: dest.type,
          country: dest.country,
          category: dest.category,
          iataCode: dest.id || '',
          description: dest.description,
          latitude: dest.latitude,
          longitude: dest.longitude,
          relevanceScore: dest.relevanceScore,
        })),
        totalCount: response.totalCount,
        query: response.query || search,
        limit: response.limit,
        page: response.page,
        hasMore: response.hasMore,
        metadata: response.metadata,
      };
    } catch (error) {
      console.error('Error searching destinations with mapbox, falling back to backend:', error);

      const backendResponse = await apiClient.get<SearchResponse<DestinationSearchResult>>('/hotels/storefront/destinations/search', {
        params: { search }
      });
      return backendResponse;
    }
  },

  async getPopularDestinations(): Promise<SearchResponse<DestinationSearchResult>> {
    try {
      const response = await mapboxService.getPopularDestinations();

      return {
        results: response.results.map(dest => ({
          name: dest.name,
          type: dest.type,
          country: dest.country,
          category: dest.category,
          iataCode: dest.id || '',
          description: dest.description,
          latitude: dest.latitude,
          longitude: dest.longitude,
          relevanceScore: dest.relevanceScore,
        })),
        totalCount: response.totalCount,
        query: '',
        metadata: response.metadata,
      };
    } catch (error) {
      console.error('Error getting popular destinations with mapbox, falling back to backend:', error);

      const backendResponse = await apiClient.get<SearchResponse<DestinationSearchResult>>('/hotels/storefront/destinations/popular');
      return backendResponse;
    }
  }
}

export type { HotelSearchParams, HotelSearchResponse, HotelDetails, RoomDetails, InitialHotelData }

// Export components
export { HotelCard } from "../component/HotelCard"
export { HotelCardCompact } from "../component/HotelCardCompact"
export { HotelCardSkeleton } from "../component/HotelCardSkeleton"
export { default as HotelDetailsModal } from "../component/HotelDetailsModal"
