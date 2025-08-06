package com.pdh.hotel.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for hotel search requests
 * Used for both storefront and backoffice hotel searches
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelSearchRequestDto {
    
    /**
     * Destination city or area
     */
    @NotBlank(message = "Destination is required")
    private String destination;
    
    /**
     * Check-in date
     */
    @NotNull(message = "Check-in date is required")
    @Future(message = "Check-in date must be in the future")
    private LocalDate checkInDate;
    
    /**
     * Check-out date
     */
    @NotNull(message = "Check-out date is required")
    @Future(message = "Check-out date must be in the future")
    private LocalDate checkOutDate;
    
    /**
     * Number of guests
     */
    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "At least 1 guest is required")
    private Integer guests;
    
    /**
     * Number of rooms
     */
    @NotNull(message = "Number of rooms is required")
    @Min(value = 1, message = "At least 1 room is required")
    private Integer rooms;
    
    // Optional search filters
    
    /**
     * Minimum price per night
     */
    private Double minPrice;
    
    /**
     * Maximum price per night
     */
    private Double maxPrice;
    
    /**
     * Minimum star rating
     */
    private Integer minStarRating;
    
    /**
     * Maximum star rating
     */
    private Integer maxStarRating;
    
    /**
     * Required amenities
     */
    private List<String> amenities;
    
    /**
     * Property types (Hotel, Resort, Apartment, etc.)
     */
    private List<String> propertyTypes;
    
    /**
     * Maximum distance from city center (in km)
     */
    private Double maxDistanceFromCenter;
    
    /**
     * Minimum guest rating
     */
    private Double minGuestRating;
    
    /**
     * Free cancellation required
     */
    private Boolean freeCancellation;
    
    /**
     * Breakfast included required
     */
    private Boolean breakfastIncluded;
    
    /**
     * Specific neighborhood or area
     */
    private String neighborhood;
    
    /**
     * Sort by criteria (price, rating, distance, popularity)
     */
    @Builder.Default
    private String sortBy = "price";
    
    /**
     * Sort order (asc, desc)
     */
    @Builder.Default
    private String sortOrder = "asc";
    
    /**
     * Page number for pagination
     */
    @Builder.Default
    private Integer page = 1;
    
    /**
     * Number of results per page
     */
    @Builder.Default
    private Integer limit = 20;
    
    /**
     * Currency preference for pricing
     */
    @Builder.Default
    private String currency = "VND";
}
