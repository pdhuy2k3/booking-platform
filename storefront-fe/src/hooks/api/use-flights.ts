import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FlightService } from "@/services/flight-service";
import { 
  FlightSearchRequest, 
  FlightBookingRequest,
  FlightSearchResponse,
  FlightBookingResponse,
  FlightOffer 
} from "@/types/api/flight";
import { QUERY_KEYS } from "@/lib/utils/constants";

/**
 * Hook for searching flights
 */
export function useFlightSearch() {
  return useMutation({
    mutationFn: (searchParams: FlightSearchRequest) => 
      FlightService.searchFlights(searchParams),
    onError: (error) => {
      console.error("Flight search error:", error);
    },
  });
}

/**
 * Hook for getting flight details
 */
export function useFlightDetails(offerId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.FLIGHTS, "details", offerId],
    queryFn: () => FlightService.getFlightDetails(offerId),
    enabled: enabled && !!offerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for booking flights
 */
export function useFlightBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData: FlightBookingRequest) => 
      FlightService.bookFlight(bookingData),
    onSuccess: (data: FlightBookingResponse) => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.BOOKINGS] 
      });
      
      // Cache the new booking
      queryClient.setQueryData(
        [QUERY_KEYS.BOOKINGS, data.bookingId],
        data
      );
    },
    onError: (error) => {
      console.error("Flight booking error:", error);
    },
  });
}

/**
 * Hook for getting booking details
 */
export function useBookingDetails(bookingId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.BOOKINGS, bookingId],
    queryFn: () => FlightService.getBooking(bookingId),
    enabled: enabled && !!bookingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for canceling bookings
 */
export function useBookingCancellation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => 
      FlightService.cancelBooking(bookingId),
    onSuccess: (_, bookingId) => {
      // Invalidate booking details
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.BOOKINGS, bookingId] 
      });
      
      // Invalidate all bookings list
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.BOOKINGS] 
      });
    },
    onError: (error) => {
      console.error("Booking cancellation error:", error);
    },
  });
}

/**
 * Hook for getting popular destinations
 */
export function usePopularDestinations(origin?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.FLIGHTS, "popular-destinations", origin],
    queryFn: () => FlightService.getPopularDestinations(origin),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook for creating price alerts
 */
export function usePriceAlert() {
  return useMutation({
    mutationFn: (alertData: {
      origin: string;
      destination: string;
      departureDate: string;
      returnDate?: string;
      email: string;
      targetPrice: number;
    }) => FlightService.createPriceAlert(alertData),
    onError: (error) => {
      console.error("Price alert creation error:", error);
    },
  });
}

/**
 * Hook for getting seat maps
 */
export function useSeatMap(offerId: string, segmentId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.FLIGHTS, "seat-map", offerId, segmentId],
    queryFn: () => FlightService.getSeatMap(offerId, segmentId),
    enabled: enabled && !!offerId && !!segmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Custom hook for managing flight search state
 */
export function useFlightSearchState() {
  const queryClient = useQueryClient();
  
  const clearSearchResults = () => {
    queryClient.removeQueries({ 
      queryKey: [QUERY_KEYS.FLIGHTS, "search"] 
    });
  };

  const getSearchResults = (): FlightSearchResponse | undefined => {
    return queryClient.getQueryData([QUERY_KEYS.FLIGHTS, "search"]);
  };

  const setSearchResults = (data: FlightSearchResponse) => {
    queryClient.setQueryData([QUERY_KEYS.FLIGHTS, "search"], data);
  };

  return {
    clearSearchResults,
    getSearchResults,
    setSearchResults,
  };
}
