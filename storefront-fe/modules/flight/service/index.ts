
import type { FlightDetails, FlightFareDetails, FlightSearchParams, FlightSearchResponse, InitialFlightData, SearchResponse, DestinationSearchResult } from "../type"
import { apiClient } from '@/lib/api-client';
import { destinationService } from '../../destination/service';

export const flightService = {
  search(params: FlightSearchParams) {
    // Backend expects: origin, destination, departureDate, returnDate?, passengers, seatClass, page, limit
    return apiClient.get<FlightSearchResponse>(`/flights/storefront/search`, {
      params
    })
  },
  get(id: string) {
    return apiClient.get<FlightDetails>(`/flights/storefront/${encodeURIComponent(id)}`)
  },
  getFareDetails(flightId: string | number, params: { seatClass: string; departureDateTime: string }) {
    return apiClient.get<FlightFareDetails>(`/flights/storefront/${encodeURIComponent(String(flightId))}/fare-details`, {
      params
    })
  },
  // Use the new destination service for better Vietnamese administrative units integration
  async searchAirports(search?: string) {
    try {
      // Use the Vietnamese Administrative Units API for better accuracy
      return await destinationService.searchDestinations(search, 20);
    } catch (error) {
      console.error('Error searching airports with new service, falling back to backend:', error);
      // Fallback to backend API if the new service fails
      const response = await apiClient.get<SearchResponse<DestinationSearchResult>>('/flights/storefront/airports/search', {
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
      const response = await apiClient.get<SearchResponse<DestinationSearchResult>>('/flights/storefront/airports/search', {
        params: { q: '' } // Empty query returns popular destinations
      });
      return response;
    }
  }
}

export type { FlightSearchParams, FlightSearchResponse, FlightDetails, FlightFareDetails, InitialFlightData }

// Export components
export { FlightCardSkeleton } from "../component/FlightCardSkeleton"
export { CityComboBox } from "../component/CityComboBox"
export { default as FlightDetailsModal } from "../component/FlightDetailsModal"
