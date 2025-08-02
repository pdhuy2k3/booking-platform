"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { searchFormSchema } from "@/lib/utils/validation";
import { useFlightSearch } from "@/hooks/api/use-flights";
import { FlightSearchRequest } from "@/types/api/flight";
import { useUrlSearchState } from "@/hooks/ui/use-url-search-state";
import { toast } from "sonner";

type SearchFormData = z.infer<typeof searchFormSchema>;

interface FlightSearchFormProps {
  className?: string;
  onSearch?: (data: SearchFormData) => void;
  redirectToResults?: boolean; // Whether to redirect to search results page
}

export function FlightSearchForm({
  className,
  onSearch,
  redirectToResults = false
}: FlightSearchFormProps) {
  const router = useRouter();
  const { searchParams, updateSearchParams, resetToSearch } = useUrlSearchState();
  const flightSearch = useFlightSearch();

  // Initialize trip type from URL params or default
  const [tripType, setTripType] = useState<"one-way" | "round-trip">(
    searchParams.tripType || "round-trip"
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      tripType: "round-trip",
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      class: "economy",
    },
  });

  // Update form when URL parameters change
  useEffect(() => {
    if (searchParams.origin || searchParams.destination) {
      const formData: Partial<SearchFormData> = {
        origin: searchParams.origin || "",
        destination: searchParams.destination || "",
        departureDate: searchParams.departureDate || "",
        returnDate: searchParams.returnDate || "",
        tripType: searchParams.tripType || "round-trip",
        class: searchParams.class || "economy",
        passengers: {
          adults: searchParams.passengers?.adults || 1,
          children: searchParams.passengers?.children || 0,
          infants: searchParams.passengers?.infants || 0,
        },
      };

      reset(formData);
      setTripType(formData.tripType!);
    }
  }, [searchParams, reset]);

  const onSubmit = async (data: SearchFormData) => {
    try {
      const searchRequest: FlightSearchRequest = {
        origin: data.origin,
        destination: data.destination,
        departureDate: data.departureDate,
        returnDate: data.returnDate,
        passengers: data.passengers,
        class: data.class,
        tripType: data.tripType,
      };

      // Update URL with search parameters
      if (redirectToResults) {
        // Navigate to search results page with parameters
        const searchUrlParams = new URLSearchParams();
        searchUrlParams.set("from", encodeURIComponent(searchRequest.origin));
        searchUrlParams.set("to", encodeURIComponent(searchRequest.destination));
        searchUrlParams.set("depart", searchRequest.departureDate);
        if (searchRequest.returnDate) {
          searchUrlParams.set("return", searchRequest.returnDate);
        }
        searchUrlParams.set("adults", searchRequest.passengers.adults.toString());
        searchUrlParams.set("children", searchRequest.passengers.children.toString());
        searchUrlParams.set("infants", searchRequest.passengers.infants.toString());
        searchUrlParams.set("class", searchRequest.class);
        searchUrlParams.set("type", searchRequest.tripType);

        router.push(`/flights/search?${searchUrlParams.toString()}`);
      } else {
        // Update current page URL with search parameters
        updateSearchParams(searchRequest, true);
      }

      // Perform the search
      toast.loading("Searching for flights...", { id: "flight-search" });
      const results = await flightSearch.mutateAsync(searchRequest);
      toast.success("Flights found!", { id: "flight-search" });
      console.log("Search results:", results);
      onSearch?.(data);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed. Please try again.", { id: "flight-search" });
    }
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Find Your Perfect Flight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Trip Type */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={tripType === "round-trip" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setTripType("round-trip");
                setValue("tripType", "round-trip");
              }}
            >
              Round Trip
            </Button>
            <Button
              type="button"
              variant={tripType === "one-way" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setTripType("one-way");
                setValue("tripType", "one-way");
              }}
            >
              One Way
            </Button>
          </div>

          {/* Origin and Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="origin" className="text-sm font-medium">
                From
              </label>
              <Input
                id="origin"
                placeholder="Origin city or airport"
                {...register("origin")}
                className={errors.origin ? "border-destructive" : ""}
              />
              {errors.origin && (
                <p className="text-sm text-destructive">{errors.origin.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="destination" className="text-sm font-medium">
                To
              </label>
              <Input
                id="destination"
                placeholder="Destination city or airport"
                {...register("destination")}
                className={errors.destination ? "border-destructive" : ""}
              />
              {errors.destination && (
                <p className="text-sm text-destructive">{errors.destination.message}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="departureDate" className="text-sm font-medium">
                Departure Date
              </label>
              <Input
                id="departureDate"
                type="date"
                {...register("departureDate")}
                className={errors.departureDate ? "border-destructive" : ""}
              />
              {errors.departureDate && (
                <p className="text-sm text-destructive">{errors.departureDate.message}</p>
              )}
            </div>
            {tripType === "round-trip" && (
              <div className="space-y-2">
                <label htmlFor="returnDate" className="text-sm font-medium">
                  Return Date
                </label>
                <Input
                  id="returnDate"
                  type="date"
                  {...register("returnDate")}
                  className={errors.returnDate ? "border-destructive" : ""}
                />
                {errors.returnDate && (
                  <p className="text-sm text-destructive">{errors.returnDate.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Passengers and Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Passengers</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    placeholder="Adults"
                    {...register("passengers.adults", { valueAsNumber: true })}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="9"
                    placeholder="Children"
                    {...register("passengers.children", { valueAsNumber: true })}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="9"
                    placeholder="Infants"
                    {...register("passengers.infants", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="class" className="text-sm font-medium">
                Class
              </label>
              <select
                id="class"
                {...register("class")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="economy">Economy</option>
                <option value="premium-economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting || flightSearch.isPending}
          >
            {isSubmitting || flightSearch.isPending ? "Searching..." : "Search Flights"}
          </Button>

          {flightSearch.error && (
            <div className="text-sm text-destructive text-center">
              Search failed. Please try again.
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
