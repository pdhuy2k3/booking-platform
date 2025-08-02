import { api } from "@/lib/api/client";
import { 
  PackageSearchRequest, 
  PackageSearchResponse, 
  PackageBookingRequest, 
  PackageBookingResponse,
  PackageOffer 
} from "@/types/api/package";
import { FlightService } from "./flight-service";
import { HotelService } from "./hotel-service";
import { ApiResponse } from "@/types/api/common";

export class PackageService {
  private static readonly BASE_PATH = "/api/packages";

  /**
   * Search for travel packages (flight + hotel combinations)
   */
  static async searchPackages(
    searchParams: PackageSearchRequest
  ): Promise<PackageSearchResponse> {
    try {
      // For now, we'll combine flight and hotel searches to create packages
      // In a real implementation, this would be a dedicated package search API
      
      // Search flights
      const flightSearchParams = {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate,
        passengers: searchParams.passengers,
        class: searchParams.preferences?.flightClass || "economy"
      };

      // Search hotels
      const hotelSearchParams = {
        destination: searchParams.destination,
        checkInDate: searchParams.departureDate,
        checkOutDate: searchParams.returnDate,
        rooms: searchParams.rooms
      };

      // Execute both searches in parallel
      const [flightResults, hotelResults] = await Promise.all([
        FlightService.searchFlights(flightSearchParams).catch(() => ({ flights: [], totalCount: 0 })),
        HotelService.searchHotels(hotelSearchParams).catch(() => ({ hotels: [], totalCount: 0 }))
      ]);

      // Combine results to create packages
      const packages: PackageOffer[] = [];
      
      // Create packages by combining flights and hotels
      const maxPackages = Math.min(10, Math.max(flightResults.flights?.length || 0, hotelResults.hotels?.length || 0));
      
      for (let i = 0; i < maxPackages; i++) {
        const flight = flightResults.flights?.[i % (flightResults.flights?.length || 1)];
        const hotel = hotelResults.hotels?.[i % (hotelResults.hotels?.length || 1)];
        
        if (flight && hotel) {
          const flightPrice = flight.pricing.totalPrice.amount;
          const hotelPrice = hotel.pricing.totalPrice.amount;
          const packageDiscount = Math.floor((flightPrice + hotelPrice) * 0.1); // 10% discount
          const totalPrice = flightPrice + hotelPrice - packageDiscount;

          packages.push({
            id: `package-${i + 1}`,
            type: "flight_hotel",
            title: `${searchParams.origin} to ${searchParams.destination} Package`,
            description: `Complete travel package including flights and accommodation`,
            components: {
              flight: flight,
              hotel: hotel,
              activities: [],
              carRental: undefined
            },
            pricing: {
              flightPrice: {
                amount: flightPrice,
                currency: "VND"
              },
              hotelPrice: {
                amount: hotelPrice,
                currency: "VND"
              },
              totalPrice: {
                amount: totalPrice,
                currency: "VND"
              },
              savings: {
                amount: packageDiscount,
                currency: "VND"
              },
              breakdown: [
                {
                  item: "Flight",
                  amount: flightPrice,
                  currency: "VND"
                },
                {
                  item: "Hotel",
                  amount: hotelPrice,
                  currency: "VND"
                },
                {
                  item: "Package Discount",
                  amount: -packageDiscount,
                  currency: "VND"
                }
              ]
            },
            duration: {
              days: Math.ceil((new Date(searchParams.returnDate).getTime() - new Date(searchParams.departureDate).getTime()) / (1000 * 60 * 60 * 24)),
              nights: Math.ceil((new Date(searchParams.returnDate).getTime() - new Date(searchParams.departureDate).getTime()) / (1000 * 60 * 60 * 24)) - 1
            },
            inclusions: [
              "Round-trip flights",
              "Hotel accommodation",
              "Airport transfers",
              "24/7 customer support"
            ],
            exclusions: [
              "Meals (unless specified)",
              "Travel insurance",
              "Personal expenses",
              "Optional activities"
            ],
            policies: {
              cancellation: "Free cancellation up to 48 hours before departure",
              modification: "Changes allowed with fees",
              payment: "Full payment required at booking"
            },
            availability: {
              available: true,
              packagesLeft: Math.floor(Math.random() * 5) + 1
            }
          });
        }
      }

      return {
        packages,
        totalCount: packages.length,
        filters: {
          priceRange: { min: 2000000, max: 20000000 },
          packageTypes: ["flight_hotel", "flight_hotel_car", "all_inclusive"],
          duration: { min: 2, max: 14 },
          starRatings: [3, 4, 5],
          themes: ["Beach", "City", "Adventure", "Cultural", "Luxury"]
        },
        searchId: `package-search-${Date.now()}`
      };
    } catch (error) {
      console.error("Package search failed:", error);
      throw error;
    }
  }

  /**
   * Get package details by ID
   */
  static async getPackageDetails(packageId: string): Promise<PackageOffer> {
    try {
      const response = await api.get<ApiResponse<PackageOffer>>(
        `${this.BASE_PATH}/${packageId}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get package details:", error);
      throw error;
    }
  }

  /**
   * Book a travel package
   */
  static async bookPackage(
    bookingData: PackageBookingRequest
  ): Promise<PackageBookingResponse> {
    try {
      const response = await api.post<ApiResponse<PackageBookingResponse>>(
        `${this.BASE_PATH}/book`,
        bookingData
      );
      return response.data;
    } catch (error) {
      console.error("Package booking failed:", error);
      throw error;
    }
  }

  /**
   * Get popular packages for a destination
   */
  static async getPopularPackages(destination?: string): Promise<PackageOffer[]> {
    try {
      const response = await api.get<ApiResponse<PackageOffer[]>>(
        `${this.BASE_PATH}/popular`,
        destination ? { params: { destination } } : undefined
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get popular packages:", error);
      throw error;
    }
  }
}
