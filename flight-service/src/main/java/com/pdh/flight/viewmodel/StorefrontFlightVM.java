package com.pdh.flight.viewmodel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ViewModel for Storefront flight display
 * Contains computed fields and formatted data for UI consumption
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontFlightVM {
    
    /**
     * Basic flight information
     */
    private String flightId;
    private String flightNumber;
    private String airline;
    private String airlineLogo;
    
    /**
     * Route information
     */
    private String origin;
    private String destination;
    private String originName;
    private String destinationName;
    private String routeDescription; // "HAN → SGN"
    
    /**
     * Schedule information
     */
    private String departureTime;
    private String arrivalTime;
    private String duration;
    private String scheduleDescription; // "08:00 - 10:30 (2h 30m)"
    
    /**
     * Pricing information
     */
    private Double price;
    private String currency;
    private String formattedPrice;
    private String priceDescription; // "From 2,500,000 VND"
    
    /**
     * Seat information
     */
    private String seatClass;
    private Integer availableSeats;
    private String availabilityStatus; // "Available", "Limited", "Sold Out"
    private String availabilityColor; // CSS color class
    
    /**
     * Flight features
     */
    private List<String> amenities;
    private List<String> highlights; // Key selling points
    private String baggageInfo;
    private Boolean wifiAvailable;
    private Boolean mealIncluded;
    
    /**
     * Booking information
     */
    private Boolean refundable;
    private Boolean changeable;
    private String fareType;
    private String bookingClass;
    
    // Computed UI fields
    
    /**
     * Flight quality score (1-5 stars)
     */
    private Integer qualityScore;
    
    /**
     * Price competitiveness (Low, Medium, High)
     */
    private String priceLevel;
    
    /**
     * Departure time category (Early Morning, Morning, Afternoon, Evening, Night)
     */
    private String departureCategory;
    
    /**
     * Flight duration category (Short, Medium, Long)
     */
    private String durationCategory;
    
    /**
     * Recommended badge (if applicable)
     */
    private String recommendedBadge; // "Best Price", "Fastest", "Most Popular"
    
    /**
     * Booking urgency message
     */
    private String urgencyMessage; // "Only 3 seats left!", "Book now!"
    
    /**
     * Helper method to calculate availability status
     */
    public String calculateAvailabilityStatus() {
        if (availableSeats == null || availableSeats <= 0) {
            return "Sold Out";
        } else if (availableSeats <= 5) {
            return "Limited";
        } else {
            return "Available";
        }
    }
    
    /**
     * Helper method to determine availability color
     */
    public String calculateAvailabilityColor() {
        String status = calculateAvailabilityStatus();
        return switch (status) {
            case "Available" -> "text-green-600";
            case "Limited" -> "text-orange-600";
            case "Sold Out" -> "text-red-600";
            default -> "text-gray-600";
        };
    }
    
    /**
     * Helper method to calculate quality score
     */
    public Integer calculateQualityScore() {
        int score = 3; // Base score
        
        // Adjust based on amenities
        if (amenities != null) {
            if (amenities.contains("WiFi")) score++;
            if (amenities.contains("Entertainment")) score++;
            if (amenities.contains("Premium Meal")) score++;
        }
        
        // Adjust based on flight features
        if (Boolean.TRUE.equals(wifiAvailable)) score++;
        if (Boolean.TRUE.equals(mealIncluded)) score++;
        
        // Adjust based on flexibility
        if (Boolean.TRUE.equals(refundable)) score++;
        if (Boolean.TRUE.equals(changeable)) score++;
        
        return Math.min(5, Math.max(1, score));
    }
    
    /**
     * Helper method to determine departure category
     */
    public String calculateDepartureCategory() {
        if (departureTime == null) return "Unknown";
        
        String[] timeParts = departureTime.split(":");
        if (timeParts.length < 2) return "Unknown";
        
        try {
            int hour = Integer.parseInt(timeParts[0]);
            
            if (hour >= 5 && hour < 9) return "Early Morning";
            if (hour >= 9 && hour < 12) return "Morning";
            if (hour >= 12 && hour < 17) return "Afternoon";
            if (hour >= 17 && hour < 21) return "Evening";
            return "Night";
        } catch (NumberFormatException e) {
            return "Unknown";
        }
    }
    
    /**
     * Helper method to determine duration category
     */
    public String calculateDurationCategory() {
        if (duration == null) return "Unknown";
        
        // Extract hours from duration string (e.g., "2h 30m")
        try {
            String[] parts = duration.split("h");
            if (parts.length > 0) {
                int hours = Integer.parseInt(parts[0].trim());
                
                if (hours < 2) return "Short";
                if (hours < 4) return "Medium";
                return "Long";
            }
        } catch (NumberFormatException e) {
            // Ignore and return default
        }
        
        return "Medium";
    }
}
