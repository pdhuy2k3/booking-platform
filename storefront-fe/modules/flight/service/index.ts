
import type { FlightDetails, FlightFareDetails, FlightSearchParams, FlightSearchResponse, InitialFlightData, SearchResponse, DestinationSearchResult } from "../type"
import { apiClient } from '@/lib/api-client';
import { destinationService } from '../../destination/service';

// Helper to map fare details to flight details
function mapFareToFlightDetails(fareDetails: FlightFareDetails, flightId: string): FlightDetails {
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
    flightId: flightId,
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
  };
}

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
  async getFareDetails(
    flightId: string,
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
