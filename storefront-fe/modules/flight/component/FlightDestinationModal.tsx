'use client';

import * as React from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { flightService } from '../service';
import { destinationService } from '../../destination/service';
import { useDestinationSearch } from '../../destination/hooks/useDestinationSearch';
import type { DestinationSearchResult, SearchResponse } from '../type';

interface City {
  code: string;
  name: string;
  type: string;
}

interface FlightDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
  title: string;
  placeholder?: string;
}

export function FlightDestinationModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  title, 
  placeholder = "Tìm kiếm thành phố..." 
}: FlightDestinationModalProps) {
  const [search, setSearch] = React.useState('');
  const [recentSearches, setRecentSearches] = React.useState<City[]>([]);
  const [popularDestinations, setPopularDestinations] = React.useState<City[]>([]);
  
  // Use the debounced destination search hook
  const {
    destinations: searchResults,
    loading,
    error,
    searchDestinations,
    clearSearch,
    getPopularDestinations: loadPopularDestinations
  } = useDestinationSearch({
    debounceMs: 300,
    minQueryLength: 2,
    limit: 20
  });

  // Load recent searches from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('flight:recentDestinations');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Load popular destinations on mount
  React.useEffect(() => {
    const loadPopularDestinations = async () => {
      try {
        // Use the destination service directly for better consistency
        const response: SearchResponse<DestinationSearchResult> = await destinationService.getPopularDestinations();
        const popularCities: City[] = response.results.map(dest => ({
          code: dest.iataCode || '',
          name: dest.name,
          type: dest.type
        }));
        setPopularDestinations(popularCities);
      } catch (error) {
        console.error('Error loading popular destinations:', error);
        // Fallback to flight service if destination service fails
        try {
          const response: SearchResponse<DestinationSearchResult> = await flightService.getPopularDestinations();
          const popularCities: City[] = response.results.map(dest => ({
            code: dest.iataCode || '',
            name: dest.name,
            type: dest.type
          }));
          setPopularDestinations(popularCities);
        } catch (fallbackError) {
          console.error('Error loading popular destinations from flight service:', fallbackError);
        }
      }
    };

    loadPopularDestinations();
  }, []);

  // Handle search input changes with debouncing
  React.useEffect(() => {
    if (search.trim()) {
      searchDestinations(search);
    } else {
      clearSearch();
    }
  }, [search, searchDestinations, clearSearch]);

  // Convert search results to cities format
  const cities = React.useMemo(() => {
    return searchResults.map(dest => ({
      code: dest.iataCode || '',
      name: dest.name,
      type: dest.type
    }));
  }, [searchResults]);

  const handleCitySelect = (city: City) => {
    // Add to recent searches
    const updatedRecent = [city, ...recentSearches.filter(c => c.code !== city.code)].slice(0, 5);
    setRecentSearches(updatedRecent);
    
    try {
      localStorage.setItem('flight:recentDestinations', JSON.stringify(updatedRecent));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
    
    onSelect(city);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('flight:recentDestinations');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <ScrollArea className="h-96">
            {/* Recent Searches */}
            {search.length < 2 && recentSearches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Tìm kiếm gần đây</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Xóa tất cả
                  </Button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((city, index) => (
                    <div
                      key={`recent-${city.code}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleCitySelect(city)}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{city.name}</div>
                          <div className="text-sm text-muted-foreground">{city.code} • {city.type}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {search.length >= 2 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Kết quả tìm kiếm</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">Đang tìm kiếm...</div>
                  </div>
                ) : cities.length > 0 ? (
                  <div className="space-y-2">
                    {cities.map((city, index) => (
                      <div
                        key={`search-${city.code}-${index}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleCitySelect(city)}
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{city.name}</div>
                            <div className="text-sm text-muted-foreground">{city.code} • {city.type}</div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {city.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">Không tìm thấy thành phố nào</div>
                  </div>
                )}
              </div>
            )}

            {/* Popular Destinations */}
            {search.length < 2 && recentSearches.length === 0 && popularDestinations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Điểm đến phổ biến</h3>
                <div className="space-y-2">
                  {popularDestinations.slice(0, 8).map((city, index) => (
                    <div
                      key={`popular-${city.code}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleCitySelect(city)}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{city.name}</div>
                          <div className="text-sm text-muted-foreground">{city.code} • {city.type}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Phổ biến
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
