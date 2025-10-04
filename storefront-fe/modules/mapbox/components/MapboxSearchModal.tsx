'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MapPin, Search, X, TrendingUp } from 'lucide-react';
import { useMapboxSearch } from '../hooks/useMapboxSearch';
import type { MapboxDestinationResult } from '../types';
import { cn } from '@/lib/utils';

export interface MapboxSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (destination: MapboxDestinationResult) => void;
  title?: string;
  placeholder?: string;
  searchOptions?: {
    debounceMs?: number;
    minQueryLength?: number;
    limit?: number;
  };
  className?: string;
}

const DestinationItem: React.FC<{
  destination: MapboxDestinationResult;
  onClick: () => void;
  isPopular?: boolean;
}> = ({ destination, onClick, isPopular }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800',
        'transition-colors duration-150 border-b border-gray-100 dark:border-gray-800',
        'flex items-start gap-3 group'
      )}
    >
      <div className="flex-shrink-0 mt-1">
        {isPopular ? (
          <TrendingUp className="w-5 h-5 text-orange-500" />
        ) : (
          <MapPin className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {destination.name}
        </div>
        {destination.description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {destination.description}
          </div>
        )}
        {destination.fullAddress && destination.fullAddress !== destination.description && (
          <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
            {destination.fullAddress}
          </div>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {destination.country}
          </span>
          {destination.type && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
              {destination.type}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export const MapboxSearchModal: React.FC<MapboxSearchModalProps> = ({
  open,
  onOpenChange,
  onSelect,
  title = 'Search Destination',
  placeholder = 'Search for cities, places, or addresses...',
  searchOptions,
  className,
}) => {
  const [query, setQuery] = useState('');
  const [showPopular, setShowPopular] = useState(true);

  const {
    destinations,
    loading,
    error,
    searchDestinations,
    clearSearch,
    getPopularDestinations,
  } = useMapboxSearch({
    debounceMs: searchOptions?.debounceMs || 300,
    minQueryLength: searchOptions?.minQueryLength || 1,
    limit: searchOptions?.limit || 10,
    autoSearch: false,
  });

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);

      if (newQuery.trim().length > 0) {
        setShowPopular(false);
        searchDestinations(newQuery);
      } else {
        setShowPopular(true);
        getPopularDestinations();
      }
    },
    [searchDestinations, getPopularDestinations]
  );

  const handleSelect = useCallback(
    (destination: MapboxDestinationResult) => {
      onSelect(destination);
      onOpenChange(false);
      setQuery('');
      clearSearch();
    },
    [onSelect, onOpenChange, clearSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setShowPopular(true);
    clearSearch();
    getPopularDestinations();
  }, [clearSearch, getPopularDestinations]);

  useEffect(() => {
    if (open && destinations.length === 0) {
      getPopularDestinations();
    }
  }, [open, destinations.length, getPopularDestinations]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-2xl max-h-[80vh] p-0', className)}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder={placeholder}
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[50vh]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}

          {error && (
            <div className="px-6 py-8 text-center">
              <p className="text-red-500 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && destinations.length === 0 && query && (
            <div className="px-6 py-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No destinations found for "{query}"
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Try searching for a city, place, or address
              </p>
            </div>
          )}

          {!loading && !error && destinations.length > 0 && (
            <div>
              {showPopular && (
                <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                  Popular Destinations
                </div>
              )}
              {destinations.map((destination) => (
                <DestinationItem
                  key={destination.id}
                  destination={destination}
                  onClick={() => handleSelect(destination)}
                  isPopular={showPopular}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="px-6 py-3 border-t bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-500 text-center">
            Powered by Mapbox
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapboxSearchModal;

