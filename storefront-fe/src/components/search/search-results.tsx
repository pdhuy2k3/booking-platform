"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FlightCard } from "@/components/booking/flight-card";
import { SkeletonSearchResults } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FlightOffer, FlightSearchResponse } from "@/types/api/flight";
import { SortOption } from "@/types/api/common";
import { ArrowUpDown, Filter } from "lucide-react";

interface SearchResultsProps {
  results?: FlightSearchResponse;
  isLoading: boolean;
  error?: Error | null;
  sort?: SortOption;
  onSortChange: (sort: SortOption) => void;
  onFlightSelect: (flight: FlightOffer) => void;
  className?: string;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "duration_asc", label: "Duration: Shortest" },
  { value: "departure_asc", label: "Departure: Earliest" },
  { value: "departure_desc", label: "Departure: Latest" },
  { value: "popularity", label: "Most Popular" },
];

export function SearchResults({
  results,
  isLoading,
  error,
  sort = "price_asc",
  onSortChange,
  onFlightSelect,
  className,
}: SearchResultsProps) {
  const [showSortOptions, setShowSortOptions] = useState(false);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <SkeletonSearchResults />
      </div>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <CardContent>
          <div className="space-y-4">
            <div className="text-destructive text-lg font-semibold">
              Search Failed
            </div>
            <p className="text-muted-foreground">
              We couldn&apos;t find flights for your search. Please try different dates or destinations.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results || !results.offers || results.offers.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <CardContent>
          <div className="space-y-4">
            <div className="text-lg font-semibold">No Flights Found</div>
            <p className="text-muted-foreground">
              We couldn't find any flights matching your criteria. Try adjusting your search or filters.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSortOption = SORT_OPTIONS.find(option => option.value === sort);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {results.meta.count} flight{results.meta.count !== 1 ? "s" : ""} found
        </div>
        
        {/* Sort Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSortOptions(!showSortOptions)}
            className="gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {currentSortOption?.label || "Sort by"}
          </Button>
          
          {showSortOptions && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-background border rounded-md shadow-lg min-w-[200px]">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortOptions(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors",
                    sort === option.value && "bg-accent font-medium"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Flight Results */}
      <div className="space-y-4">
        {results.offers.map((flight, index) => (
          <FlightCard
            key={`${flight.id}-${index}`}
            flight={flight}
            onSelect={onFlightSelect}
            className="hover:shadow-lg transition-shadow"
          />
        ))}
      </div>

      {/* Load More / Pagination */}
      {results.offers.length < results.meta.count && (
        <div className="text-center pt-4">
          <Button variant="outline" size="lg">
            Load More Flights
          </Button>
        </div>
      )}
    </div>
  );
}

// Compact search summary component
export function SearchSummary({
  origin,
  destination,
  departureDate,
  returnDate,
  passengers,
  tripType,
  className,
}: {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: { adults: number; children: number; infants: number };
  tripType?: string;
  className?: string;
}) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPassengers = () => {
    if (!passengers) return "1 passenger";
    const total = passengers.adults + passengers.children + passengers.infants;
    return `${total} passenger${total !== 1 ? "s" : ""}`;
  };

  return (
    <Card className={cn("mb-6", className)}>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{origin}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium">{destination}</span>
          </div>
          
          <div className="text-muted-foreground">•</div>
          
          <div>
            {formatDate(departureDate)}
            {returnDate && tripType === "round-trip" && (
              <>
                <span className="text-muted-foreground mx-2">-</span>
                {formatDate(returnDate)}
              </>
            )}
          </div>
          
          <div className="text-muted-foreground">•</div>
          
          <div>{formatPassengers()}</div>
          
          <div className="text-muted-foreground">•</div>
          
          <div className="capitalize">{tripType?.replace("-", " ")}</div>
        </div>
      </CardContent>
    </Card>
  );
}
