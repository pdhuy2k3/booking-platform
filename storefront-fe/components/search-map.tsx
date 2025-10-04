"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { MapboxMap, type MapLocation } from '@/components/mapbox-map';
import { cn } from '@/lib/utils';

interface SearchMapProps {
  className?: string;
  locations?: MapLocation[];
  selectedLocation?: string;
  onLocationSelect?: (location: MapLocation) => void;
  showToggle?: boolean;
  defaultExpanded?: boolean;
}

export function SearchMap({
  className,
  locations = [],
  selectedLocation,
  onLocationSelect,
  showToggle = true,
  defaultExpanded = false
}: SearchMapProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [center, setCenter] = useState<[number, number]>([106.6297, 10.8231]); // Default to Ho Chi Minh City

  // Update map center when locations change
  useEffect(() => {
    if (locations.length > 0) {
      // Calculate center from all locations
      const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
      const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
      setCenter([avgLng, avgLat]);
    }
  }, [locations]);

  const handleLocationClick = (location: MapLocation) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isExpanded && showToggle) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <Button
            onClick={toggleExpanded}
            variant="outline"
            className="w-full justify-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Show Map
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-0">
        {showToggle && (
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Map View</span>
              {locations.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({locations.length} location{locations.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>
            <Button
              onClick={toggleExpanded}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="relative">
          <MapboxMap
            locations={locations}
            center={center}
            zoom={locations.length > 1 ? 10 : 12}
            onLocationClick={handleLocationClick}
            height={isExpanded ? "500px" : "300px"}
            className="w-full"
          />
          
          {locations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No locations to display
                </p>
              </div>
            </div>
          )}
        </div>
        
        {locations.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {locations.slice(0, 6).map((location) => (
                <Button
                  key={location.id}
                  variant={selectedLocation === location.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLocationClick(location)}
                  className="justify-start text-left h-auto p-2"
                >
                  <div className="flex items-start gap-2 w-full">
                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-xs truncate">
                        {location.name}
                      </div>
                      {location.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {location.description}
                        </div>
                      )}
                      {location.price && (
                        <div className="text-xs font-medium text-primary">
                          {location.price}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            {locations.length > 6 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                +{locations.length - 6} more location{locations.length - 6 !== 1 ? 's' : ''} on map
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SearchMap;