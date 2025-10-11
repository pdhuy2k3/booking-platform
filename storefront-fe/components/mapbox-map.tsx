"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { cn } from '@/lib/utils';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env.mjs';

export interface MapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type?: 'hotel' | 'airport' | 'destination' | 'custom';
  description?: string;
  price?: string;
  image?: string;
}

export interface MapboxMapProps {
  className?: string;
  locations?: MapLocation[];
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  style?: string;
  showControls?: boolean;
  onLocationClick?: (location: MapLocation) => void;
  onMapLoad?: (map: mapboxgl.Map) => void;
  interactive?: boolean;
  height?: string;
}

export function MapboxMap({
  className,
  locations = [],
  center = [106.80337596151362, 10.870060732280548], // Ho Chi Minh City default
  zoom = 10,
  style = 'mapbox://styles/mapbox/streets-v12',
  showControls = true,
  onLocationClick,
  onMapLoad,
  interactive = true,
  height = "100vh"
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Get API key from environment variables
    const apiKey = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!apiKey) {
      console.error('Mapbox API key not found. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables.');
      return;
    }

    mapboxgl.accessToken = apiKey;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style,
      center,
      zoom,
      interactive
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      if (onMapLoad && map.current) {
        onMapLoad(map.current);
      }
    });

    // Add navigation controls if enabled
    if (showControls) {
      map.current.addControl(new mapboxgl.NavigationControl());
      map.current.addControl(new mapboxgl.FullscreenControl());
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, style, showControls, interactive, onMapLoad]);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    locations.forEach(location => {
      if (!map.current) return;

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = getMarkerHTML(location);

      // Create marker
      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom'
      })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map.current);

      // Add popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(getPopupHTML(location));

      marker.setPopup(popup);

      // Add click handler
      markerElement.addEventListener('click', () => {
        if (onLocationClick) {
          onLocationClick(location);
        }
      });

      markers.current.push(marker);
    });

    // Fit map to markers if multiple locations
    if (locations.length > 1 && map.current) {
      const coordinates = locations.map(loc => [loc.longitude, loc.latitude] as [number, number]);
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [locations, isLoaded, onLocationClick]);

  const getMarkerHTML = (location: MapLocation): string => {
    const iconClass = getMarkerIcon(location.type);
    const colorClass = getMarkerColor(location.type);

    return `
      <div class="marker-container ${colorClass} hover:scale-110 transition-transform cursor-pointer">
        <div class="marker-content">
          <i class="${iconClass}"></i>
          ${location.price ? `<span class="marker-price">${location.price}</span>` : ''}
        </div>
      </div>
    `;
  };

  const getPopupHTML = (location: MapLocation): string => {
    return `
      <div class="popup-content">
        ${location.image ? `<img src="${location.image}" alt="${location.name}" class="popup-image" />` : ''}
        <div class="popup-body">
          <h3 class="popup-title">${location.name}</h3>
          ${location.description ? `<p class="popup-description">${location.description}</p>` : ''}
          ${location.price ? `<div class="popup-price">${location.price}</div>` : ''}
        </div>
      </div>
    `;
  };

  const getMarkerIcon = (type?: string): string => {
    switch (type) {
      case 'hotel': return 'fas fa-bed';
      case 'airport': return 'fas fa-plane';
      case 'destination': return 'fas fa-map-marker-alt';
      default: return 'fas fa-map-marker-alt';
    }
  };

  const getMarkerColor = (type?: string): string => {
    switch (type) {
      case 'hotel': return 'marker-hotel';
      case 'airport': return 'marker-airport';
      case 'destination': return 'marker-destination';
      default: return 'marker-default';
    }
  };

  // Public methods
  const flyTo = (longitude: number, latitude: number, zoom?: number) => {
    if (map.current) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom || map.current.getZoom(),
        essential: true
      });
    }
  };

  const addLocation = (location: MapLocation) => {
    if (!map.current || !isLoaded) return;

    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.innerHTML = getMarkerHTML(location);

    const marker = new mapboxgl.Marker({
      element: markerElement,
      anchor: 'bottom'
    })
      .setLngLat([location.longitude, location.latitude])
      .addTo(map.current);

    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false
    }).setHTML(getPopupHTML(location));

    marker.setPopup(popup);

    markerElement.addEventListener('click', () => {
      if (onLocationClick) {
        onLocationClick(location);
      }
    });

    markers.current.push(marker);
  };

  return (
    <div className={cn("relative w-full h-full", className)} style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Custom CSS for markers */}
      <style jsx global>{`
        .custom-marker {
          cursor: pointer;
        }

        .marker-container {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .marker-content {
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
          text-align: center;
        }

        .marker-price {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          color: #333;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }

        .marker-hotel {
          background: #3b82f6;
        }

        .marker-airport {
          background: #ef4444;
        }

        .marker-destination {
          background: #10b981;
        }

        .marker-default {
          background: #6b7280;
        }

        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 8px;
          overflow: hidden;
          max-width: 300px;
        }

        .popup-content {
          min-width: 200px;
        }

        .popup-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .popup-body {
          padding: 12px;
        }

        .popup-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #1f2937;
        }

        .popup-description {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 8px 0;
        }

        .popup-price {
          font-size: 14px;
          font-weight: 600;
          color: #3b82f6;
        }

        .mapboxgl-ctrl-group {
          border-radius: 8px;
          overflow: hidden;
        }

        .mapboxgl-ctrl button {
          width: 36px;
          height: 36px;
        }
      `}</style>
    </div>
  );
}

export default MapboxMap;