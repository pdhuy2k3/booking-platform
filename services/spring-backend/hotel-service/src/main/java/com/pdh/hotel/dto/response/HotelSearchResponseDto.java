package com.pdh.hotel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for hotel search response
 * Contains paginated hotel results and metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelSearchResponseDto {
    
    /**
     * List of hotel search results
     */
    private List<HotelSearchResultDto> hotels;
    
    /**
     * Total number of hotels found
     */
    private Long totalCount;
    
    /**
     * Current page number
     */
    private Integer page;
    
    /**
     * Number of results per page
     */
    private Integer limit;
    
    /**
     * Whether there are more results available
     */
    private Boolean hasMore;
    
    /**
     * Search filters and metadata
     */
    private SearchFilters filters;
    
    /**
     * Nested class for search filters and available options
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchFilters {
        
        /**
         * Price range information
         */
        private PriceRange priceRange;
        
        /**
         * Available star ratings
         */
        private List<Integer> starRatings;
        
        /**
         * Available amenities
         */
        private List<String> amenities;
        
        /**
         * Available property types
         */
        private List<String> propertyTypes;
        
        /**
         * Available neighborhoods
         */
        private List<String> neighborhoods;
        
        /**
         * Guest rating range
         */
        private RatingRange guestRatingRange;
        
        /**
         * Distance range from city center
         */
        private DistanceRange distanceRange;
    }
    
    /**
     * Nested class for price range
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceRange {
        private Double min;
        private Double max;
        private String currency;
    }
    
    /**
     * Nested class for rating range
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingRange {
        private Double min;
        private Double max;
    }
    
    /**
     * Nested class for distance range
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DistanceRange {
        private Double min; // in km
        private Double max; // in km
    }
}
