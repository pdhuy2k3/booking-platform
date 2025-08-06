package com.pdh.hotel.viewmodel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ViewModel for Storefront hotel display
 * Contains computed fields and formatted data for UI consumption
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontHotelViewModel {
    
    /**
     * Basic hotel information
     */
    private String hotelId;
    private String name;
    private String address;
    private String city;
    private Integer starRating;
    private String description;
    
    /**
     * Location information
     */
    private String neighborhood;
    private Double distanceFromCenter;
    private String distanceText;
    private String locationDescription;
    
    /**
     * Pricing information
     */
    private Double pricePerNight;
    private String currency;
    private String formattedPrice;
    private Double totalPrice;
    private String formattedTotalPrice;
    private String priceDescription;
    
    /**
     * Room information
     */
    private Integer availableRooms;
    private String roomAvailabilityStatus;
    private String bestRoomType;
    private Double bestRoomPrice;
    
    /**
     * Ratings and reviews
     */
    private Double overallRating;
    private Integer totalReviews;
    private String ratingText;
    private String ratingDescription;
    
    /**
     * Hotel features
     */
    private List<String> amenities;
    private List<String> highlights;
    private String mainImage;
    private List<String> images;
    
    /**
     * Booking features
     */
    private Boolean freeCancellation;
    private Boolean breakfastIncluded;
    private Boolean wifiIncluded;
    private Boolean parkingIncluded;
    
    // Computed UI fields
    
    /**
     * Hotel quality score (1-5 stars)
     */
    private Integer qualityScore;
    
    /**
     * Price competitiveness (Low, Medium, High)
     */
    private String priceLevel;
    
    /**
     * Location convenience score
     */
    private String locationScore;
    
    /**
     * Recommended badge (if applicable)
     */
    private String recommendedBadge;
    
    /**
     * Booking urgency message
     */
    private String urgencyMessage;
    
    /**
     * Star rating display (★★★★☆)
     */
    private String starDisplay;
    
    /**
     * Helper method to calculate room availability status
     */
    public String calculateRoomAvailabilityStatus() {
        if (availableRooms == null || availableRooms <= 0) {
            return "Sold Out";
        } else if (availableRooms <= 3) {
            return "Limited";
        } else {
            return "Available";
        }
    }
    
    /**
     * Helper method to calculate quality score
     */
    public Integer calculateQualityScore() {
        int score = starRating != null ? starRating : 3;
        
        // Adjust based on amenities
        if (amenities != null) {
            if (amenities.contains("Pool")) score++;
            if (amenities.contains("Spa")) score++;
            if (amenities.contains("Gym")) score++;
        }
        
        // Adjust based on features
        if (Boolean.TRUE.equals(wifiIncluded)) score++;
        if (Boolean.TRUE.equals(breakfastIncluded)) score++;
        if (Boolean.TRUE.equals(freeCancellation)) score++;
        
        // Adjust based on rating
        if (overallRating != null && overallRating >= 4.5) score++;
        
        return Math.min(5, Math.max(1, score));
    }
    
    /**
     * Helper method to determine location score
     */
    public String calculateLocationScore() {
        if (distanceFromCenter == null) return "Good";
        
        if (distanceFromCenter <= 1.0) return "Excellent";
        if (distanceFromCenter <= 3.0) return "Very Good";
        if (distanceFromCenter <= 5.0) return "Good";
        return "Fair";
    }
    
    /**
     * Helper method to generate star display
     */
    public String calculateStarDisplay() {
        if (starRating == null) return "☆☆☆☆☆";
        
        StringBuilder stars = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            if (i <= starRating) {
                stars.append("★");
            } else {
                stars.append("☆");
            }
        }
        return stars.toString();
    }
    
    /**
     * Helper method to determine price level
     */
    public String calculatePriceLevel() {
        if (pricePerNight == null) return "Medium";
        
        if (pricePerNight < 1000000) return "Low";
        if (pricePerNight < 3000000) return "Medium";
        return "High";
    }
    
    /**
     * Helper method to get rating text
     */
    public String calculateRatingText() {
        if (overallRating == null) return "No Rating";
        
        if (overallRating >= 4.5) return "Excellent";
        if (overallRating >= 4.0) return "Very Good";
        if (overallRating >= 3.5) return "Good";
        if (overallRating >= 3.0) return "Fair";
        return "Poor";
    }
}
