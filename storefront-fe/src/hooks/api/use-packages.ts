import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PackageService } from "@/services/package-service";
import { 
  PackageSearchRequest, 
  PackageBookingRequest,
  PackageSearchResponse,
  PackageBookingResponse,
  PackageOffer 
} from "@/types/api/package";
import { QUERY_KEYS } from "@/lib/utils/constants";

/**
 * Hook for searching packages
 */
export function usePackageSearch() {
  return useMutation({
    mutationFn: (searchParams: PackageSearchRequest) => 
      PackageService.searchPackages(searchParams),
    onError: (error) => {
      console.error("Package search error:", error);
    },
  });
}

/**
 * Hook for getting package details
 */
export function usePackageDetails(packageId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.PACKAGE_DETAILS, packageId],
    queryFn: () => PackageService.getPackageDetails(packageId),
    enabled: enabled && !!packageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for getting popular packages
 */
export function usePopularPackages(destination?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.POPULAR_PACKAGES, destination],
    queryFn: () => PackageService.getPopularPackages(destination),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for booking a package
 */
export function usePackageBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData: PackageBookingRequest) => 
      PackageService.bookPackage(bookingData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.PACKAGE_DETAILS] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.POPULAR_PACKAGES] 
      });
    },
    onError: (error) => {
      console.error("Package booking error:", error);
    },
  });
}

/**
 * Hook for managing package search state
 */
export function usePackageSearchState() {
  const queryClient = useQueryClient();

  const clearSearchResults = () => {
    queryClient.removeQueries({ 
      queryKey: [QUERY_KEYS.PACKAGE_SEARCH] 
    });
  };

  const getSearchResults = (): PackageSearchResponse | undefined => {
    return queryClient.getQueryData([QUERY_KEYS.PACKAGE_SEARCH]);
  };

  return {
    clearSearchResults,
    getSearchResults,
  };
}
