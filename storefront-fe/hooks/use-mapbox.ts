"use client";

import { useState, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { MapLocation } from '@/components/mapbox-map';

export interface UseMapboxOptions {
  defaultCenter?: [number, number];
  defaultZoom?: number;
  onLocationClick?: (location: MapLocation) => void;
}

export function useMapbox({
  defaultCenter = [106.6297, 10.8231], // Ho Chi Minh City
  defaultZoom = 10,
  onLocationClick
}: UseMapboxOptions = {}) {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = useState(defaultZoom);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Add a single location
  const addLocation = useCallback((location: MapLocation) => {
    setLocations(prev => {
      // Check if location already exists
      const exists = prev.find(loc => loc.id === location.id);
      if (exists) {
        // Update existing location
        return prev.map(loc => loc.id === location.id ? location : loc);
      }
      // Add new location
      return [...prev, location];
    });
  }, []);

  // Add multiple locations
  const addLocations = useCallback((newLocations: MapLocation[]) => {
    setLocations(prev => {
      const updated = [...prev];
      newLocations.forEach(newLoc => {
        const existingIndex = updated.findIndex(loc => loc.id === newLoc.id);
        if (existingIndex >= 0) {
          updated[existingIndex] = newLoc;
        } else {
          updated.push(newLoc);
        }
      });
      return updated;
    });
  }, []);

  // Remove a location
  const removeLocation = useCallback((locationId: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== locationId));
    if (selectedLocation === locationId) {
      setSelectedLocation(null);
    }
  }, [selectedLocation]);

  // Clear all locations
  const clearLocations = useCallback(() => {
    setLocations([]);
    setSelectedLocation(null);
  }, []);

  // Update map center
  const updateCenter = useCallback((newCenter: [number, number]) => {
    setCenter(newCenter);
    if (mapRef.current) {
      mapRef.current.flyTo({ center: newCenter });
    }
  }, []);

  // Update map zoom
  const updateZoom = useCallback((newZoom: number) => {
    setZoom(newZoom);
    if (mapRef.current) {
      mapRef.current.flyTo({ zoom: newZoom });
    }
  }, []);

  // Fly to location
  const flyToLocation = useCallback((location: MapLocation) => {
    const newCenter: [number, number] = [location.longitude, location.latitude];
    setCenter(newCenter);
    setSelectedLocation(location.id);
    
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: newCenter,
        zoom: 15,
        essential: true
      });
    }
  }, []);

  // Fit map to show all locations
  const fitToLocations = useCallback(() => {
    if (locations.length === 0 || !mapRef.current) return;

    if (locations.length === 1) {
      flyToLocation(locations[0]);
      return;
    }

    const coordinates = locations.map(loc => [loc.longitude, loc.latitude] as [number, number]);
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    mapRef.current.fitBounds(bounds, { 
      padding: 50,
      maxZoom: 15
    });
  }, [locations, flyToLocation]);

  // Handle location click
  const handleLocationClick = useCallback((location: MapLocation) => {
    setSelectedLocation(location.id);
    if (onLocationClick) {
      onLocationClick(location);
    }
  }, [onLocationClick]);

  // Handle map load
  const handleMapLoad = useCallback((map: mapboxgl.Map) => {
    mapRef.current = map;
  }, []);

  // Get location by ID
  const getLocationById = useCallback((id: string) => {
    return locations.find(loc => loc.id === id) || null;
  }, [locations]);

  // Search locations by name
  const searchLocations = useCallback((query: string) => {
    if (!query.trim()) return locations;
    
    const searchTerm = query.toLowerCase();
    return locations.filter(location => 
      location.name.toLowerCase().includes(searchTerm) ||
      location.description?.toLowerCase().includes(searchTerm)
    );
  }, [locations]);

  // Convert coordinates to location
  const coordinatesToLocation = useCallback((
    longitude: number, 
    latitude: number, 
    name?: string
  ): MapLocation => {
    return {
      id: `coord_${longitude}_${latitude}`,
      name: name || `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      longitude,
      latitude,
      type: 'custom'
    };
  }, []);

  return {
    // State
    locations,
    center,
    zoom,
    selectedLocation,
    mapRef,

    // Actions
    addLocation,
    addLocations,
    removeLocation,
    clearLocations,
    updateCenter,
    updateZoom,
    flyToLocation,
    fitToLocations,
    handleLocationClick,
    handleMapLoad,

    // Utilities
    getLocationById,
    searchLocations,
    coordinatesToLocation,

    // Computed
    hasLocations: locations.length > 0,
    locationCount: locations.length
  };
}

export default useMapbox;