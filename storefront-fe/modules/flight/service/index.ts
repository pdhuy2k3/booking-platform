import type { FlightDetails, FlightFareDetails, FlightSearchParams, FlightSearchResponse, InitialFlightData, SearchResponse, DestinationSearchResult } from "../type"
import { apiClient } from '@/lib/api-client';
import { mapboxService } from '../../mapbox';

// Helper to map fare details to flight details
function mapFareToFlightDetails(fareDetails: FlightFareDetails, flightId: number): FlightDetails {
  let duration = '';
  try {
    const departure = new Date(fareDetails.departureTime);
    const arrival = new Date(fareDetails.arrivalTime);
    const diffMs = arrival.getTime() - departure.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    duration = `${diffHours}h ${diffMins}m`;
  } catch (e) {
    // Could not parse dates
  }

  const departure = new Date(fareDetails.departureTime);
  const arrival = new Date(fareDetails.arrivalTime);

  return {
    flightId: flightId?? fareDetails.flightId?? 'unknown',
    airline: fareDetails.airline || 'Unknown Airline',
    flightNumber: fareDetails.flightNumber || 'N/A',
    origin: fareDetails.originAirport || 'N/A',
    destination: fareDetails.destinationAirport || 'N/A',
    departureTime: departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    arrivalTime: arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    departureDateTime: fareDetails.departureTime,
    arrivalDateTime: fareDetails.arrivalTime,
    duration: duration,
    price: Number(fareDetails.price),
    currency: fareDetails.currency,
    seatClass: fareDetails.seatClass,
    availableSeats: fareDetails.availableSeats || 0,
    scheduleId: fareDetails.scheduleId,
    fareId: fareDetails.fareId,
    originLatitude: fareDetails.originLatitude,
    originLongitude: fareDetails.originLongitude,
    destinationLatitude: fareDetails.destinationLatitude,
    destinationLongitude: fareDetails.destinationLongitude,
  };
}

export const flightService = {
  search(params: FlightSearchParams) {
    // Backend expects: origin, destination, departureDate, returnDate?, passengers, seatClass, page, limit
    return apiClient.get<FlightSearchResponse>(`/flights/storefront/search`, {
      params
    })
  },
  get(id: number) {
    return apiClient.get<FlightDetails>(`/flights/storefront/${encodeURIComponent(id)}`)
  },
  async getFareDetails(
    flightId: number,
    params: { seatClass?: string; departureDateTime?: string; scheduleId?: string; fareId?: string }
  ): Promise<FlightDetails> {
    const fareDetails = await apiClient.get<FlightFareDetails>(
      `/flights/storefront/${encodeURIComponent(flightId)}/fare-details`,
      {
        params,
      }
    )
    return mapFareToFlightDetails(fareDetails, flightId)
  },
  async searchDestinations(search: string): Promise<SearchResponse<DestinationSearchResult>> {
    try {
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

      const backendResponse = await apiClient.get<SearchResponse<DestinationSearchResult>>('/flights/storefront/destinations/search', {
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

      const backendResponse = await apiClient.get<SearchResponse<DestinationSearchResult>>('/flights/storefront/destinations/popular');
      return backendResponse;
    }
  },
}

export type { FlightSearchParams, FlightSearchResponse, FlightDetails, FlightFareDetails, InitialFlightData }

// Export components
export { FlightCardSkeleton } from "../component/FlightCardSkeleton"
export { CityComboBox } from "../component/CityComboBox"
export { default as FlightDetailsModal } from "../component/FlightDetailsModal"
