"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, MapPin, Plane, Building, Package, Users, Minus, Plus } from "lucide-react";
import { format } from "date-fns";

import type { SearchType, SearchFormData, AdvancedSearchFormProps } from "@/types/search-form";

export function AdvancedSearchForm({
  initialData,
  onSearch,
  isLoading = false,
  className,
}: AdvancedSearchFormProps) {
  const [searchData, setSearchData] = useState<SearchFormData>({
    type: "flights",
    destination: "",
    departureDate: undefined,
    returnDate: undefined,
    tripType: "round-trip",
    passengers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    rooms: [
      {
        adults: 2,
        children: 0,
        childrenAges: [],
      },
    ],
    class: "economy",
    ...initialData,
  });

  const [showReturnDate, setShowReturnDate] = useState(
    searchData.type === "flights" ? searchData.tripType === "round-trip" : true
  );

  useEffect(() => {
    if (initialData) {
      setSearchData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchData(prev => ({
      ...prev,
      type,
      // Reset type-specific fields
      ...(type === "hotels" && {
        origin: undefined,
        tripType: undefined,
        checkIn: prev.departureDate,
        checkOut: prev.returnDate,
      }),
      ...(type === "flights" && {
        checkIn: undefined,
        checkOut: undefined,
        departureDate: prev.checkIn,
        returnDate: prev.checkOut,
      }),
    }));
    setShowReturnDate(type !== "flights" || searchData.tripType === "round-trip");
  };

  const handlePassengerChange = (type: "adults" | "children" | "infants", delta: number) => {
    setSearchData(prev => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, prev.passengers[type] + delta),
      },
    }));
  };

  const handleRoomChange = (roomIndex: number, field: "adults" | "children", delta: number) => {
    setSearchData(prev => ({
      ...prev,
      rooms: prev.rooms.map((room, index) =>
        index === roomIndex
          ? {
              ...room,
              [field]: Math.max(field === "adults" ? 1 : 0, room[field] + delta),
              ...(field === "children" && delta < 0 && {
                childrenAges: room.childrenAges.slice(0, room.children + delta),
              }),
            }
          : room
      ),
    }));
  };

  const addRoom = () => {
    setSearchData(prev => ({
      ...prev,
      rooms: [
        ...prev.rooms,
        {
          adults: 2,
          children: 0,
          childrenAges: [],
        },
      ],
    }));
  };

  const removeRoom = (roomIndex: number) => {
    if (searchData.rooms.length > 1) {
      setSearchData(prev => ({
        ...prev,
        rooms: prev.rooms.filter((_, index) => index !== roomIndex),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchData);
  };

  const isFormValid = () => {
    const hasDestination = searchData.destination.trim().length > 0;
    const hasOrigin = searchData.type === "hotels" || (searchData.origin && searchData.origin.trim().length > 0);
    const hasDepartureDate = searchData.type === "hotels" ? !!searchData.checkIn : !!searchData.departureDate;
    
    return hasDestination && hasOrigin && hasDepartureDate;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Find Your Perfect Trip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search Type Tabs */}
          <Tabs
            value={searchData.type}
            onValueChange={(value) => handleSearchTypeChange(value as SearchType)}
          >
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

            <TabsContent value="flights" className="space-y-4 mt-6">
              {/* Trip Type for Flights */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={searchData.tripType === "round-trip" ? "default" : "outline"}
                  onClick={() => {
                    setSearchData(prev => ({ ...prev, tripType: "round-trip" }));
                    setShowReturnDate(true);
                  }}
                  className="flex-1"
                >
                  Round Trip
                </Button>
                <Button
                  type="button"
                  variant={searchData.tripType === "one-way" ? "default" : "outline"}
                  onClick={() => {
                    setSearchData(prev => ({ ...prev, tripType: "one-way", returnDate: undefined }));
                    setShowReturnDate(false);
                  }}
                  className="flex-1"
                >
                  One Way
                </Button>
              </div>

              {/* Origin and Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">From</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="origin"
                      placeholder="Departure city or airport"
                      value={searchData.origin || ""}
                      onChange={(e) => setSearchData(prev => ({ ...prev, origin: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">To</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="Destination city or airport"
                      value={searchData.destination}
                      onChange={(e) => setSearchData(prev => ({ ...prev, destination: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hotels" className="space-y-4 mt-6">
              {/* Hotel Destination */}
              <div className="space-y-2">
                <Label htmlFor="hotel-destination">Destination</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hotel-destination"
                    placeholder="City, hotel name, or landmark"
                    value={searchData.destination}
                    onChange={(e) => setSearchData(prev => ({ ...prev, destination: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="packages" className="space-y-4 mt-6">
              {/* Package Origin and Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="package-origin">From</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="package-origin"
                      placeholder="Departure city"
                      value={searchData.origin || ""}
                      onChange={(e) => setSearchData(prev => ({ ...prev, origin: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-destination">To</Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="package-destination"
                      placeholder="Destination"
                      value={searchData.destination}
                      onChange={(e) => setSearchData(prev => ({ ...prev, destination: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {searchData.type === "hotels" ? "Check-in" : "Departure Date"}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !(searchData.type === "hotels" ? searchData.checkIn : searchData.departureDate) && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {(searchData.type === "hotels" ? searchData.checkIn : searchData.departureDate) ? (
                      format(searchData.type === "hotels" ? searchData.checkIn! : searchData.departureDate!, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={searchData.type === "hotels" ? searchData.checkIn : searchData.departureDate}
                    onSelect={(date) => {
                      if (searchData.type === "hotels") {
                        setSearchData(prev => ({ ...prev, checkIn: date }));
                      } else {
                        setSearchData(prev => ({ ...prev, departureDate: date }));
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {showReturnDate && (
              <div className="space-y-2">
                <Label>
                  {searchData.type === "hotels" ? "Check-out" : "Return Date"}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !(searchData.type === "hotels" ? searchData.checkOut : searchData.returnDate) && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {(searchData.type === "hotels" ? searchData.checkOut : searchData.returnDate) ? (
                        format(searchData.type === "hotels" ? searchData.checkOut! : searchData.returnDate!, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={searchData.type === "hotels" ? searchData.checkOut : searchData.returnDate}
                      onSelect={(date) => {
                        if (searchData.type === "hotels") {
                          setSearchData(prev => ({ ...prev, checkOut: date }));
                        } else {
                          setSearchData(prev => ({ ...prev, returnDate: date }));
                        }
                      }}
                      disabled={(date) => {
                        const minDate = searchData.type === "hotels" ? searchData.checkIn : searchData.departureDate;
                        return date < new Date() || (minDate ? date <= minDate : false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Passengers/Guests Selection */}
          {(searchData.type === "flights" || searchData.type === "packages") && (
            <div className="space-y-4">
              <Label>Passengers</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Adults</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange("adults", -1)}
                      disabled={searchData.passengers.adults <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{searchData.passengers.adults}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange("adults", 1)}
                      disabled={searchData.passengers.adults >= 9}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Children (2-11)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange("children", -1)}
                      disabled={searchData.passengers.children <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{searchData.passengers.children}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange("children", 1)}
                      disabled={searchData.passengers.children >= 8}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Infants (0-2)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange("infants", -1)}
                      disabled={searchData.passengers.infants <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{searchData.passengers.infants}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange("infants", 1)}
                      disabled={searchData.passengers.infants >= searchData.passengers.adults}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Room Selection for Hotels and Packages */}
          {(searchData.type === "hotels" || searchData.type === "packages") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Rooms</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRoom}
                  disabled={searchData.rooms.length >= 4}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Room
                </Button>
              </div>

              {searchData.rooms.map((room, roomIndex) => (
                <Card key={roomIndex} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Room {roomIndex + 1}</h4>
                    {searchData.rooms.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRoom(roomIndex)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Adults</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoomChange(roomIndex, "adults", -1)}
                          disabled={room.adults <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{room.adults}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoomChange(roomIndex, "adults", 1)}
                          disabled={room.adults >= 4}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Children</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoomChange(roomIndex, "children", -1)}
                          disabled={room.children <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{room.children}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoomChange(roomIndex, "children", 1)}
                          disabled={room.children >= 3}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Class Selection for Flights and Packages */}
          {(searchData.type === "flights" || searchData.type === "packages") && (
            <div className="space-y-2">
              <Label>Class</Label>
              <Select
                value={searchData.class}
                onValueChange={(value) => setSearchData(prev => ({ ...prev, class: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium-economy">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? "Searching..." : `Search ${searchData.type}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
