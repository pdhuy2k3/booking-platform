"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Search, CalendarIcon, MapPin, Plane, Building, Package, Users } from "lucide-react";
import { format } from "date-fns";

export type QuickSearchType = "flights" | "hotels" | "packages";

interface QuickSearchWidgetProps {
  className?: string;
  compact?: boolean;
}

export function QuickSearchWidget({ className, compact = false }: QuickSearchWidgetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchType, setSearchType] = useState<QuickSearchType>("flights");
  const [searchData, setSearchData] = useState({
    origin: "",
    destination: "",
    departureDate: undefined as Date | undefined,
    returnDate: undefined as Date | undefined,
    passengers: 1,
  });

  const handleQuickSearch = () => {
    if (!searchData.destination.trim()) return;

    const params = new URLSearchParams();
    params.set("type", searchType);
    
    if (searchData.origin.trim()) {
      params.set("from", searchData.origin);
    }
    params.set("to", searchData.destination);
    
    if (searchData.departureDate) {
      if (searchType === "hotels") {
        params.set("checkin", format(searchData.departureDate, "yyyy-MM-dd"));
        if (searchData.returnDate) {
          params.set("checkout", format(searchData.returnDate, "yyyy-MM-dd"));
        }
      } else {
        params.set("depart", format(searchData.departureDate, "yyyy-MM-dd"));
        if (searchData.returnDate) {
          params.set("return", format(searchData.returnDate, "yyyy-MM-dd"));
        }
      }
    }
    
    params.set("adults", searchData.passengers.toString());
    
    router.push(`/search?${params.toString()}`);
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleQuickSearch();
    }
  };

  if (compact) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <Search className="h-4 w-4" />
            Quick Search
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Quick Search</h3>
              <Tabs value={searchType} onValueChange={(value) => setSearchType(value as QuickSearchType)}>
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="flights" className="text-xs">
                    <Plane className="h-3 w-3" />
                  </TabsTrigger>
                  <TabsTrigger value="hotels" className="text-xs">
                    <Building className="h-3 w-3" />
                  </TabsTrigger>
                  <TabsTrigger value="packages" className="text-xs">
                    <Package className="h-3 w-3" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-3">
              {(searchType === "flights" || searchType === "packages") && (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="From"
                    value={searchData.origin}
                    onChange={(e) => setSearchData(prev => ({ ...prev, origin: e.target.value }))}
                    className="pl-10"
                    onKeyPress={handleKeyPress}
                  />
                </div>
              )}
              
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchType === "hotels" ? "Destination" : "To"}
                  value={searchData.destination}
                  onChange={(e) => setSearchData(prev => ({ ...prev, destination: e.target.value }))}
                  className="pl-10"
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !searchData.departureDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchData.departureDate ? (
                        format(searchData.departureDate, "MMM dd")
                      ) : (
                        <span>{searchType === "hotels" ? "Check-in" : "Depart"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={searchData.departureDate}
                      onSelect={(date) => setSearchData(prev => ({ ...prev, departureDate: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !searchData.returnDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchData.returnDate ? (
                        format(searchData.returnDate, "MMM dd")
                      ) : (
                        <span>{searchType === "hotels" ? "Check-out" : "Return"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={searchData.returnDate}
                      onSelect={(date) => setSearchData(prev => ({ ...prev, returnDate: date }))}
                      disabled={(date) => {
                        return date < new Date() || (searchData.departureDate && date <= searchData.departureDate);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Passengers:</span>
                  <Badge variant="outline">{searchData.passengers}</Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchData(prev => ({ ...prev, passengers: Math.max(1, prev.passengers - 1) }))}
                    disabled={searchData.passengers <= 1}
                  >
                    -
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchData(prev => ({ ...prev, passengers: Math.min(9, prev.passengers + 1) }))}
                    disabled={searchData.passengers >= 9}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleQuickSearch} 
              className="w-full"
              disabled={!searchData.destination.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              Search {searchType}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Full widget version
  return (
    <div className={cn("bg-white rounded-lg shadow-lg p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quick Search</h3>
        <Tabs value={searchType} onValueChange={(value) => setSearchType(value as QuickSearchType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="flights" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Flights
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Packages
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(searchType === "flights" || searchType === "packages") && (
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="From (City or Airport)"
                value={searchData.origin}
                onChange={(e) => setSearchData(prev => ({ ...prev, origin: e.target.value }))}
                className="pl-10"
                onKeyPress={handleKeyPress}
              />
            </div>
          )}
          
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchType === "hotels" ? "Destination (City or Hotel)" : "To (City or Airport)"}
              value={searchData.destination}
              onChange={(e) => setSearchData(prev => ({ ...prev, destination: e.target.value }))}
              className="pl-10"
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !searchData.departureDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchData.departureDate ? (
                  format(searchData.departureDate, "PPP")
                ) : (
                  <span>{searchType === "hotels" ? "Check-in Date" : "Departure Date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={searchData.departureDate}
                onSelect={(date) => setSearchData(prev => ({ ...prev, departureDate: date }))}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !searchData.returnDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchData.returnDate ? (
                  format(searchData.returnDate, "PPP")
                ) : (
                  <span>{searchType === "hotels" ? "Check-out Date" : "Return Date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={searchData.returnDate}
                onSelect={(date) => setSearchData(prev => ({ ...prev, returnDate: date }))}
                disabled={(date) => {
                  return date < new Date() || (searchData.departureDate && date <= searchData.departureDate);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Passengers:</span>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchData(prev => ({ ...prev, passengers: Math.max(1, prev.passengers - 1) }))}
                disabled={searchData.passengers <= 1}
              >
                -
              </Button>
              <Badge variant="outline" className="min-w-[2rem] text-center">
                {searchData.passengers}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchData(prev => ({ ...prev, passengers: Math.min(9, prev.passengers + 1) }))}
                disabled={searchData.passengers >= 9}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleQuickSearch} 
          className="w-full"
          size="lg"
          disabled={!searchData.destination.trim()}
        >
          <Search className="h-4 w-4 mr-2" />
          Search {searchType}
        </Button>
      </div>
    </div>
  );
}
