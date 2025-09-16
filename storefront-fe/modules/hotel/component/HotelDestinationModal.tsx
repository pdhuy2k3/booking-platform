'use client';

import * as React from 'react';
import { Search, MapPin, X, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { hotelService } from '../service';
import { useDestinationSearch } from '../../destination/hooks/useDestinationSearch';
import type { DestinationSearchResult, SearchResponse } from '../type';

interface Destination {
  id: string;
  name: string;
  type: string;
  country: string;
  description?: string;
}

interface HotelDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (destination: Destination) => void;
  title: string;
  placeholder?: string;
}

export function HotelDestinationModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  title, 
  placeholder = "Tìm kiếm điểm đến..." 
}: HotelDestinationModalProps) {
  const [search, setSearch] = React.useState('');
  const [recentSearches, setRecentSearches] = React.useState<Destination[]>([]);
  const [popularDestinations, setPopularDestinations] = React.useState<Destination[]>([]);
  
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
      const saved = localStorage.getItem('hotel:recentDestinations');
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
        const response: SearchResponse<DestinationSearchResult> = await hotelService.getPopularDestinations();
        const popularDests: Destination[] = response.results.map(dest => ({
          id: dest.name.toLowerCase().replace(/\s+/g, ''),
          name: dest.name,
          type: dest.type,
          country: dest.country,
          description: dest.description
        }));
        setPopularDestinations(popularDests);
      } catch (error) {
        console.error('Error loading popular destinations:', error);
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

  // Convert search results to destinations format
  const destinations = React.useMemo(() => {
    return searchResults.map(dest => ({
      id: dest.name.toLowerCase().replace(/\s+/g, ''),
      name: dest.name,
      type: dest.type,
      country: dest.country,
      description: dest.description
    }));
  }, [searchResults]);

  const handleDestinationSelect = (destination: Destination) => {
    // Add to recent searches
    const updatedRecent = [destination, ...recentSearches.filter(d => d.id !== destination.id)].slice(0, 5);
    setRecentSearches(updatedRecent);
    
    try {
      localStorage.setItem('hotel:recentDestinations', JSON.stringify(updatedRecent));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
    
    onSelect(destination);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('hotel:recentDestinations');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
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
                  {recentSearches.map((destination) => (
                    <div
                      key={destination.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleDestinationSelect(destination)}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{destination.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {destination.type} • {destination.country}
                          </div>
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
                ) : destinations.length > 0 ? (
                  <div className="space-y-2">
                    {destinations.map((destination) => (
                      <div
                        key={destination.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleDestinationSelect(destination)}
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{destination.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {destination.type} • {destination.country}
                            </div>
                            {destination.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {destination.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {destination.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">Không tìm thấy điểm đến nào</div>
                  </div>
                )}
              </div>
            )}

            {/* Popular Destinations */}
            {search.length < 2 && recentSearches.length === 0 && popularDestinations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Điểm đến phổ biến</h3>
                <div className="space-y-2">
                  {popularDestinations.slice(0, 8).map((destination) => (
                    <div
                      key={destination.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleDestinationSelect(destination)}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">{destination.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {destination.type} • {destination.country}
                          </div>
                          {destination.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {destination.description}
                            </div>
                          )}
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
