/**
 * React Hook for Mapbox Search
 * Uses client-side service that calls Mapbox API directly
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { mapboxService } from '../services/mapboxClientService';
import type { MapboxDestinationResult, MapboxSearchResponse } from '../types';

export interface UseMapboxSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  limit?: number;
  autoSearch?: boolean;
  onError?: (error: Error) => void;
}

export interface UseMapboxSearchReturn {
  destinations: MapboxDestinationResult[];
  loading: boolean;
  error: string | null;
  searchDestinations: (query: string) => Promise<void>;
  clearSearch: () => void;
  getPopularDestinations: () => Promise<void>;
  selectDestination: (destination: MapboxDestinationResult) => void;
  selectedDestination: MapboxDestinationResult | null;
}

export const useMapboxSearch = (
  options: UseMapboxSearchOptions = {}
): UseMapboxSearchReturn => {
  const {
    debounceMs = 300,
    minQueryLength = 1,
    limit = 10,
    autoSearch = true,
    onError,
  } = options;

  const [destinations, setDestinations] = useState<MapboxDestinationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<MapboxDestinationResult | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchDestinations = useCallback(
    async (query: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (query.length < minQueryLength) {
        if (autoSearch) {
          await getPopularDestinations();
        } else {
          setDestinations([]);
        }
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const response = await mapboxService.searchDestinations(query, limit);

          if (abortControllerRef.current?.signal.aborted) {
            return;
          }

          setDestinations(response.results);
          setError(null);
        } catch (err) {
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }

          const errorMessage = err instanceof Error ? err.message : 'Failed to search destinations';
          setError(errorMessage);
          setDestinations([]);

          if (onError && err instanceof Error) {
            onError(err);
          }
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    },
    [debounceMs, minQueryLength, limit, autoSearch, onError]
  );

  const clearSearch = useCallback(() => {
    setDestinations([]);
    setError(null);
    setLoading(false);
    setSelectedDestination(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const getPopularDestinations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await mapboxService.getPopularDestinations();
      setDestinations(response.results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get popular destinations';
      setError(errorMessage);
      setDestinations([]);

      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const selectDestination = useCallback((destination: MapboxDestinationResult) => {
    setSelectedDestination(destination);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (autoSearch && destinations.length === 0) {
      getPopularDestinations();
    }
  }, [autoSearch]);

  return {
    destinations,
    loading,
    error,
    searchDestinations,
    clearSearch,
    getPopularDestinations,
    selectDestination,
    selectedDestination,
  };
};

export default useMapboxSearch;

