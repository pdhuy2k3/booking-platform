import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SearchCriteria, SearchResults, FilterState } from '../types/business/search';

const initialFilterState: FilterState = {
  priceRange: { min: 0, max: 10000000 },
  durationRange: { min: 0, max: 1440 }, // 24 hours in minutes
  airlines: [],
  stops: [],
  departureTimeRanges: {},
  hotelAmenities: [],
  hotelRating: undefined,
  accommodationType: [],
};

export interface SearchState {
  // Search state
  searchCriteria: SearchCriteria | null;
  searchResults: SearchResults | null;
  isSearching: boolean;
  searchError: string | null;
  
  // Filter state
  filters: FilterState;
  activeFiltersCount: number;
  
  // UI state
  viewMode: 'grid' | 'list';
  sortBy: 'price' | 'duration' | 'departure' | 'rating';
  sortOrder: 'asc' | 'desc';
  resultsPerPage: number;
  currentPage: number;
  
  // Actions
  setSearchCriteria: (criteria: SearchCriteria) => void;
  setSearchResults: (results: SearchResults) => void;
  setSearching: (isSearching: boolean) => void;
  setSearchError: (error: string | null) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sortBy: 'price' | 'duration' | 'departure' | 'rating') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setResultsPerPage: (count: number) => void;
  setCurrentPage: (page: number) => void;
  resetSearch: () => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        searchCriteria: null,
        searchResults: null,
        isSearching: false,
        searchError: null,
        filters: initialFilterState,
        activeFiltersCount: 0,
        
        // UI state
        viewMode: 'grid',
        sortBy: 'price',
        sortOrder: 'asc',
        resultsPerPage: 20,
        currentPage: 1,
        
        // Actions
        setSearchCriteria: (criteria) => {
          set({ searchCriteria: criteria, searchError: null });
        },

        setSearchResults: (results) => {
          set({ searchResults: results, isSearching: false });
        },

        setSearching: (isSearching) => {
          set({ isSearching, searchError: isSearching ? null : get().searchError });
        },

        setSearchError: (error) => {
          set({ searchError: error, isSearching: false });
        },

        updateFilters: (newFilters) => {
          const currentFilters = get().filters;
          const updatedFilters = { ...currentFilters, ...newFilters };
          
          // Calculate active filters count
          let activeCount = 0;
          
          if (updatedFilters.priceRange?.min !== undefined || updatedFilters.priceRange?.max !== undefined) {
            activeCount++;
          }
          if (updatedFilters.durationRange?.min !== undefined || updatedFilters.durationRange?.max !== undefined) {
            activeCount++;
          }
          if (updatedFilters.airlines && updatedFilters.airlines.length > 0) {
            activeCount++;
          }
          if (updatedFilters.stops && updatedFilters.stops.length > 0) {
            activeCount++;
          }
          if (updatedFilters.departureTimeRanges && Object.keys(updatedFilters.departureTimeRanges).length > 0) {
            activeCount++;
          }
          if (updatedFilters.hotelAmenities && updatedFilters.hotelAmenities.length > 0) {
            activeCount++;
          }
          if (updatedFilters.hotelRating !== undefined) {
            activeCount++;
          }
          if (updatedFilters.accommodationType && updatedFilters.accommodationType.length > 0) {
            activeCount++;
          }

          set({ 
            filters: updatedFilters, 
            activeFiltersCount: activeCount,
            currentPage: 1 // Reset to first page when filters change
          });
        },

        clearFilters: () => {
          set({ 
            filters: initialFilterState, 
            activeFiltersCount: 0,
            currentPage: 1 
          });
        },

        setViewMode: (mode) => {
          set({ viewMode: mode });
        },

        setSortBy: (sortBy) => {
          set({ sortBy, currentPage: 1 });
        },

        setSortOrder: (order) => {
          set({ sortOrder: order, currentPage: 1 });
        },

        setResultsPerPage: (count) => {
          set({ resultsPerPage: count, currentPage: 1 });
        },

        setCurrentPage: (page) => {
          set({ currentPage: page });
        },

        resetSearch: () => {
          set({
            searchCriteria: null,
            searchResults: null,
            isSearching: false,
            searchError: null,
            filters: initialFilterState,
            activeFiltersCount: 0,
            currentPage: 1,
          });
        },
      }),
      {
        name: 'search-store',
        partialize: (state) => ({
          viewMode: state.viewMode,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          resultsPerPage: state.resultsPerPage,
        }),
      }
    ),
    { name: 'SearchStore' }
  )
);

// Selectors for optimized re-renders
export const useSearchCriteria = () => useSearchStore((state) => state.searchCriteria);
export const useSearchResults = () => useSearchStore((state) => state.searchResults);
export const useSearchLoading = () => useSearchStore((state) => state.isSearching);
export const useSearchError = () => useSearchStore((state) => state.searchError);
export const useSearchFilters = () => useSearchStore((state) => state.filters);
export const useActiveFiltersCount = () => useSearchStore((state) => state.activeFiltersCount);
export const useSearchUI = () => useSearchStore((state) => ({
  viewMode: state.viewMode,
  sortBy: state.sortBy,
  sortOrder: state.sortOrder,
  resultsPerPage: state.resultsPerPage,
  currentPage: state.currentPage,
}));
