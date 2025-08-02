import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HotelService } from "@/services/hotel-service";
import { 
  HotelSearchRequest, 
  HotelBookingRequest,
  HotelSearchResponse,
  HotelBookingResponse,
  HotelOffer 
} from "@/types/api/hotel";
import { QUERY_KEYS } from "@/lib/utils/constants";

/**
 * Hook for searching hotels
 */
export function useHotelSearch() {
  return useMutation({
    mutationFn: (searchParams: HotelSearchRequest) => 
      HotelService.searchHotels(searchParams),
    onError: (error) => {
      console.error("Hotel search error:", error);
    },
  });
}

/**
 * Hook for getting hotel details
 */
export function useHotelDetails(hotelId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.HOTEL_DETAILS, hotelId],
    queryFn: () => HotelService.getHotelDetails(hotelId),
    enabled: enabled && !!hotelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for getting available rooms
 */
export function useAvailableRooms(
  hotelId: string, 
  checkInDate: string, 
  checkOutDate: string, 
  guests: number,
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.HOTEL_ROOMS, hotelId, checkInDate, checkOutDate, guests],
    queryFn: () => HotelService.getAvailableRooms(hotelId, checkInDate, checkOutDate, guests),
    enabled: enabled && !!hotelId && !!checkInDate && !!checkOutDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for booking a hotel
 */
export function useHotelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData: HotelBookingRequest) => 
      HotelService.bookHotel(bookingData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.HOTEL_DETAILS] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.HOTEL_ROOMS] 
      });
    },
    onError: (error) => {
      console.error("Hotel booking error:", error);
    },
  });
}

/**
 * Hook for managing hotel search state
 */
export function useHotelSearchState() {
  const queryClient = useQueryClient();

  const clearSearchResults = () => {
    queryClient.removeQueries({ 
      queryKey: [QUERY_KEYS.HOTEL_SEARCH] 
    });
  };

  const getSearchResults = (): HotelSearchResponse | undefined => {
    return queryClient.getQueryData([QUERY_KEYS.HOTEL_SEARCH]);
  };

  return {
    clearSearchResults,
    getSearchResults,
  };
}
