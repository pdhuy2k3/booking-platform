import { useState, useEffect, useCallback, useRef } from 'react';
import { destinationService } from '../service';
import type { DestinationSearchResult, SearchResponse } from '../type';

interface UseDestinationSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  limit?: number;
}

interface UseDestinationSearchReturn {
  destinations: DestinationSearchResult[];
  loading: boolean;
  error: string | null;
  searchDestinations: (query: string) => void;
  clearSearch: () => void;
  getPopularDestinations: () => void;
}

export const useDestinationSearch = (options: UseDestinationSearchOptions = {}): UseDestinationSearchReturn => {
  const {
    debounceMs = 300,
    minQueryLength = 1,
    limit = 20
  } = options;

  const [destinations, setDestinations] = useState<DestinationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchDestinations = useCallback(async (query: string) => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If query is too short, clear results
    if (query.length < minQueryLength) {
      setDestinations([]);
      setError(null);
      return;
    }

    // Set loading state
    setLoading(true);
    setError(null);

    // Create new debounce timer
    const timer = setTimeout(async () => {
      try {
        const response: SearchResponse<DestinationSearchResult> = await destinationService.searchDestinations(query, limit);
        
        if (response.results) {
          setDestinations(response.results);
        } else {
          setError('Search failed');
          setDestinations([]);
        }
      } catch (err) {
        console.error('Error searching destinations:', err);
        setError('Failed to search destinations');
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    debounceTimerRef.current = timer;
  }, [debounceMs, minQueryLength, limit]);

  const clearSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setDestinations([]);
    setError(null);
    setLoading(false);
  }, []);

  const getPopularDestinations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: SearchResponse<DestinationSearchResult> = await destinationService.getPopularDestinations();
      
      if (response.results) {
        setDestinations(response.results);
      } else {
        setError('Failed to load popular destinations');
        setDestinations([]);
      }
    } catch (err) {
      console.error('Error loading popular destinations:', err);
      setError('Failed to load popular destinations');
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    destinations,
    loading,
    error,
    searchDestinations,
    clearSearch,
    getPopularDestinations
  };
};

export default useDestinationSearch;
