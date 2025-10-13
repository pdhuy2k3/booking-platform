'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Map as MapIcon, Compass, MapPin, Search, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ChatStructuredResult } from "@/modules/ai/types";
import { useRecommendPanel } from "@/contexts/recommend-panel-context";
import { MapboxMap, type MapLocation } from "@/components/mapbox-map";
import { useExploreDestinations } from "@/hooks/use-explore-destinations";
import Image from "next/image";

interface RecommendPanelProps {
  results?: any[];
  className?: string;
  onWidthChange?: (width: number) => void;
}

type TabMode = "explore" | "map";

export interface RecommendPanelRef {
  showLocationOnMap: (location: { lat: number; lng: number; title: string; description?: string }) => void;
}

export const RecommendPanel = React.forwardRef<RecommendPanelRef, RecommendPanelProps>(
  ({ results = [], className, onWidthChange }, ref) => {
    const {
      externalLocation,
      acknowledgeExternalLocation,
      mapStyle,
      journeys
    } = useRecommendPanel();

    const {
      exploreQuery,
      setExploreQuery,
      exploreResults,
      exploreLoading,
      exploreMessage,
      handleExploreSearch,
      handleTrendingClick,
      handleSeasonalClick,
      loadDefaultDestinations
    } = useExploreDestinations();

    const [activeTab, setActiveTab] = useState<TabMode>("explore");
    const [selectedLocationIndex, setSelectedLocationIndex] = useState<number>(0);
    const [mapCenter, setMapCenter] = useState<[number, number]>([108.2022, 16.0544]); // Da Nang default
    const [mapZoom, setMapZoom] = useState<number>(12);
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [panelWidth, setPanelWidth] = useState<number>(0);
    const [isResizing, setIsResizing] = useState<boolean>(false);
    
    const panelRef = useRef<HTMLDivElement>(null);
    const MIN_WIDTH = 280;
    const MAX_WIDTH = 600;

    // Data extraction helpers (could also be moved to a utils file)
    const parseCoordinate = (value: unknown): number | null => {
      if (typeof value === 'number' && !Number.isNaN(value)) return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? null : parsed;
      }
      return null;
    };

    const getCoordinatesFromMetadata = (metadata?: Record<string, unknown>) => {
      if (!metadata) return null;
      const latitude = parseCoordinate(metadata['latitude'] ?? metadata['lat']);
      const longitude = parseCoordinate(metadata['longitude'] ?? metadata['lng']);
      if (latitude == null || longitude == null) return null;
      return { latitude, longitude };
    };

    // Convert results to MapLocation format
    const mapLocations = React.useMemo((): MapLocation[] => {
      if (activeTab === "explore" && exploreResults.length > 0) {
        return exploreResults.map((item, index) => {
          const metadata = (item.metadata || {}) as Record<string, unknown>;
          const coords = getCoordinatesFromMetadata(metadata);
          return {
            id: `explore-${item.ids?.destination_id || index}`,
            name: item.title || 'Destination',
            latitude: coords?.latitude || 0,
            longitude: coords?.longitude || 0,
            description: item.subtitle || item.description || '',
            type: 'destination'
          };
        }).filter(loc => loc.latitude !== 0 && loc.longitude !== 0);
      }
      return [];
    }, [activeTab, exploreResults]);

    // Convert external results to MapLocation format
    const externalResultsLocations = React.useMemo((): MapLocation[] => {
      if (results.length > 0) {
        return results.map((result, index) => {
          // Try to extract coordinates from various possible locations in the result object
          let latitude = null;
          let longitude = null;
          
          // Check direct properties
          if (typeof result.latitude === 'number' && typeof result.longitude === 'number') {
            latitude = result.latitude;
            longitude = result.longitude;
          }
          // Check metadata properties
          else if (result.metadata && typeof result.metadata.latitude === 'number' && typeof result.metadata.longitude === 'number') {
            latitude = result.metadata.latitude;
            longitude = result.metadata.longitude;
          }
          // Check coordinates in metadata
          else if (result.metadata?.coordinates) {
            const coords = result.metadata.coordinates;
            latitude = typeof coords.latitude === 'number' ? coords.latitude : null;
            longitude = typeof coords.longitude === 'number' ? coords.longitude : null;
          }
          
          if (latitude == null || longitude == null) return null;
          
          return {
            id: `external-${index}`,
            name: result.title || result.name || 'Location',
            latitude,
            longitude,
            description: result.subtitle || result.description || result.metadata?.location || '',
            type: result.type || 'destination'
          };
        }).filter((loc): loc is MapLocation => loc !== null);
      }
      return [];
    }, [results]);

    const allLocations = React.useMemo(() => {
      const locations = [...mapLocations, ...externalResultsLocations];
      if (externalLocation) {
        locations.push({
          id: `external-${Date.now()}`,
          name: externalLocation.title,
          latitude: externalLocation.lat,
          longitude: externalLocation.lng,
          description: externalLocation.description || '',
          type: (externalLocation as any).type || 'custom'
        });
      }
      return locations;
    }, [mapLocations, externalResultsLocations, externalLocation]);

    const handleExploreCardClick = (index: number) => {
      const location = exploreResults[index];
      const metadata = (location?.metadata || {}) as Record<string, unknown>;
      const coords = getCoordinatesFromMetadata(metadata);
      if (coords) {
        setActiveTab('map');
        setSelectedLocationIndex(index);
        setMapCenter([coords.longitude, coords.latitude]);
        setMapZoom(15);
      }
    };

    // Handle external location prop changes
    useEffect(() => {
      if (externalLocation) {
        setActiveTab('map');
        setMapCenter([externalLocation.lng, externalLocation.lat]);
        setMapZoom(15);
        acknowledgeExternalLocation();
      }
    }, [externalLocation, acknowledgeExternalLocation]);

    // Load default destinations on component mount, but only if no external results are provided
    useEffect(() => {
      if (activeTab === "explore" && results.length === 0) {
        loadDefaultDestinations();
      }
    }, [activeTab, results.length, loadDefaultDestinations]);

    // Resize handler
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
    }, []);

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing || !panelRef.current) return;
        const containerRect = panelRef.current.getBoundingClientRect();
        const newWidth = containerRect.right - e.clientX;
        const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
        setPanelWidth(clampedWidth);
        onWidthChange?.(clampedWidth);
      };
      const handleMouseUp = () => setIsResizing(false);

      if (isResizing) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }, [isResizing, onWidthChange]);

    const tabs = [
      { id: "explore" as const, label: "Khám phá", icon: Compass },
      { id: "map" as const, label: "Bản đồ", icon: MapIcon },
    ];

    return (
      <div 
        ref={panelRef}
        className={cn(
          "flex flex-col h-full bg-white relative transition-all",
          !isExpanded && "w-0 overflow-hidden",
          isExpanded && !isResizing && "duration-300",
          className
        )}
        style={isExpanded && panelWidth > 0 ? { width: `${panelWidth}px` } : undefined}
      >
        {/* Panel Resize Handle */}
        <div 
          className="absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-blue-500 transition-colors z-10"
          onMouseDown={handleMouseDown}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="p-2"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-1"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Explore Tab Content */}
        {activeTab === "explore" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={exploreQuery}
                    onChange={(e) => setExploreQuery(e.target.value)}
                    placeholder="Tìm kiếm điểm đến..."
                    className="pl-10 pr-4 py-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleExploreSearch()}
                  />
                </div>
                <Button onClick={handleExploreSearch} disabled={exploreLoading}>
                  {exploreLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTrendingClick}
                  disabled={exploreLoading}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Thịnh hành
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeasonalClick}
                  disabled={exploreLoading}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Mùa này
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {exploreLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : exploreResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {exploreResults.map((item, index) => {
                    // Extract metadata for proper display
                    const metadata = (item.metadata || {}) as Record<string, any>;
                    const imageUrl = metadata.imageUrl || item.image || item.imageUrl;
                    const highlights = metadata.highlights || [];
                    const bestTime = metadata.bestTime || metadata.best_time;
                    const estimatedCost = metadata.estimatedCost || metadata.estimated_cost;
                    
                    return (
                      <Card 
                        key={index} 
                        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleExploreCardClick(index)}
                      >
                        <div className="flex flex-col items-start space-x-3">
                          {imageUrl && (
                            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={imageUrl} 
                                alt={item.title}
                                width={64}
                                height={64}
                                className="object-cover"
                                onError={(e) => {
                                  // Hide image if it fails to load
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold">{item.title}</h3>
                              {/* Show map pin if coordinates exist */}
                              {metadata.latitude && metadata.longitude && (
                                <MapPin className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="text-sm text-gray-600 mb-2">{item.subtitle}</p>
                            )}
                            {highlights.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {highlights.map((highlight: string, i: number) => (
                                  <span key={i} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {highlight}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {bestTime && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>{bestTime}</span>
                                </div>
                              )}
                              {estimatedCost && (
                                <div className="text-xs text-gray-500">
                                  💰 {estimatedCost}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : results.length > 0 && exploreResults.length === 0 && !exploreLoading ? (
                // Display results passed from parent component
                <div className="grid grid-cols-1 gap-4">
                  {results.map((result, index) => {
                    // Handle both explore result structure and generic result structure
                    const metadata = (result.metadata || {}) as Record<string, any>;
                    const hasLocation = !!(
                      result.latitude && result.longitude ||
                      (metadata.latitude && metadata.longitude) ||
                      (metadata.coordinates)
                    );
                    
                    // Extract metadata values for proper display
                    const imageUrl = metadata.imageUrl || result.imageUrl || result.image;
                    const highlights = metadata.highlights || result.highlights || [];
                    const bestTime = metadata.bestTime || metadata.best_time;
                    const estimatedCost = metadata.estimatedCost || metadata.estimated_cost;
                    
                    return (
                      <Card 
                        key={index} 
                        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          if (hasLocation) {
                            // Get coordinates for the result
                            let lat, lng;
                            if (result.latitude && result.longitude) {
                              lat = result.latitude;
                              lng = result.longitude;
                            } else if (metadata.latitude && metadata.longitude) {
                              lat = metadata.latitude;
                              lng = metadata.longitude;
                            } else if (metadata.coordinates) {
                              lat = metadata.coordinates.latitude;
                              lng = metadata.coordinates.longitude;
                            }
                            
                            if (lat && lng) {
                              setActiveTab('map');
                              setMapCenter([lng, lat]);
                              setMapZoom(15);
                            }
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          {imageUrl && (
                            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={imageUrl}
                                alt={result.title || result.name || 'Location'}
                                width={64}
                                height={64}
                                className="object-cover"
                                onError={(e) => {
                                  // Hide image if it fails to load
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold">{result.title || result.name || 'Location'}</h3>
                              {hasLocation && (
                                <MapPin className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{result.subtitle || result.description}</p>
                            {highlights.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {highlights.map((highlight: string, i: number) => (
                                  <span key={i} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {highlight}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {bestTime && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>{bestTime}</span>
                                </div>
                              )}
                              {estimatedCost && (
                                <div className="text-xs text-gray-500">
                                  💰 {estimatedCost}
                                </div>
                              )}
                              {metadata.category && (
                                <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                  {metadata.category}
                                </span>
                              )}
                              {hasLocation && (
                                <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded font-medium">
                                  Hiển thị trên bản đồ
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
                  <Compass className="h-12 w-12 mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">{exploreMessage || "Khám phá điểm đến mới"}</h3>
                  <p className="text-sm">Sử dụng thanh tìm kiếm hoặc các nút gợi ý để bắt đầu khám phá</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Tab Content */}
        {activeTab === "map" && (
          <div className="flex-1 relative">
            <MapboxMap
              locations={allLocations}
              journeys={journeys}
              center={mapCenter as [number, number]}
              zoom={mapZoom}
              style={mapStyle}
              className="w-full h-full"
            />
          </div>
        )}
      </div>
    );
  }
);

RecommendPanel.displayName = 'RecommendPanel';