"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, X, Filter } from "lucide-react";
import { FlightFilters, HotelFilters, PackageFilters } from "@/types/api/common";

export type SearchType = "flights" | "hotels" | "packages";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterSection {
  id: string;
  title: string;
  type: "checkbox" | "range" | "select" | "rating";
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultOpen?: boolean;
}

interface AdvancedFiltersProps {
  searchType: SearchType;
  filters: FlightFilters | HotelFilters | PackageFilters;
  onFiltersChange: (filters: FlightFilters | HotelFilters | PackageFilters) => void;
  availableFilters?: {
    airlines?: FilterOption[];
    airports?: FilterOption[];
    amenities?: FilterOption[];
    hotelChains?: FilterOption[];
    neighborhoods?: FilterOption[];
    activities?: FilterOption[];
  };
  className?: string;
}

export function AdvancedFilters({
  searchType,
  filters,
  onFiltersChange,
  availableFilters = {},
  className,
}: AdvancedFiltersProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["price", "duration", "stops"])
  );

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const getFilterSections = (): FilterSection[] => {
    const commonSections: FilterSection[] = [
      {
        id: "price",
        title: "Price Range",
        type: "range",
        min: 0,
        max: searchType === "flights" ? 5000 : searchType === "hotels" ? 1000 : 10000,
        step: searchType === "flights" ? 50 : searchType === "hotels" ? 25 : 100,
        unit: "$",
        defaultOpen: true,
      },
    ];

    if (searchType === "flights") {
      return [
        ...commonSections,
        {
          id: "stops",
          title: "Stops",
          type: "checkbox",
          options: [
            { id: "0", label: "Direct", count: 45 },
            { id: "1", label: "1 Stop", count: 123 },
            { id: "2", label: "2+ Stops", count: 67 },
          ],
          defaultOpen: true,
        },
        {
          id: "duration",
          title: "Flight Duration",
          type: "range",
          min: 1,
          max: 24,
          step: 1,
          unit: "hours",
          defaultOpen: true,
        },
        {
          id: "airlines",
          title: "Airlines",
          type: "checkbox",
          options: availableFilters.airlines || [
            { id: "AA", label: "American Airlines", count: 23 },
            { id: "DL", label: "Delta Air Lines", count: 18 },
            { id: "UA", label: "United Airlines", count: 15 },
            { id: "SW", label: "Southwest Airlines", count: 12 },
          ],
        },
        {
          id: "departureTime",
          title: "Departure Time",
          type: "checkbox",
          options: [
            { id: "early", label: "Early Morning (6AM - 12PM)", count: 34 },
            { id: "afternoon", label: "Afternoon (12PM - 6PM)", count: 56 },
            { id: "evening", label: "Evening (6PM - 12AM)", count: 23 },
            { id: "night", label: "Night (12AM - 6AM)", count: 8 },
          ],
        },
        {
          id: "class",
          title: "Class",
          type: "checkbox",
          options: [
            { id: "economy", label: "Economy", count: 89 },
            { id: "premium-economy", label: "Premium Economy", count: 34 },
            { id: "business", label: "Business", count: 12 },
            { id: "first", label: "First Class", count: 3 },
          ],
        },
      ];
    }

    if (searchType === "hotels") {
      return [
        ...commonSections,
        {
          id: "starRating",
          title: "Star Rating",
          type: "rating",
          options: [
            { id: "5", label: "5 Stars", count: 12 },
            { id: "4", label: "4 Stars", count: 34 },
            { id: "3", label: "3 Stars", count: 56 },
            { id: "2", label: "2 Stars", count: 23 },
            { id: "1", label: "1 Star", count: 8 },
          ],
          defaultOpen: true,
        },
        {
          id: "amenities",
          title: "Amenities",
          type: "checkbox",
          options: availableFilters.amenities || [
            { id: "wifi", label: "Free WiFi", count: 89 },
            { id: "pool", label: "Swimming Pool", count: 45 },
            { id: "gym", label: "Fitness Center", count: 34 },
            { id: "spa", label: "Spa", count: 23 },
            { id: "parking", label: "Free Parking", count: 67 },
            { id: "breakfast", label: "Free Breakfast", count: 56 },
          ],
        },
        {
          id: "propertyType",
          title: "Property Type",
          type: "checkbox",
          options: [
            { id: "hotel", label: "Hotel", count: 78 },
            { id: "resort", label: "Resort", count: 23 },
            { id: "apartment", label: "Apartment", count: 34 },
            { id: "villa", label: "Villa", count: 12 },
            { id: "hostel", label: "Hostel", count: 8 },
          ],
        },
        {
          id: "guestRating",
          title: "Guest Rating",
          type: "range",
          min: 1,
          max: 10,
          step: 0.5,
          unit: "/10",
        },
        {
          id: "distanceFromCenter",
          title: "Distance from Center",
          type: "range",
          min: 0,
          max: 50,
          step: 1,
          unit: "km",
        },
      ];
    }

    if (searchType === "packages") {
      return [
        ...commonSections,
        {
          id: "packageType",
          title: "Package Type",
          type: "checkbox",
          options: [
            { id: "flight_hotel", label: "Flight + Hotel", count: 45 },
            { id: "flight_hotel_car", label: "Flight + Hotel + Car", count: 23 },
            { id: "all_inclusive", label: "All Inclusive", count: 34 },
          ],
          defaultOpen: true,
        },
        {
          id: "duration",
          title: "Duration",
          type: "range",
          min: 1,
          max: 21,
          step: 1,
          unit: "nights",
          defaultOpen: true,
        },
        {
          id: "hotelStarRating",
          title: "Hotel Star Rating",
          type: "rating",
          options: [
            { id: "5", label: "5 Stars", count: 12 },
            { id: "4", label: "4 Stars", count: 34 },
            { id: "3", label: "3 Stars", count: 56 },
          ],
        },
        {
          id: "activities",
          title: "Activities",
          type: "checkbox",
          options: availableFilters.activities || [
            { id: "sightseeing", label: "Sightseeing", count: 67 },
            { id: "adventure", label: "Adventure", count: 34 },
            { id: "cultural", label: "Cultural", count: 45 },
            { id: "food", label: "Food & Dining", count: 56 },
            { id: "relaxation", label: "Relaxation", count: 23 },
          ],
        },
        {
          id: "mealPlan",
          title: "Meal Plan",
          type: "checkbox",
          options: [
            { id: "breakfast", label: "Breakfast Included", count: 78 },
            { id: "half_board", label: "Half Board", count: 34 },
            { id: "full_board", label: "Full Board", count: 23 },
            { id: "all_inclusive", label: "All Inclusive", count: 45 },
          ],
        },
      ];
    }

    return commonSections;
  };

  const renderFilterSection = (section: FilterSection) => {
    const isOpen = openSections.has(section.id);

    return (
      <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <span className="font-medium">{section.title}</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          {section.type === "checkbox" && section.options && (
            <div className="space-y-2">
              {section.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${section.id}-${option.id}`}
                    checked={(filters as any)[section.id]?.includes(option.id) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = (filters as any)[section.id] || [];
                      const newValues = checked
                        ? [...currentValues, option.id]
                        : currentValues.filter((v: string) => v !== option.id);
                      updateFilter(section.id, newValues.length > 0 ? newValues : undefined);
                    }}
                  />
                  <Label
                    htmlFor={`${section.id}-${option.id}`}
                    className="flex-1 text-sm cursor-pointer"
                  >
                    {option.label}
                    {option.count && (
                      <span className="text-muted-foreground ml-1">({option.count})</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {section.type === "range" && (
            <div className="space-y-3">
              <Slider
                value={[(filters as any)[section.id]?.min || section.min!, (filters as any)[section.id]?.max || section.max!]}
                onValueChange={([min, max]) => {
                  updateFilter(section.id, { min, max });
                }}
                min={section.min}
                max={section.max}
                step={section.step}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{(filters as any)[section.id]?.min || section.min}{section.unit}</span>
                <span>{(filters as any)[section.id]?.max || section.max}{section.unit}</span>
              </div>
            </div>
          )}

          {section.type === "rating" && section.options && (
            <div className="space-y-2">
              {section.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${section.id}-${option.id}`}
                    checked={(filters as any)[section.id]?.includes(parseInt(option.id)) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = (filters as any)[section.id] || [];
                      const newValues = checked
                        ? [...currentValues, parseInt(option.id)]
                        : currentValues.filter((v: number) => v !== parseInt(option.id));
                      updateFilter(section.id, newValues.length > 0 ? newValues : undefined);
                    }}
                  />
                  <Label
                    htmlFor={`${section.id}-${option.id}`}
                    className="flex-1 text-sm cursor-pointer flex items-center"
                  >
                    <div className="flex">
                      {Array.from({ length: parseInt(option.id) }, (_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                      {Array.from({ length: 5 - parseInt(option.id) }, (_, i) => (
                        <span key={i} className="text-gray-300">★</span>
                      ))}
                    </div>
                    <span className="ml-2">{option.label}</span>
                    {option.count && (
                      <span className="text-muted-foreground ml-1">({option.count})</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </CardTitle>
          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {getFilterSections().map((section, index) => (
              <div key={section.id}>
                {renderFilterSection(section)}
                {index < getFilterSections().length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
