'use client';

import * as React from 'react';
import { MapboxSearchModal } from '../../mapbox/components/MapboxSearchModal';
import type { MapboxDestinationResult } from '../../mapbox/types';

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
  
  const handleMapboxSelect = React.useCallback((destination: MapboxDestinationResult) => {
    // Convert MapboxDestinationResult to Destination format
    const hotelDestination: Destination = {
      id: destination.id,
      name: destination.name,
      type: destination.type || 'city',
      country: destination.country,
      description: destination.description || destination.fullAddress
    };
    
    // Save to recent searches for hotel destinations
    saveToRecentSearches(hotelDestination);
    
    onSelect(hotelDestination);
  }, [onSelect]);

  const saveToRecentSearches = (destination: Destination) => {
    try {
      const saved = localStorage.getItem('hotel:recentDestinations');
      const recentSearches: Destination[] = saved ? JSON.parse(saved) : [];
      const updatedRecent = [destination, ...recentSearches.filter(d => d.id !== destination.id)].slice(0, 5);
      localStorage.setItem('hotel:recentDestinations', JSON.stringify(updatedRecent));
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
