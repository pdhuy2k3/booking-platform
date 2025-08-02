"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Plane, 
  Building, 
  Package, 
  Clock, 
  MapPin, 
  Star, 
  Wifi, 
  Car,
  Utensils,
  Camera,
  Heart,
  Share2,
  ChevronRight
} from "lucide-react";
import { FlightOffer } from "@/types/api/flight";
import { HotelOffer } from "@/types/api/hotel";
import { PackageOffer } from "@/types/api/package";

export type SearchType = "flights" | "hotels" | "packages";
export type SortOption = "price" | "duration" | "rating" | "popularity" | "departure";

interface UnifiedSearchResultsProps {
  searchType: SearchType;
  results: FlightOffer[] | HotelOffer[] | PackageOffer[];
  isLoading?: boolean;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onResultSelect: (result: FlightOffer | HotelOffer | PackageOffer) => void;
  className?: string;
}

export function UnifiedSearchResults({
  searchType,
  results,
  isLoading = false,
  sortBy,
  onSortChange,
  onResultSelect,
  className,
}: UnifiedSearchResultsProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getSortOptions = (): { value: SortOption; label: string }[] => {
    const common = [
      { value: "price" as SortOption, label: "Price (Low to High)" },
      { value: "rating" as SortOption, label: "Rating (High to Low)" },
      { value: "popularity" as SortOption, label: "Popularity" },
    ];

    if (searchType === "flights") {
      return [
        ...common,
        { value: "duration" as SortOption, label: "Duration (Shortest)" },
        { value: "departure" as SortOption, label: "Departure Time" },
      ];
    }

    if (searchType === "hotels") {
      return [
        ...common,
        { value: "duration" as SortOption, label: "Distance from Center" },
      ];
    }

    return common;
  };

  const renderFlightResult = (flight: FlightOffer) => (
    <Card key={flight.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Airline Logo */}
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Plane className="h-6 w-6 text-gray-600" />
            </div>
            
            {/* Flight Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <div className="text-center">
                  <div className="font-semibold text-lg">{flight.outbound.departure.time}</div>
                  <div className="text-sm text-muted-foreground">{flight.outbound.departure.airport}</div>
                </div>
                
                <div className="flex-1 text-center">
                  <div className="text-sm text-muted-foreground mb-1">
                    {Math.floor(flight.outbound.duration / 60)}h {flight.outbound.duration % 60}m
                  </div>
                  <div className="border-t border-dashed border-gray-300 relative">
                    <Plane className="h-4 w-4 absolute top-[-8px] left-1/2 transform -translate-x-1/2 bg-white text-gray-400" />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {flight.outbound.stops === 0 ? "Direct" : `${flight.outbound.stops} stop${flight.outbound.stops > 1 ? 's' : ''}`}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="font-semibold text-lg">{flight.outbound.arrival.time}</div>
                  <div className="text-sm text-muted-foreground">{flight.outbound.arrival.airport}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{flight.airline.name}</span>
                <span>•</span>
                <span>{flight.aircraft}</span>
                <span>•</span>
                <Badge variant="outline">{flight.class}</Badge>
              </div>
            </div>
          </div>
          
          {/* Price and Actions */}
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-primary">
              ${flight.price.total.amount}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              per person
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(flight.id);
                }}
              >
                <Heart className={`h-4 w-4 ${favorites.has(flight.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button onClick={() => onResultSelect(flight)}>
                Select
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderHotelResult = (hotel: HotelOffer) => (
    <Card key={hotel.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Hotel Image */}
          <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building className="h-8 w-8 text-gray-600" />
          </div>
          
          {/* Hotel Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{hotel.hotel.name}</h3>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex">
                    {Array.from({ length: hotel.hotel.category }, (_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {hotel.hotel.rating.overall}/10 ({hotel.hotel.rating.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {hotel.hotel.address}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ${hotel.price.total.amount}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${hotel.price.perNight.amount}/night
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-3">
              <Badge variant="outline">{hotel.room.name}</Badge>
              <Badge variant="outline">{hotel.boardType.replace('_', ' ')}</Badge>
              {hotel.room.amenities.slice(0, 3).map((amenity) => (
                <div key={amenity.id} className="flex items-center text-sm text-muted-foreground">
                  <Wifi className="h-4 w-4 mr-1" />
                  {amenity.name}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {hotel.availability.roomsLeft} rooms left at this price
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(hotel.id);
                  }}
                >
                  <Heart className={`h-4 w-4 ${favorites.has(hotel.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button onClick={() => onResultSelect(hotel)}>
                  Book Now
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPackageResult = (pkg: PackageOffer) => (
    <Card key={pkg.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Package Image */}
          <div className="w-40 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="h-8 w-8 text-gray-600" />
          </div>
          
          {/* Package Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{pkg.name}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{pkg.destination.city}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{pkg.duration} nights</span>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < pkg.rating.overall ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({pkg.rating.reviews})</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ${pkg.price.total.amount}
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Save ${pkg.price.savings.amount}
                </div>
                <div className="text-sm text-muted-foreground">
                  vs booking separately
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <Plane className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{pkg.components.flights.airline.name}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{pkg.components.hotel.hotel.name}</span>
                </div>
              </div>
              <div className="space-y-1">
                {pkg.components.car && (
                  <div className="flex items-center text-sm">
                    <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Car rental included</span>
                  </div>
                )}
                {pkg.components.meals && (
                  <div className="flex items-center text-sm">
                    <Utensils className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Meals included</span>
                  </div>
                )}
                {pkg.components.activities && pkg.components.activities.length > 0 && (
                  <div className="flex items-center text-sm">
                    <Camera className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{pkg.components.activities.length} activities</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Badge variant="outline">{pkg.type.replace('_', ' + ')}</Badge>
                {pkg.inclusions.slice(0, 2).map((inclusion, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {inclusion}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(pkg.id);
                  }}
                >
                  <Heart className={`h-4 w-4 ${favorites.has(pkg.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button onClick={() => onResultSelect(pkg)}>
                  Book Package
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="w-32 h-24 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="w-24 space-y-2">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted-foreground">
          {results.length} {searchType} found
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {getSortOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.map((result) => {
          if (searchType === "flights") {
            return renderFlightResult(result as FlightOffer);
          } else if (searchType === "hotels") {
            return renderHotelResult(result as HotelOffer);
          } else {
            return renderPackageResult(result as PackageOffer);
          }
        })}
      </div>

      {results.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              No {searchType} found matching your criteria
            </div>
            <Button variant="outline">Modify Search</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
