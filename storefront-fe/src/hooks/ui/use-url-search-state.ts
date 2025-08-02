"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FlightSearchRequest } from "@/types/api/flight";
import { SearchFilters } from "@/types/api/common";
import {
  serializeSearchToParams,
  deserializeSearchFromParams,
  serializeFiltersToParams,
  deserializeFiltersFromParams,
  mergeUrlParams,
  isValidSearchParams,
} from "@/lib/utils/url-params";

export interface UseUrlSearchStateReturn {
  // Search state
  searchParams: Partial<FlightSearchRequest>;
  isValidSearch: boolean;
  updateSearchParams: (search: Partial<FlightSearchRequest>, replace?: boolean) => void;
  
  // Filter state
  filters: SearchFilters;
  sort?: string;
  page: number;
  updateFilters: (filters: SearchFilters, sort?: string, page?: number, replace?: boolean) => void;
  
  // Combined operations
  updateSearchAndFilters: (
    search: Partial<FlightSearchRequest>,
    filters?: SearchFilters,
    sort?: string,
    page?: number,
    replace?: boolean
  ) => void;
  
  // Utility
  clearFilters: () => void;
  resetToSearch: (search: Partial<FlightSearchRequest>) => void;
}

/**
 * Custom hook for managing search and filter state in URL parameters
 */
export function useUrlSearchState(): UseUrlSearchStateReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse current URL parameters
  const [currentSearch, setCurrentSearch] = useState<Partial<FlightSearchRequest>>(() =>
    deserializeSearchFromParams(searchParams)
  );
  
  const [currentFilters, setCurrentFilters] = useState(() => {
    const { filters, sort, page } = deserializeFiltersFromParams(searchParams);
    return { filters, sort, page };
  });

  // Update local state when URL changes
  useEffect(() => {
    const newSearch = deserializeSearchFromParams(searchParams);
    const { filters, sort, page } = deserializeFiltersFromParams(searchParams);
    
    setCurrentSearch(newSearch);
    setCurrentFilters({ filters, sort, page });
  }, [searchParams]);

  /**
   * Update search parameters in URL
   */
  const updateSearchParams = useCallback(
    (search: Partial<FlightSearchRequest>, replace = false) => {
      const searchUrlParams = serializeSearchToParams(search as FlightSearchRequest);
      const currentUrlParams = new URLSearchParams(searchParams.toString());
      
      // Merge with existing filter parameters
      const mergedParams = mergeUrlParams(currentUrlParams, searchUrlParams);
      
      const url = `${window.location.pathname}?${mergedParams.toString()}`;
      
      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router, searchParams]
  );

  /**
   * Update filter parameters in URL
   */
  const updateFilters = useCallback(
    (filters: SearchFilters, sort?: string, page?: number, replace = true) => {
      const filterUrlParams = serializeFiltersToParams(filters, sort, page);
      const currentUrlParams = new URLSearchParams(searchParams.toString());
      
      // Remove existing filter parameters
      const searchOnlyParams = new URLSearchParams();
      for (const [key, value] of currentUrlParams.entries()) {
        if ([
          "from", "to", "depart", "return", "adults", "children", "infants", "class", "type"
        ].includes(key)) {
          searchOnlyParams.set(key, value);
        }
      }
      
      // Merge with new filter parameters
      const mergedParams = mergeUrlParams(searchOnlyParams, filterUrlParams);
      
      const url = `${window.location.pathname}?${mergedParams.toString()}`;
      
      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router, searchParams]
  );

  /**
   * Update both search and filter parameters
   */
  const updateSearchAndFilters = useCallback(
    (
      search: Partial<FlightSearchRequest>,
      filters?: SearchFilters,
      sort?: string,
      page?: number,
      replace = false
    ) => {
      const searchUrlParams = serializeSearchToParams(search as FlightSearchRequest);
      const filterUrlParams = filters 
        ? serializeFiltersToParams(filters, sort, page)
        : new URLSearchParams();
      
      const mergedParams = mergeUrlParams(searchUrlParams, filterUrlParams);
      
      const url = `${window.location.pathname}?${mergedParams.toString()}`;
      
      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router]
  );

  /**
   * Clear all filters but keep search parameters
   */
  const clearFilters = useCallback(() => {
    const searchUrlParams = serializeSearchToParams(currentSearch as FlightSearchRequest);
    const url = `${window.location.pathname}?${searchUrlParams.toString()}`;
    router.replace(url);
  }, [router, currentSearch]);

  /**
   * Reset to only search parameters (clear filters and go to page 1)
   */
  const resetToSearch = useCallback(
    (search: Partial<FlightSearchRequest>) => {
      const searchUrlParams = serializeSearchToParams(search as FlightSearchRequest);
      const url = `${window.location.pathname}?${searchUrlParams.toString()}`;
      router.replace(url);
    },
    [router]
  );

  return {
    // Search state
    searchParams: currentSearch,
    isValidSearch: isValidSearchParams(currentSearch),
    updateSearchParams,
    
    // Filter state
    filters: currentFilters.filters,
    sort: currentFilters.sort,
    page: currentFilters.page,
    updateFilters,
    
    // Combined operations
    updateSearchAndFilters,
    
    // Utility
    clearFilters,
    resetToSearch,
  };
}
