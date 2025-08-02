"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AdvancedSearchForm, SearchType } from "@/components/search/advanced-search-form";
import { AdvancedFilters } from "@/components/search/advanced-filters";
import { UnifiedSearchResults, SortOption } from "@/components/search/unified-search-results";
import { FlightFilters, HotelFilters, PackageFilters } from "@/types/api/common";
import { FlightOffer } from "@/types/api/flight";
import { HotelOffer } from "@/types/api/hotel";
import { PackageOffer } from "@/types/api/package";
import { Filter, Search, MapPin, Calendar, Users, Settings } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useFlightSearch } from "@/hooks/api/use-flights";
import { useHotelSearch } from "@/hooks/api/use-hotels";
import { usePackageSearch } from "@/hooks/api/use-packages";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // API hooks
  const flightSearch = useFlightSearch();
  const hotelSearch = useHotelSearch();
  const packageSearch = usePackageSearch();

  // Get search type from URL or default to flights
  const searchType = (searchParams.get("type") as SearchType) || "flights";
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FlightOffer[] | HotelOffer[] | PackageOffer[]>([]);
  const [filters, setFilters] = useState<FlightFilters | HotelFilters | PackageFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>("price");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Parse search parameters from URL
  const getSearchDataFromURL = () => {
    const params = Object.fromEntries(searchParams.entries());
    
    return {
      type: searchType,
      origin: params.from || params.origin,
      destination: params.to || params.destination,
      departureDate: params.depart ? new Date(params.depart) : undefined,
      returnDate: params.return ? new Date(params.return) : undefined,
      checkIn: params.checkin ? new Date(params.checkin) : undefined,
      checkOut: params.checkout ? new Date(params.checkout) : undefined,
      tripType: params.tripType as "one-way" | "round-trip",
      passengers: {
        adults: parseInt(params.adults || "1"),
        children: parseInt(params.children || "0"),
        infants: parseInt(params.infants || "0"),
      },
      rooms: params.rooms ? JSON.parse(params.rooms) : [
        {
          adults: parseInt(params.roomAdults || "2"),
          children: parseInt(params.roomChildren || "0"),
          childrenAges: [],
        },
      ],
      class: params.class as "economy" | "premium-economy" | "business" | "first",
    };
  };

  const searchData = getSearchDataFromURL();

  // Parse filters from URL
  useEffect(() => {
    const urlFilters: Record<string, unknown> = {};
    
    // Parse filter parameters
    if (searchParams.get("minPrice")) urlFilters.priceRange = { min: parseInt(searchParams.get("minPrice")!) };
    if (searchParams.get("maxPrice")) {
      urlFilters.priceRange = { ...(urlFilters.priceRange as object || {}), max: parseInt(searchParams.get("maxPrice")!) };
    }
    
    if (searchParams.get("stops")) {
      urlFilters.stops = searchParams.get("stops")!.split(",").map(Number);
    }
    
    if (searchParams.get("airlines")) {
      urlFilters.airlines = searchParams.get("airlines")!.split(",");
    }
    
    if (searchParams.get("amenities")) {
      urlFilters.amenities = searchParams.get("amenities")!.split(",");
    }
    
    if (searchParams.get("starRating")) {
      urlFilters.starRating = searchParams.get("starRating")!.split(",").map(Number);
    }

    setFilters(urlFilters);
  }, [searchParams]);

  // Update URL when filters change
  const updateURL = (newFilters: FlightFilters | HotelFilters | PackageFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Clear existing filter params
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("stops");
    params.delete("airlines");
    params.delete("amenities");
    params.delete("starRating");
    
    // Add new filter params
    if (newFilters.priceRange?.min) params.set("minPrice", newFilters.priceRange.min.toString());
    if (newFilters.priceRange?.max) params.set("maxPrice", newFilters.priceRange.max.toString());
    
    if ("stops" in newFilters && newFilters.stops?.length) {
      params.set("stops", newFilters.stops.join(","));
    }
    
    if ("airlines" in newFilters && newFilters.airlines?.length) {
      params.set("airlines", newFilters.airlines.join(","));
    }
    
    if ("amenities" in newFilters && newFilters.amenities?.length) {
      params.set("amenities", newFilters.amenities.join(","));
    }
    
    if ("starRating" in newFilters && newFilters.starRating?.length) {
      params.set("starRating", newFilters.starRating.join(","));
    }

    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: FlightFilters | HotelFilters | PackageFilters) => {
    setFilters(newFilters);
    updateURL(newFilters);
    performSearch(newFilters);
  };

  // Perform search with current parameters
  const performSearch = useCallback(async (_currentFilters = filters) => {
    setIsLoading(true);

    try {
      let searchResults: (FlightOffer | HotelOffer | PackageOffer)[] = [];

      if (searchType === "flights") {
        // Prepare flight search parameters
        const flightParams = {
          origin: searchData.origin || "",
          destination: searchData.destination || "",
          departureDate: searchData.departureDate ? searchData.departureDate.toISOString().split('T')[0] : "",
          returnDate: searchData.returnDate ? searchData.returnDate.toISOString().split('T')[0] : "",
          tripType: searchData.tripType || "round-trip",
          passengers: {
            adults: searchData.passengers.adults || 1,
            children: searchData.passengers.children || 0,
            infants: searchData.passengers.infants || 0
          },
          class: searchData.class || "economy"
        };

        const response = await flightSearch.mutateAsync(flightParams);
        searchResults = response.offers || [];

      } else if (searchType === "hotels") {
        // Prepare hotel search parameters
        const hotelParams = {
          destination: searchData.destination || "",
          checkIn: searchData.checkIn ? searchData.checkIn.toISOString().split('T')[0] : "",
          checkOut: searchData.checkOut ? searchData.checkOut.toISOString().split('T')[0] : "",
          rooms: searchData.rooms || [{ adults: 2, children: 0, childrenAges: [] }]
        };

        const response = await hotelSearch.mutateAsync(hotelParams);
        searchResults = response.hotels || [];

      } else if (searchType === "packages") {
        // Prepare package search parameters
        const packageParams = {
          origin: searchData.origin || "",
          destination: searchData.destination || "",
          departureDate: searchData.departureDate ? searchData.departureDate.toISOString().split('T')[0] : "",
          returnDate: searchData.returnDate ? searchData.returnDate.toISOString().split('T')[0] : "",
          passengers: {
            adults: searchData.passengers.adults || 1,
            children: searchData.passengers.children || 0,
            infants: searchData.passengers.infants || 0
          },
          rooms: searchData.rooms || [{ adults: 2, children: 0, childrenAges: [] }],
          preferences: {
            flightClass: searchData.class || "economy"
          }
        };

        const response = await packageSearch.mutateAsync(packageParams);
        searchResults = response.packages || [];
      }

      setResults(searchResults);
      toast.success(`Found ${searchResults.length} ${searchType}`);

    } catch (error: unknown) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to search. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchType, searchData, flightSearch, hotelSearch, packageSearch, filters]);

  // Initial search on page load

  // Initial search on page load
  useEffect(() => {
    if (searchData.destination) {
      performSearch();
    }
  }, [searchType, searchData.destination, performSearch]);

  // Handle new search from form
  const handleNewSearch = (newSearchData: SearchFormData) => {
  const params = new URLSearchParams();

  params.set("type", newSearchData.type);
  if (newSearchData.origin) params.set("from", newSearchData.origin);
  params.set("to", newSearchData.destination);

  if (newSearchData.type === "hotels") {
    if (newSearchData.checkIn) params.set("checkin", format(newSearchData.checkIn, "yyyy-MM-dd"));
    if (newSearchData.checkOut) params.set("checkout", format(newSearchData.checkOut, "yyyy-MM-dd"));
  } else {
    if (newSearchData.departureDate) params.set("depart", format(newSearchData.departureDate, "yyyy-MM-dd"));
    if (newSearchData.returnDate) params.set("return", format(newSearchData.returnDate, "yyyy-MM-dd"));
    if (newSearchData.tripType) params.set("tripType", newSearchData.tripType);
  }

  params.set("adults", newSearchData.passengers.adults.toString());
  params.set("children", newSearchData.passengers.children.toString());
  params.set("infants", newSearchData.passengers.infants.toString());

  if (newSearchData.rooms) params.set("rooms", JSON.stringify(newSearchData.rooms));
  if (newSearchData.class) params.set("class", newSearchData.class);

  router.push(`/search?${params.toString()}`);
};

  // Handle result selection
  const handleResultSelect = (result: FlightOffer | HotelOffer | PackageOffer) => {
    // Navigate to booking page
    router.push(`/booking/${searchType}/${result.id}`);
  };

  // Get search summary for display
  const getSearchSummary = () => {
    if (!searchData.destination) return "";
    
    const parts = [];
    
    if (searchData.origin) {
      parts.push(`${searchData.origin} → ${searchData.destination}`);
    } else {
      parts.push(searchData.destination);
    }
    
    if (searchData.departureDate) {
      const departDate = format(searchData.departureDate, "MMM dd, yyyy");
      if (searchData.returnDate) {
        const returnDate = format(searchData.returnDate, "MMM dd, yyyy");
        parts.push(`${departDate} - ${returnDate}`);
      } else {
        parts.push(departDate);
      }
    } else if (searchData.checkIn) {
      const checkInDate = format(searchData.checkIn, "MMM dd, yyyy");
      if (searchData.checkOut) {
        const checkOutDate = format(searchData.checkOut, "MMM dd, yyyy");
        parts.push(`${checkInDate} - ${checkOutDate}`);
      } else {
        parts.push(checkInDate);
      }
    }
    
    const totalPassengers = searchData.passengers.adults + searchData.passengers.children + searchData.passengers.infants;
    if (totalPassengers > 0) {
      parts.push(`${totalPassengers} passenger${totalPassengers > 1 ? 's' : ''}`);
    }
    
    if (searchData.tripType) {
      parts.push(searchData.tripType.replace('-', ' '));
    }
    
    return parts.join(" • ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/search">Search</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{searchType}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Summary */}
        {searchData.destination && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {searchType === "flights" && <MapPin className="h-5 w-5 text-muted-foreground" />}
                    {searchType === "hotels" && <Calendar className="h-5 w-5 text-muted-foreground" />}
                    {searchType === "packages" && <Users className="h-5 w-5 text-muted-foreground" />}
                    <span className="font-medium">{getSearchSummary()}</span>
                  </div>
                  {Object.keys(filters).length > 0 && (
                    <Badge variant="secondary">
                      {Object.keys(filters).length} filter{Object.keys(filters).length > 1 ? 's' : ''} applied
                    </Badge>
                  )}
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Modify Search
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="top" className="h-[80vh]">
                    <div className="mt-6">
                      <AdvancedSearchForm
                        initialData={searchData}
                        onSearch={handleNewSearch}
                        isLoading={isLoading}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <AdvancedFilters
              searchType={searchType}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {Object.keys(filters).length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {Object.keys(filters).length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="mt-6">
                    <AdvancedFilters
                      searchType={searchType}
                      filters={filters}
                      onFiltersChange={(newFilters) => {
                        handleFiltersChange(newFilters);
                        setShowMobileFilters(false);
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <UnifiedSearchResults
              searchType={searchType}
              results={results}
              isLoading={isLoading}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onResultSelect={handleResultSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Search className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
