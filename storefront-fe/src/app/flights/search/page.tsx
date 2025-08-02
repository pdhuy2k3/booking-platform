"use client";

import { useEffect, useState } from "react";

import { FlightSearchForm } from "@/components/forms/search/flight-search-form";
import { SearchResults, SearchSummary } from "@/components/search/search-results";
import { SearchFiltersComponent } from "@/components/search/search-filters";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUrlSearchState } from "@/hooks/ui/use-url-search-state";
import { useFlightSearch } from "@/hooks/api/use-flights";
import { FlightOffer } from "@/types/api/flight";
import { SortOption } from "@/types/api/common";
import { isValidSearchParams } from "@/lib/utils/url-params";
import { Edit } from "lucide-react";
import { toast } from "sonner";

export default function FlightSearchPage() {
  const {
    searchParams,
    isValidSearch,
    filters,
    sort,
    updateFilters,
  } = useUrlSearchState();
  
  const flightSearch = useFlightSearch();
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [searchResults, setSearchResults] = useState(flightSearch.data);

  // Perform search when valid search parameters are available
  useEffect(() => {
    if (isValidSearch && isValidSearchParams(searchParams)) {
      const performSearch = async () => {
        try {
          toast.loading("Searching for flights...", { id: "flight-search" });
          const results = await flightSearch.mutateAsync(searchParams);
          setSearchResults(results);
          toast.success(`Found ${results.meta.count} flights`, { id: "flight-search" });
        } catch (error) {
          console.error("Search failed:", error);
          toast.error("Search failed. Please try again.", { id: "flight-search" });
        }
      };

      performSearch();
    }
  }, [searchParams, isValidSearch, flightSearch]);

  const handleSortChange = (newSort: SortOption) => {
    updateFilters(filters, newSort, 1, true);
  };

  const handleFiltersChange = (newFilters: Record<string, unknown>) => {
    updateFilters(newFilters, sort, 1, true);
  };

  const handleFlightSelect = (flight: FlightOffer) => {
    // Navigate to booking page with flight details
    console.log("Selected flight:", flight);
    toast.success("Flight selected! Redirecting to booking...");
    // TODO: Navigate to booking page
    // router.push(`/booking?flightId=${flight.id}`);
  };

  const handleSearchUpdate = (_data: Record<string, unknown>) => {
    setShowSearchForm(false);
    // The form will handle URL updates
  };

  // Show search form if no valid search parameters
  if (!isValidSearch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Search Flights</h1>
            <p className="text-muted-foreground">
              Enter your travel details to find the best flight deals
            </p>
          </div>
          
          <FlightSearchForm 
            onSearch={handleSearchUpdate}
            redirectToResults={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/flights">Flights</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Search Results</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Search Summary */}
      <SearchSummary
        origin={searchParams.origin}
        destination={searchParams.destination}
        departureDate={searchParams.departureDate}
        returnDate={searchParams.returnDate}
        passengers={searchParams.passengers}
        tripType={searchParams.tripType}
      />

      {/* Modify Search Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setShowSearchForm(!showSearchForm)}
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Modify Search
        </Button>
      </div>

      {/* Collapsible Search Form */}
      {showSearchForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <FlightSearchForm 
              onSearch={handleSearchUpdate}
              redirectToResults={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3">
          <SearchResults
            results={searchResults}
            isLoading={flightSearch.isPending}
            error={flightSearch.error}
            sort={sort as SortOption}
            onSortChange={handleSortChange}
            onFlightSelect={handleFlightSelect}
          />
        </div>
      </div>
    </div>
  );
}
