import { api } from "@/lib/api/client";
import { 
  HotelSearchRequest, 
  HotelSearchResponse, 
  HotelBookingRequest, 
  HotelBookingResponse,
  HotelOffer 
} from "@/types/api/hotel";
import { ApiResponse } from "@/types/api/common";

export class HotelService {
  private static readonly BASE_PATH = "/api/hotels";

  /**
   * Search for hotels based on criteria
   */
  static async searchHotels(
    searchParams: HotelSearchRequest
  ): Promise<HotelSearchResponse> {
    try {
      // Convert frontend search params to backend API format
      const apiParams = {
        destination: searchParams.destination,
        checkInDate: searchParams.checkInDate,
        checkOutDate: searchParams.checkOutDate,
        guests: searchParams.rooms.reduce((total, room) => total + room.adults + room.children, 0),
        rooms: searchParams.rooms.length,
        page: 1,
        limit: 20
      };

      const response = await api.get<any>(
        `${this.BASE_PATH}/storefront/search`,
        { params: apiParams }
      );

      // Transform backend response to frontend format
      const hotels = response.hotels.map((hotel: any) => ({
        id: hotel.id,
        name: hotel.name,
        description: hotel.description,
        location: {
          address: hotel.address,
          city: hotel.city,
          country: hotel.country,
          coordinates: hotel.coordinates
        },
        starRating: hotel.starRating,
        images: hotel.images || [],
        amenities: hotel.amenities || [],
        rooms: hotel.rooms || [],
        pricing: {
          basePrice: {
            amount: hotel.basePrice || 0,
            currency: "VND"
          },
          totalPrice: {
            amount: hotel.totalPrice || hotel.basePrice || 0,
            currency: "VND"
          },
          taxes: {
            amount: hotel.taxes || 0,
            currency: "VND"
          }
        },
        availability: {
          available: hotel.available !== false,
          roomsLeft: hotel.roomsLeft || 10
        },
        policies: {
          cancellation: hotel.cancellationPolicy || "Free cancellation until 24 hours before check-in",
          checkIn: hotel.checkInTime || "15:00",
          checkOut: hotel.checkOutTime || "11:00"
        },
        rating: {
          score: hotel.rating || hotel.starRating * 2,
          reviewCount: hotel.reviewCount || 0,
          reviews: []
        }
      }));

      return {
        hotels,
        totalCount: response.totalCount || hotels.length,
        filters: response.filters || {
          priceRange: { min: 500000, max: 5000000 },
          starRatings: [3, 4, 5],
          amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar"],
          propertyTypes: ["Hotel", "Resort", "Apartment"],
          neighborhoods: ["District 1", "District 3", "District 7"]
        },
        searchId: `hotel-search-${Date.now()}`
      };
    } catch (error) {
      console.error("Hotel search failed:", error);
      throw error;
    }
  }

  /**
   * Get hotel details by ID
   */
  static async getHotelDetails(hotelId: string): Promise<HotelOffer> {
    try {
      const response = await api.get<ApiResponse<HotelOffer>>(
        `${this.BASE_PATH}/storefront/${hotelId}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get hotel details:", error);
      throw error;
    }
  }

  /**
   * Book a hotel
   */
  static async bookHotel(
    bookingData: HotelBookingRequest
  ): Promise<HotelBookingResponse> {
    try {
      const response = await api.post<ApiResponse<HotelBookingResponse>>(
        `${this.BASE_PATH}/book`,
        bookingData
      );
      return response.data;
    } catch (error) {
      console.error("Hotel booking failed:", error);
      throw error;
    }
  }

  /**
   * Get available rooms for a hotel
   */
  static async getAvailableRooms(
    hotelId: string,
    checkInDate: string,
    checkOutDate: string,
    guests: number
  ): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `${this.BASE_PATH}/storefront/${hotelId}/rooms`,
        {
          params: {
            checkInDate,
            checkOutDate,
            guests
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get available rooms:", error);
      throw error;
    }
  }
}
