'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseRecentSearchesOptions<T> {
  storageKey: string;
  maxItems?: number;
  getItemId: (item: T) => string;
}

export function useRecentSearches<T>({ 
  storageKey, 
  maxItems = 5, 
  getItemId 
}: UseRecentSearchesOptions<T>) {
  const [recentSearches, setRecentSearches] = useState<T[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, [storageKey]);

  // Add item to recent searches
  const addToRecentSearches = useCallback((item: T) => {
    try {
      const itemId = getItemId(item);
      setRecentSearches(current => {
        const filtered = current.filter(existing => getItemId(existing) !== itemId);
        const updated = [item, ...filtered].slice(0, maxItems);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  }, [storageKey, maxItems, getItemId]);

  // Clear all recent searches
  const clearRecentSearches = useCallback(() => {
    try {
      setRecentSearches([]);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }, [storageKey]);

  return {
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
  };
}