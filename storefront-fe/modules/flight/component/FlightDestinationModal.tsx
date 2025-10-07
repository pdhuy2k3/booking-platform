'use client';

import * as React from 'react';
import { MapboxSearchModal, type MapboxSearchModalProps } from '../../mapbox/components/MapboxSearchModal';
import type { MapboxDestinationResult } from '../../mapbox/types';

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
  placeholder = "Tìm kiếm thành phố, sân bay..." 
}: FlightDestinationModalProps) {
  
  const handleMapboxSelect = React.useCallback((destination: MapboxDestinationResult) => {
    // Convert MapboxDestinationResult to City format
    const city: City = {
      code: extractCodeFromName(destination.name) || '',
      name: destination.name,
      type: destination.type || 'city'
    };
    
    // Save to recent searches for flight destinations
    saveToRecentSearches(city);
    
    onSelect(city);
  }, [onSelect]);

  // Helper function to extract potential airport/city code from name
  const extractCodeFromName = (name: string): string => {
    // Look for 3-letter codes in parentheses (e.g., "Ho Chi Minh City (SGN)")
    const codeMatch = name.match(/\(([A-Z]{3})\)/);
    if (codeMatch) {
      return codeMatch[1];
    }
    
    // Generate a simple code from the name as fallback
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 3);
  };

  const saveToRecentSearches = (city: City) => {
    try {
      const saved = localStorage.getItem('flight:recentDestinations');
      const recentSearches: City[] = saved ? JSON.parse(saved) : [];
      const updatedRecent = [city, ...recentSearches.filter(c => c.code !== city.code)].slice(0, 5);
      localStorage.setItem('flight:recentDestinations', JSON.stringify(updatedRecent));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  return (
    <MapboxSearchModal
      open={isOpen}
      onOpenChange={onClose}
      onSelect={handleMapboxSelect}
      title={title}
      placeholder={placeholder}
      searchOptions={{
        debounceMs: 300,
        minQueryLength: 2,
        limit: 20
      }}
    />
  );
}
