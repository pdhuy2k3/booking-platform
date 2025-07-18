package com.pdh.hotel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for individual hotel search result
 * Frontend-compatible with string IDs and double prices
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelSearchResultDto {
    
    /**
     * Hotel identifier (string for frontend compatibility)
     */
    private String hotelId;
    
    /**
     * Basic hotel information
     */
    private String name;
    private String address;
    private String city;
    private String country;
    private Integer starRating;
    private String description;
    
    /**
     * Location information
     */
    private LocationInfo location;
    
    /**
     * Pricing information (frontend-compatible)
     */
    private Double pricePerNight;
    private String currency;
    private String formattedPrice; // Formatted price with currency symbol
    private Double totalPrice; // Total for entire stay
    private String formattedTotalPrice;
    
    /**
     * Room availability
     */
    private List<RoomInfo> availableRooms;
    private Integer totalAvailableRooms;
    
    /**
     * Hotel amenities and features
     */
    private List<String> amenities;
    private List<String> highlights; // Key selling points
    
    /**
     * Images and media
     */
    private List<String> images;
    private String mainImage;
    
    /**
     * Ratings and reviews
     */
    private RatingInfo ratings;
    
    /**
     * Policies and information
     */
    private PolicyInfo policies;
    
    /**
     * Booking information
     */
    private Boolean freeCancellation;
    private Boolean breakfastIncluded;
    private Boolean wifiIncluded;
    private Boolean parkingIncluded;
    
    /**
     * Nested class for location information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationInfo {
        private Double latitude;
        private Double longitude;
        private String neighborhood;
        private Double distanceFromCenter; // in km
        private String distanceFromCenterText; // "2.5 km from city center"
        private List<NearbyAttraction> nearbyAttractions;
    }
    
    /**
     * Nested class for nearby attractions
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NearbyAttraction {
        private String name;
        private String type; // Restaurant, Shopping, Tourist Attraction, etc.
        private Double distance; // in km
        private String walkingTime; // "5 min walk"
    }
    
    /**
     * Nested class for room information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomInfo {
        private String roomId;
        private String roomType;
        private String bedType;
        private Integer capacity;
        private Double pricePerNight;
        private String currency;
        private String formattedPrice;
        private List<String> amenities;
        private Boolean available;
        private Integer availableCount;
        private String description;
        private List<String> images;
    }
    
    /**
     * Nested class for rating information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingInfo {
        private Double overallRating;
        private Integer totalReviews;
        private String ratingText; // "Excellent", "Very Good", etc.
        private RatingBreakdown breakdown;
    }
    
    /**
     * Nested class for rating breakdown
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingBreakdown {
        private Double cleanliness;
        private Double comfort;
        private Double location;
        private Double service;
        private Double facilities;
        private Double valueForMoney;
    }
    
    /**
     * Nested class for policy information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PolicyInfo {
        private String checkInTime;
        private String checkOutTime;
        private String cancellationPolicy;
        private String childrenPolicy;
        private String petPolicy;
        private String smokingPolicy;
        private List<String> importantInfo;
    }
}
