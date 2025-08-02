"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchFilters } from "@/types/api/common";
import { SlidersHorizontal, X } from "lucide-react";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export function SearchFiltersComponent({ 
  filters, 
  onFiltersChange, 
  className 
}: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [isOpen, setIsOpen] = useState(false);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handlePriceRangeChange = (min?: number, max?: number) => {
    const newFilters = {
      ...localFilters,
      priceRange: min !== undefined || max !== undefined ? { min, max } : undefined,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDurationChange = (min?: number, max?: number) => {
    const newFilters = {
      ...localFilters,
      duration: min !== undefined || max !== undefined ? { min, max } : undefined,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStopsChange = (stops: number[]) => {
    const newFilters = {
      ...localFilters,
      stops: stops.length > 0 ? stops : undefined,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAirlinesChange = (airlines: string[]) => {
    const newFilters = {
      ...localFilters,
      airlines: airlines.length > 0 ? airlines : undefined,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.keys(localFilters).some(key => {
    const value = localFilters[key as keyof SearchFilters];
    return value !== undefined && value !== null;
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </span>
          {isOpen ? <X className="h-4 w-4" /> : null}
        </Button>
      </div>

      {/* Filter Content */}
      <div className={cn(
        "space-y-4",
        "md:block", // Always show on desktop
        isOpen ? "block" : "hidden" // Toggle on mobile
      )}>
        {/* Price Range */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Min Price</label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={localFilters.priceRange?.min || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    handlePriceRangeChange(value, localFilters.priceRange?.max);
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Max Price</label>
                <Input
                  type="number"
                  placeholder="$1000"
                  value={localFilters.priceRange?.max || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    handlePriceRangeChange(localFilters.priceRange?.min, value);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stops */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Stops</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { value: 0, label: "Direct" },
              { value: 1, label: "1 Stop" },
              { value: 2, label: "2+ Stops" },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.stops?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentStops = localFilters.stops || [];
                    if (e.target.checked) {
                      handleStopsChange([...currentStops, option.value]);
                    } else {
                      handleStopsChange(currentStops.filter(s => s !== option.value));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Duration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Flight Duration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Min (hours)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localFilters.duration?.min ? Math.floor(localFilters.duration.min / 60) : ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) * 60 : undefined;
                    handleDurationChange(value, localFilters.duration?.max);
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Max (hours)</label>
                <Input
                  type="number"
                  placeholder="24"
                  value={localFilters.duration?.max ? Math.floor(localFilters.duration.max / 60) : ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) * 60 : undefined;
                    handleDurationChange(localFilters.duration?.min, value);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Airlines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Airlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "American Airlines",
              "Delta Air Lines", 
              "United Airlines",
              "Southwest Airlines",
              "JetBlue Airways",
            ].map((airline) => (
              <label key={airline} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.airlines?.includes(airline) || false}
                  onChange={(e) => {
                    const currentAirlines = localFilters.airlines || [];
                    if (e.target.checked) {
                      handleAirlinesChange([...currentAirlines, airline]);
                    } else {
                      handleAirlinesChange(currentAirlines.filter(a => a !== airline));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{airline}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
}
